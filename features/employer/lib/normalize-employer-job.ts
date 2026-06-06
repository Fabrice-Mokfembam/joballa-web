import type { EmployerDashboard, EmployerJobDetail, EmployerJobListItem } from "@/features/employer/types/employer-portal";

type RawEmployerJob = EmployerJobListItem & {
  id?: string;
  payAmount?: number;
  payCurrency?: string;
  payStructure?: string;
  employmentType?: string;
  city?: string;
  region?: string;
  neighbourhood?: string;
  createdAt?: string;
  requirements?: unknown[];
  responsibilities?: unknown[];
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
  return parts.length > 0 ? parts.join(", ") : undefined;
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
