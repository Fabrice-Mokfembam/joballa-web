import type { WorkerJobListItem } from "@/features/worker/types/worker-portal";
import type { WorkerJobCard } from "@/lib/worker-job-data";
import { normalizeWorkerJobListItem } from "@/features/worker/lib/normalize-worker-job";
import { resolveJobPosterType } from "@/features/worker/lib/job-poster";

const COMPANY_COLORS = [
  "bg-teal-600",
  "bg-[var(--joballa-primary)]",
  "bg-violet-600",
  "bg-amber-600",
  "bg-sky-600",
  "bg-rose-600",
] as const;

function hashColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i)) | 0;
  return COMPANY_COLORS[Math.abs(h) % COMPANY_COLORS.length]!;
}

function formatPosted(createdAt?: string): string {
  if (!createdAt) return "—";
  const then = new Date(createdAt).getTime();
  if (Number.isNaN(then)) return "";
  const days = Math.floor((Date.now() - then) / 86400000);
  if (days < 1) return "1d";
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;
  return `${Math.floor(days / 30)}mo`;
}

function formatJobType(jobType?: string): string {
  if (!jobType) return "";
  return jobType
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const EXPERIENCE_LEVEL_LABELS: Record<string, string> = {
  entry: "Entry",
  junior: "Junior",
  mid: "Mid",
  senior: "Senior",
  lead: "Lead",
  tutor: "Tutor",
  not_required: "Not required",
};

function formatExperienceLevel(raw?: string | null): string {
  if (!raw) return "";
  const key = String(raw).trim().toLowerCase().replace(/[\s-]+/g, "_");
  return EXPERIENCE_LEVEL_LABELS[key] ?? formatJobType(raw);
}

function departmentLabel(job: WorkerJobListItem): string {
  const raw = job as Record<string, unknown>;
  const dept = raw.department;
  if (dept && typeof dept === "object" && dept !== null && "name" in dept) {
    return String((dept as { name?: string }).name ?? "").trim();
  }
  if (typeof raw.departmentName === "string") return raw.departmentName.trim();
  if (job.category) return formatJobType(String(job.category));
  return "";
}

function formatPay(job: WorkerJobListItem): string {
  const raw = job as Record<string, unknown>;
  const rate =
    job.payRate ??
    (typeof raw.payAmount === "number" || typeof raw.payAmount === "string" ? raw.payAmount : null);
  const currency = job.currency ?? (typeof raw.payCurrency === "string" ? raw.payCurrency : "XAF");
  const structure = formatPayStructure(String(job.payStructure ?? ""));
  if (rate == null || rate === "") return tbdPay(currency);
  const num = formatPayAmount(rate);
  return `${num} ${currency}${structure}`;
}

function tbdPay(currency: string) {
  return currency ? `— ${currency}` : "—";
}

function formatPayAmount(rate: number | string): string {
  if (typeof rate === "number") return rate.toLocaleString();
  const trimmed = String(rate).trim();
  const numeric = trimmed.replace(/,/g, "");
  if (/^\d+(\.\d+)?$/.test(numeric)) return Number(numeric).toLocaleString();
  return trimmed.replace(/\b\d{4,}\b/g, (match) => Number(match).toLocaleString());
}

function formatPayStructure(payStructure?: string): string {
  const normalized = String(payStructure ?? "").trim().toUpperCase();
  if (!normalized) return "";
  if (normalized === "MONTHLY" || normalized === "MONTH" || normalized === "MO") return "/m";
  if (normalized === "HOURLY" || normalized === "HOUR" || normalized === "HR") return "/h";
  if (normalized === "DAILY" || normalized === "DAY") return "/d";
  return `/${normalized.toLowerCase()}`;
}

function formatWorkModeLabel(raw?: string | null): string {
  if (!raw) return "";
  const normalized = String(raw).trim().replace(/_/g, " ");
  if (!normalized) return "";
  return normalized.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCityLabel(job: WorkerJobListItem): string {
  const raw = job as Record<string, unknown>;
  const neighbourhood = String(raw.neighbourhood ?? "").trim();
  const city = job.city?.trim() ?? "";
  const region = String(job.region ?? "").trim();
  if (neighbourhood && city) return `${neighbourhood}, ${city}`;
  if (neighbourhood) return neighbourhood;
  if (city) return city;
  if (region) return region;
  return "";
}

function formatCardLocationParts(job: WorkerJobListItem): { cityLabel: string; workModeLabel: string } {
  const raw = job as Record<string, unknown>;
  const workModeRaw = String(job.workMode ?? raw.workMode ?? "").toLowerCase();
  const workModeLabel = formatWorkModeLabel(String(job.workMode ?? raw.workMode ?? ""));
  const cityLabel = formatCityLabel(job);

  if (workModeRaw.includes("remote")) {
    return { workModeLabel: "Remote", cityLabel: cityLabel || "Worldwide" };
  }

  return { workModeLabel, cityLabel };
}

function formatSubtitle(job: WorkerJobListItem): string {
  const { cityLabel, workModeLabel } = formatCardLocationParts(job);
  return [cityLabel, workModeLabel].filter(Boolean).join(" • ");
}

function employerName(job?: WorkerJobListItem | null): string {
  if (!job) return "";
  const raw = job as Record<string, unknown>;
  const owner = raw.owner as { displayName?: string; name?: string } | undefined;
  return (
    job.companyName ??
    (typeof raw.ownerName === "string" ? raw.ownerName : "") ??
    owner?.displayName ??
    owner?.name ??
    job.employer?.companyName ??
    job.employer?.name ??
    ""
  );
}

function employerLogo(job?: WorkerJobListItem | null): string | null {
  if (!job) return null;
  const raw = job as Record<string, unknown>;
  const owner = raw.owner as { photoUrl?: string; logoUrl?: string; avatarUrl?: string } | undefined;
  return (
    job.employer?.logoUrl ??
    job.companyLogo ??
    job.companyLogoUrl ??
    owner?.photoUrl ??
    owner?.avatarUrl ??
    owner?.logoUrl ??
    (typeof raw.ownerPhotoUrl === "string" ? raw.ownerPhotoUrl : null) ??
    (typeof raw.posterPhotoUrl === "string" ? raw.posterPhotoUrl : null) ??
    null
  );
}

/** Drop duplicate jobs returned by the API (same id or slug). */
export function dedupeWorkerJobListItems(items: WorkerJobListItem[]): WorkerJobListItem[] {
  const seen = new Set<string>();
  return items.filter((job) => {
    const key = job.id || String(job.slug ?? "");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Map API job card → UI `WorkerJobCard` (slug = job id for routing). */
export function workerJobCardFromApi(
  input: WorkerJobListItem | null | undefined,
  options?: { match?: number },
): WorkerJobCard {
  const job = normalizeWorkerJobListItem(
    (input ?? { id: "", title: "" }) as Parameters<typeof normalizeWorkerJobListItem>[0],
  );
  const company = employerName(job);
  const initial = company.trim() ? company.trim().charAt(0).toUpperCase() : "";
  const raw = job as Record<string, unknown>;
  const experienceLevel = raw.experienceLevel ?? raw.requiredLevel ?? raw.experience_level;
  const { cityLabel, workModeLabel } = formatCardLocationParts(job);
  return {
    id: job.id,
    slug: job.slug ?? job.id,
    title: job.title,
    subtitle: formatSubtitle(job),
    department: departmentLabel(job),
    employmentType: formatJobType(String(job.jobType ?? raw.employmentType ?? "")),
    cityLabel,
    workModeLabel,
    seniority: formatExperienceLevel(
      typeof experienceLevel === "string" || typeof experienceLevel === "number"
        ? String(experienceLevel)
        : "",
    ),
    pay: formatPay(job),
    posted: formatPosted(job.createdAt ?? job.postedAt),
    match: options?.match,
    company,
    companyInitial: initial,
    companyColor: hashColor(company || job.id),
    companyLogoUrl: employerLogo(job),
    posterType: resolveJobPosterType(job),
    isSaved: !!(job.saved ?? job.isSaved),
    hasApplied: !!job.hasApplied,
    isOwnJob: !!job.isOwnJob,
  };
}

export function workerJobCardsFromApi(
  items: WorkerJobListItem[],
  options?: { match?: number },
): WorkerJobCard[] {
  return dedupeWorkerJobListItems(Array.isArray(items) ? items : []).map((j) => workerJobCardFromApi(j, options));
}
