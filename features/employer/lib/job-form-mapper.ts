import { isDepartmentUuid, toApiStartDate } from "@/features/employer/lib/job-api-fields";
import {
  inferCategoryFromJob,
  resolveDepartmentIdForCategory,
} from "@/features/employer/lib/job-categories";
import {
  employerJobDurationLabel,
  employerJobStartNow,
} from "@/features/employer/lib/employer-job-fields";
import { mergeJobDepartments } from "@/features/employer/lib/job-departments";
import type { CreateEmployerJobBody, EmployerJobDetail, EmployerJobDepartment } from "@/features/employer/types/employer-portal";

export type PostJobDraft = {
  title: string;
  /** Department UUID — resolved from category; not shown in UI */
  department: string;
  /** Category slug from picker */
  category: string;
  /** Free text when category is `other` */
  categoryCustom: string;
  jobType: string;
  workMode: string;
  location: string;
  pay: string;
  payPer: string;
  openings: string;
  /** ISO date `YYYY-MM-DD` when `startNow` is false */
  startDate: string;
  duration: string;
  schedule: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  requiredLevel: string;
  /** Comma-separated while editing; parsed to `requiredSkills[]` on submit */
  requiredSkillsText: string;
  startNow: boolean;
};

export const EMPTY_POST_JOB_DRAFT: PostJobDraft = {
  title: "",
  department: "",
  category: "",
  categoryCustom: "",
  jobType: "full_time",
  workMode: "onsite",
  location: "",
  pay: "",
  payPer: "monthly",
  openings: "1",
  startDate: "",
  duration: "",
  schedule: "",
  description: "",
  requirements: [""],
  responsibilities: [""],
  requiredLevel: "mid",
  requiredSkillsText: "",
  startNow: false,
};

/** Ensures every field is defined — avoids controlled→uncontrolled input warnings. */
export function normalizePostJobDraft(
  draft: Partial<PostJobDraft> & { requiredSkills?: string[] },
): PostJobDraft {
  const legacySkills = Array.isArray(draft.requiredSkills) ? draft.requiredSkills.join(", ") : "";
  return {
    title: String(draft.title ?? ""),
    department: String(draft.department ?? ""),
    category: String(draft.category ?? ""),
    categoryCustom: String(draft.categoryCustom ?? ""),
    jobType: String(draft.jobType ?? EMPTY_POST_JOB_DRAFT.jobType),
    workMode: String(draft.workMode ?? EMPTY_POST_JOB_DRAFT.workMode),
    location: String(draft.location ?? ""),
    pay: String(draft.pay ?? ""),
    payPer: String(draft.payPer ?? EMPTY_POST_JOB_DRAFT.payPer),
    openings: String(draft.openings ?? EMPTY_POST_JOB_DRAFT.openings),
    startDate: String(draft.startDate ?? ""),
    duration: String(draft.duration ?? ""),
    schedule: String(draft.schedule ?? ""),
    description: String(draft.description ?? ""),
    requirements:
      Array.isArray(draft.requirements) && draft.requirements.length > 0 ? [...draft.requirements] : [""],
    responsibilities:
      Array.isArray(draft.responsibilities) && draft.responsibilities.length > 0
        ? [...draft.responsibilities]
        : [""],
    requiredLevel: String(draft.requiredLevel ?? EMPTY_POST_JOB_DRAFT.requiredLevel),
    requiredSkillsText: String(draft.requiredSkillsText ?? legacySkills ?? ""),
    startNow: Boolean(draft.startNow),
  };
}

function parseRequiredSkillsText(raw: string): string[] {
  return raw
    .split(/[,;|]/)
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function parsePay(raw: string): number {
  const digits = raw.replace(/[^\d]/g, "");
  const n = Number(digits);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function parseLocation(raw: string): { city: string; neighbourhood: string; region?: string } {
  const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 3) {
    return { neighbourhood: parts[0] ?? "", city: parts[1] ?? "Douala", region: parts[2] };
  }
  if (parts.length === 2) {
    return { city: parts[0] ?? "Douala", neighbourhood: parts[1] ?? "" };
  }
  return { city: parts[0] ?? "Douala", neighbourhood: "" };
}

function normalizeDurationString(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "1 month";
  const match = trimmed.match(/^(\d+)\s*(\w+)/i);
  if (match) {
    return `${match[1]} ${match[2]!.toLowerCase()}`;
  }
  return trimmed;
}

function formatPayFromParts(amount?: number, currency?: string, structure?: string): string {
  if (amount == null || !Number.isFinite(amount)) return "";
  const cur = currency ?? "XAF";
  const per =
    structure === "monthly"
      ? "month"
      : structure === "hourly"
        ? "hour"
        : structure === "daily"
          ? "day"
          : structure === "weekly"
            ? "week"
            : structure?.replace(/_/g, " ") ?? "month";
  return `${Number(amount).toLocaleString("en-US")} ${cur}/${per}`;
}

export function mapDraftToCreateJobBody(
  draft: PostJobDraft,
  asDraft: boolean,
  extraDepartments?: EmployerJobDepartment[],
): CreateEmployerJobBody {
  const { city, neighbourhood, region } = parseLocation(draft.location);
  const pay = parsePay(draft.pay);
  const startNow = draft.startNow;
  const startDate = startNow ? undefined : toApiStartDate(draft.startDate);
  const departments = mergeJobDepartments(extraDepartments);
  const departmentId =
    draft.department.trim() || resolveDepartmentIdForCategory(draft.category, departments) || "";

  if (!asDraft && !isDepartmentUuid(departmentId)) {
    throw new Error("INVALID_DEPARTMENT");
  }

  const body: CreateEmployerJobBody = {
    title: draft.title.trim() || "Untitled job",
    workMode: normalizeWorkMode(draft.workMode),
    country: "Cameroon",
    region,
    city,
    neighbourhood: neighbourhood || undefined,
    description: draft.description.trim() || "Job description",
    requiredSkills: parseRequiredSkillsText(draft.requiredSkillsText),
    experienceLevel: normalizeExperienceLevel(draft.requiredLevel || "mid"),
    employmentType: normalizeEmploymentType(draft.jobType || "full_time"),
    duration: normalizeDurationString(draft.duration),
    payAmount: pay || 1,
    payCurrency: "XAF",
    payStructure: normalizePayStructure(draft.payPer || "monthly"),
    numberOfOpenings: Math.max(1, Number(draft.openings) || 1),
    startNow,
    requirements: draft.requirements.filter(Boolean),
    responsibilities: draft.responsibilities.filter(Boolean),
    paymentManagedByJoballa: true,
    asDraft,
  };

  if (isDepartmentUuid(departmentId)) {
    body.departmentId = departmentId;
  }

  if (!startNow && startDate) {
    body.startDate = startDate;
  }

  return body;
}

function normalizeEmploymentType(raw: string): string {
  const value = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (value === "temporary") return "casual";
  if (["full_time", "part_time", "contract", "casual", "seasonal", "internship"].includes(value)) return value;
  return "full_time";
}

function normalizeWorkMode(raw: string): string {
  const value = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (value === "on_site") return "onsite";
  if (["onsite", "remote", "hybrid"].includes(value)) return value;
  return "onsite";
}

function normalizePayStructure(raw: string): string {
  const value = raw.trim().toLowerCase();
  if (value === "hourly" || value.startsWith("hour")) return "hourly";
  if (value === "daily" || value.startsWith("day")) return "daily";
  if (value === "weekly" || value.startsWith("week")) return "weekly";
  if (value === "monthly" || value.startsWith("month")) return "monthly";
  if (value === "fixed") return "fixed";
  return "monthly";
}

function normalizeExperienceLevel(raw: string): string {
  const value = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (["entry", "junior", "mid", "senior", "lead", "tutor", "not_required"].includes(value)) return value;
  return "mid";
}

export function mapJobDetailToDraft(job: EmployerJobDetail): PostJobDraft {
  const department = job.department;
  const departmentId = job.departmentId ?? department?.id ?? "";
  const location =
    job.location ?? [job.neighbourhood, job.city, job.region].filter(Boolean).join(", ");
  const durationLabel = employerJobDurationLabel(job);
  const startNow = employerJobStartNow(job);
  const apiStartDate =
    job.startDate && /^\d{4}-\d{2}-\d{2}/.test(String(job.startDate))
      ? String(job.startDate).slice(0, 10)
      : toApiStartDate(String(job.startDate ?? "")) ?? "";
  const { category, categoryCustom } = inferCategoryFromJob(department, departmentId);

  return normalizePostJobDraft({
    title: String(job.title ?? ""),
    department: String(departmentId),
    category,
    categoryCustom,
    jobType: String(job.employmentType ?? job.jobType ?? "full_time"),
    workMode: String(job.workMode ?? "onsite"),
    location,
    pay: String(job.salary ?? formatPayFromParts(job.payAmount, job.payCurrency, job.payStructure)),
    payPer: String(job.payStructure ?? "monthly"),
    openings: String(job.numberOfOpenings ?? 1),
    startDate: startNow ? "" : apiStartDate,
    duration: durationLabel === "—" ? "" : durationLabel,
    schedule: String(job.schedule ?? ""),
    description: String(job.description ?? ""),
    requirements: job.requirements?.length ? [...job.requirements] : [""],
    responsibilities: job.responsibilities?.length ? [...job.responsibilities] : [""],
    requiredLevel: String(job.experienceLevel ?? "mid"),
    requiredSkillsText: job.requiredSkills?.length ? job.requiredSkills.join(", ") : "",
    startNow,
  });
}

export function formatPostJobStartPreview(draft: PostJobDraft): string {
  if (draft.startNow) return "As soon as possible";
  if (!draft.startDate) return "—";
  const parsed = toApiStartDate(draft.startDate);
  if (!parsed) return draft.startDate;
  const date = new Date(`${parsed}T00:00:00`);
  if (Number.isNaN(date.getTime())) return parsed;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function validatePostJobDraft(
  draft: PostJobDraft,
  extraDepartments?: EmployerJobDepartment[],
  options?: { asDraft?: boolean },
): string | null {
  if (options?.asDraft) {
    if (!draft.startNow && draft.startDate.trim() && !toApiStartDate(draft.startDate)) {
      return "INVALID_START_DATE";
    }
    return null;
  }
  if (!draft.category.trim()) return "CATEGORY_REQUIRED";
  if (draft.category === "other" && !draft.categoryCustom.trim()) return "CATEGORY_OTHER_REQUIRED";
  const departmentId =
    draft.department.trim() ||
    resolveDepartmentIdForCategory(draft.category, mergeJobDepartments(extraDepartments)) ||
    "";
  if (!isDepartmentUuid(departmentId)) return "INVALID_DEPARTMENT";
  if (!draft.startNow && draft.startDate.trim() && !toApiStartDate(draft.startDate)) {
    return "INVALID_START_DATE";
  }
  return null;
}
