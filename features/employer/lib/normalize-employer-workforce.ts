import type { EmployerWorkforceList, EmployerWorkforceListItem } from "@/features/employer/types/employer-portal";
import { normalizePaginated } from "@/lib/http/normalize-paginated";

type RawWorkforceRow = Record<string, unknown>;

function nestedJobRecord(raw: RawWorkforceRow): Record<string, unknown> | undefined {
  const job = raw.job;
  return job && typeof job === "object" ? (job as Record<string, unknown>) : undefined;
}

function resolveWorkforceJobType(raw: RawWorkforceRow): string | undefined {
  const nested = nestedJobRecord(raw);
  for (const candidate of [raw.jobType, raw.employmentType, nested?.employmentType, nested?.jobType]) {
    if (candidate != null && String(candidate).trim()) {
      return String(candidate).trim();
    }
  }
  return undefined;
}

function normalizeWorkforceItem(raw: RawWorkforceRow): EmployerWorkforceListItem {
  const workerId = String(raw.workerId ?? raw.id ?? "").trim();
  const workerName = String(raw.workerName ?? raw.fullName ?? raw.name ?? "Worker").trim();
  const jobTitle = raw.jobTitle != null ? String(raw.jobTitle) : undefined;
  const roleLabel = raw.roleLabel != null ? String(raw.roleLabel) : undefined;
  const startDate = raw.startDate ?? raw.dateJoined;
  const jobType = resolveWorkforceJobType(raw);
  const nested = nestedJobRecord(raw);

  return {
    ...raw,
    id: String(raw.id ?? workerId),
    workerId: workerId || undefined,
    engagementId: raw.engagementId != null ? String(raw.engagementId) : undefined,
    jobId: raw.jobId != null ? String(raw.jobId) : nested?.id != null ? String(nested.id) : undefined,
    fullName: workerName,
    name: workerName,
    role: roleLabel ?? jobTitle ?? (raw.role != null ? String(raw.role) : undefined),
    jobType,
    employmentType: jobType,
    dateJoined: startDate != null ? String(startDate) : undefined,
    status: raw.status != null ? String(raw.status) : "active",
    avatarUrl:
      typeof raw.workerPhotoUrl === "string"
        ? raw.workerPhotoUrl
        : typeof raw.avatarUrl === "string"
          ? raw.avatarUrl
          : undefined,
    job: nested,
  };
}

/** Maps v2 workforce list (`data[]`, `workerName`, `startDate`, …) to portal list shape. */
export function normalizeEmployerWorkforceList(raw: unknown): EmployerWorkforceList {
  const record = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const page = normalizePaginated<EmployerWorkforceListItem>(
    record as Parameters<typeof normalizePaginated<EmployerWorkforceListItem>>[0],
  );
  const items = page.items.map((item) => normalizeWorkforceItem(item as RawWorkforceRow));
  const stats =
    record.stats && typeof record.stats === "object"
      ? (record.stats as EmployerWorkforceList["stats"])
      : undefined;

  return {
    stats,
    items,
    total: page.total,
    page: page.page,
    limit: page.limit,
  };
}

export function normalizeEmployerWorkforceWorker(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object") return {};
  return normalizeWorkforceItem(raw as RawWorkforceRow) as Record<string, unknown>;
}
