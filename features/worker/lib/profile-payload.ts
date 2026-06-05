import type {
  PutWorkerProfileBody,
  WorkerEducation,
  WorkerWorkHistory,
} from "@/features/worker/types/worker-portal";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isClientTempId(id: string): boolean {
  return /^(work|education)-\d+$/.test(id);
}

/** Normalize to `YYYY-MM-DD` for API validation and `<input type="date">`. */
export function toIsoDateOnly(value: unknown): string | undefined {
  if (value == null || value === "") return undefined;
  const raw = String(value).trim();
  if (!raw) return undefined;
  if (ISO_DATE.test(raw)) return raw;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10);
}

/** Value for `<input type="date">` from API date strings. */
export function toDateInputValue(value: unknown): string {
  return toIsoDateOnly(value) ?? "";
}

const MONTH_INDEX: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

function legacyDateFromParts(year?: unknown, month?: unknown): string | undefined {
  const y = Number(year);
  if (!Number.isFinite(y) || y < 1900) return undefined;

  let m = 1;
  if (typeof month === "string" && month.trim()) {
    const key = month.trim().toLowerCase();
    if (MONTH_INDEX[key] != null) m = MONTH_INDEX[key]!;
    else {
      const parsed = Number.parseInt(key, 10);
      if (parsed >= 1 && parsed <= 12) m = parsed;
    }
  } else if (typeof month === "number" && month >= 1 && month <= 12) {
    m = month;
  }

  return `${y}-${String(m).padStart(2, "0")}-01`;
}

function asRecord(entry: WorkerWorkHistory | WorkerEducation): Record<string, unknown> {
  return entry as Record<string, unknown>;
}

function resolveStartDate(entry: Record<string, unknown>): string | undefined {
  return toIsoDateOnly(entry.startDate) ?? legacyDateFromParts(entry.startYear, entry.startMonth);
}

function resolveEndDate(entry: Record<string, unknown>): string | undefined {
  return toIsoDateOnly(entry.endDate) ?? legacyDateFromParts(entry.endYear, entry.endMonth);
}

export function sanitizeWorkHistoryForPut(entry: WorkerWorkHistory): Record<string, unknown> {
  const raw = asRecord(entry);
  const startDate = resolveStartDate(raw);
  if (!startDate) {
    throw new Error("Each work history entry needs a valid start date.");
  }

  const companyName = String(entry.companyName ?? raw.company ?? "").trim();
  const jobTitle = String(entry.jobTitle ?? raw.role ?? "").trim();
  if (!companyName || !jobTitle) {
    throw new Error("Each work history entry needs a company and job title.");
  }

  const endDate = resolveEndDate(raw);
  const isCurrent =
    typeof entry.isCurrent === "boolean" ? entry.isCurrent : endDate == null;

  if (!isCurrent && !endDate) {
    throw new Error("Each past role needs a valid end date, or mark it as your current role.");
  }

  const payload: Record<string, unknown> = {
    companyName,
    jobTitle,
    startDate,
    isCurrent: isCurrent || !endDate,
  };

  const id = entry.id ? String(entry.id) : "";
  if (id && !isClientTempId(id)) {
    payload.id = id;
  }

  if (endDate && !payload.isCurrent) {
    payload.endDate = endDate;
  }

  const description = typeof entry.description === "string" ? entry.description.trim() : "";
  if (description) payload.description = description;

  return payload;
}

export function sanitizeEducationForPut(entry: WorkerEducation): Record<string, unknown> {
  const raw = asRecord(entry);
  const startDate = resolveStartDate(raw);
  if (!startDate) {
    throw new Error("Each education entry needs a valid start date.");
  }

  const institution = String(entry.institution ?? raw.school ?? "").trim();
  const degree = String(entry.degree ?? "").trim();
  if (!institution || !degree) {
    throw new Error("Each education entry needs an institution and degree.");
  }

  const endDate = resolveEndDate(raw);
  const isCurrent =
    typeof entry.isCurrent === "boolean" ? entry.isCurrent : endDate == null;

  if (!isCurrent && !endDate) {
    throw new Error("Each completed education entry needs a valid end date, or mark it as in progress.");
  }

  const payload: Record<string, unknown> = {
    institution,
    degree,
    startDate,
    isCurrent: isCurrent || !endDate,
  };

  const id = entry.id ? String(entry.id) : "";
  if (id && !isClientTempId(id)) {
    payload.id = id;
  }

  if (endDate && !payload.isCurrent) {
    payload.endDate = endDate;
  }

  const fieldOfStudy = typeof entry.fieldOfStudy === "string" ? entry.fieldOfStudy.trim() : "";
  if (fieldOfStudy) payload.fieldOfStudy = fieldOfStudy;

  return payload;
}

export function buildWorkHistoriesForPut(entries: WorkerWorkHistory[]): Record<string, unknown>[] {
  return entries.map((entry) => sanitizeWorkHistoryForPut(entry));
}

export function buildEducationsForPut(entries: WorkerEducation[]): Record<string, unknown>[] {
  return entries.map((entry) => sanitizeEducationForPut(entry));
}

export function sanitizePutWorkerProfileBody(body: PutWorkerProfileBody): PutWorkerProfileBody {
  const next: PutWorkerProfileBody = { ...body };

  if (body.workHistories) {
    next.workHistories = buildWorkHistoriesForPut(body.workHistories) as unknown as WorkerWorkHistory[];
  }

  if (body.educations) {
    next.educations = buildEducationsForPut(body.educations) as unknown as WorkerEducation[];
  }

  return next;
}
