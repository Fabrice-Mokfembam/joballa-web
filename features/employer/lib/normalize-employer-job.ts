import type { EmployerDashboard, EmployerJobDetail, EmployerJobListItem } from "@/features/employer/types/employer-portal";

type RawEmployerJob = EmployerJobListItem & {
  id?: string;
  departmentId?: string;
  department?: { id?: string; name?: string; slug?: string; category?: string };
  payAmount?: number;
  payCurrency?: string;
  payStructure?: string;
  employmentType?: string;
  workMode?: string;
  experienceLevel?: string | null;
  duration?: string;
  startNow?: boolean;
  startAsap?: boolean;
  city?: string;
  region?: string;
  country?: string;
  neighbourhood?: string | null;
  createdAt?: string;
  company?: string;
  description?: string;
  startDate?: string | null;
  requirements?: unknown[];
  responsibilities?: unknown[];
  requiredSkills?: unknown[];
  numberOfOpenings?: number;
  paymentManagedByJoballa?: boolean;
};

export function employerJobId(job: Pick<RawEmployerJob, "jobId" | "id">): string {
  return String(job.jobId ?? job.id ?? "");
}

function formatEmploymentType(raw?: string): string {
  if (!raw) return "";
  return raw
    .split("_")
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : ""))
    .join(" ");
}

function formatPay(raw: RawEmployerJob): string | undefined {
  if (raw.salary) return String(raw.salary);
  if (raw.payAmount == null) return undefined;
  const currency = raw.payCurrency ?? "XAF";
  const amount = Number(raw.payAmount).toLocaleString("en-US");
  const per =
    raw.payStructure === "monthly"
      ? "month"
      : raw.payStructure?.replace(/_/g, " ") ?? "month";
  return `${amount} ${currency}/${per}`;
}

function formatLocation(raw: RawEmployerJob): string | undefined {
  if (raw.location) return raw.location;
  const parts = [raw.neighbourhood, raw.city, raw.region].filter(Boolean);
  return parts.length > 0 ? parts.map(String).join(", ") : undefined;
}

function normalizeDepartment(raw: RawEmployerJob["department"]) {
  if (!raw || typeof raw !== "object") return undefined;
  const id = raw.id != null ? String(raw.id) : "";
  if (!id) return undefined;
  return {
    id,
    name: String(raw.name ?? ""),
    slug: raw.slug != null ? String(raw.slug) : undefined,
    category: raw.category != null ? String(raw.category) : undefined,
  };
}

export function normalizeEmployerJobDetail(raw: RawEmployerJob): EmployerJobDetail {
  const base = normalizeEmployerJobListItem(raw);
  const input = raw && typeof raw === "object" ? raw : ({} as RawEmployerJob);
  const department = normalizeDepartment(input.department);
  const departmentId =
    input.departmentId != null
      ? String(input.departmentId)
      : department?.id;

  return {
    ...base,
    departmentId,
    department,
    company: department?.name ?? (input.company != null ? String(input.company) : undefined),
    description: input.description != null ? String(input.description) : undefined,
    employmentType: input.employmentType != null ? String(input.employmentType) : undefined,
    workMode: input.workMode != null ? String(input.workMode) : undefined,
    experienceLevel:
      input.experienceLevel != null ? String(input.experienceLevel) : input.experienceLevel ?? undefined,
    country: input.country != null ? String(input.country) : undefined,
    region: input.region != null ? String(input.region) : undefined,
    city: input.city != null ? String(input.city) : undefined,
    neighbourhood: input.neighbourhood != null ? String(input.neighbourhood) : input.neighbourhood ?? null,
    payAmount: input.payAmount != null ? Number(input.payAmount) : undefined,
    payCurrency: input.payCurrency != null ? String(input.payCurrency) : undefined,
    payStructure: input.payStructure != null ? String(input.payStructure) : undefined,
    duration: input.duration != null ? String(input.duration) : undefined,
    startDate: input.startDate != null ? String(input.startDate) : input.startDate ?? null,
    startNow: Boolean(input.startNow ?? input.startAsap),
    numberOfOpenings: input.numberOfOpenings != null ? Number(input.numberOfOpenings) : undefined,
    paymentManagedByJoballa:
      input.paymentManagedByJoballa != null ? Boolean(input.paymentManagedByJoballa) : undefined,
    requiredSkills: Array.isArray(input.requiredSkills)
      ? input.requiredSkills.filter((skill): skill is string => typeof skill === "string")
      : undefined,
  };
}

type NormalizedEmployerJob = EmployerJobListItem &
  Partial<Pick<EmployerJobDetail, "requirements" | "responsibilities">>;

export function normalizeEmployerJobListItem(raw: RawEmployerJob): NormalizedEmployerJob {
  const input = raw && typeof raw === "object" ? raw : ({} as RawEmployerJob);
  return {
    ...input,
    jobId: employerJobId(input),
    title: String(input.title ?? ""),
    location: formatLocation(input),
    jobType: input.jobType != null ? String(input.jobType) : formatEmploymentType(input.employmentType),
    salary: formatPay(input) ?? input.salary,
    status: String(input.status ?? ""),
    postedAt: input.postedAt != null ? String(input.postedAt) : input.createdAt != null ? String(input.createdAt) : undefined,
    requirements: Array.isArray(input.requirements)
      ? input.requirements.filter((line): line is string => typeof line === "string")
      : undefined,
    responsibilities: Array.isArray(input.responsibilities)
      ? input.responsibilities.filter((line): line is string => typeof line === "string")
      : undefined,
  };
}

export function normalizeEmployerDashboard(raw: Record<string, unknown>): EmployerDashboard {
  raw = raw && typeof raw === "object" ? raw : {};
  const stats = raw.stats as Record<string, unknown> | undefined;
  if (stats && typeof stats.activeJobs === "number") {
    const jobs = Array.isArray(raw.activeJobs) ? raw.activeJobs : [];
    return {
      activeJobs: { count: stats.activeJobs as number, label: "currently live" },
      totalApplicants: { count: stats.totalApplicants as number, trend: "all time" },
      hiredWorkers: { count: stats.hiredWorkers as number, trend: "hired via applications" },
      totalPayroll: { count: String(stats.totalPayroll ?? 0), trend: "completed payments (XAF)" },
      liveJobs: jobs.map((job) => normalizeEmployerJobListItem(job as RawEmployerJob)),
    };
  }

  const liveJobs = Array.isArray(raw.liveJobs)
    ? raw.liveJobs.map((job) => normalizeEmployerJobListItem(job as RawEmployerJob))
    : [];

  return { ...(raw as EmployerDashboard), liveJobs };
}
