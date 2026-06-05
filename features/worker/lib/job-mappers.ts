import type { WorkerJobListItem } from "@/features/worker/types/worker-portal";
import type { WorkerJobCard } from "@/lib/worker-job-data";

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
  if (!createdAt) return "";
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

function formatPay(job: WorkerJobListItem): string {
  const rate = job.payRate;
  const currency = job.currency ?? "XAF";
  const structure = formatPayStructure(job.payStructure);
  if (rate == null || rate === "") return tbdPay(currency);
  const num = formatPayAmount(rate);
  return `${num} ${currency}${structure}`;
}

function tbdPay(_currency: string) {
  return "";
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

function formatSubtitle(job: WorkerJobListItem): string {
  const type = formatJobType(String(job.jobType ?? ""));
  const city = job.city?.trim();
  const mode = job.workMode ? String(job.workMode).replace(/_/g, " ") : "";
  const parts = [type, city, mode].filter(Boolean);
  return parts.join(" • ");
}

function employerName(job: WorkerJobListItem): string {
  return (
    job.employer?.companyName ??
    job.employer?.name ??
    job.companyName ??
    ""
  );
}

function employerLogo(job: WorkerJobListItem): string | null {
  return job.employer?.logoUrl ?? job.companyLogo ?? null;
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
export function workerJobCardFromApi(job: WorkerJobListItem, options?: { match?: number }): WorkerJobCard {
  const company = employerName(job);
  const initial = company.trim() ? company.trim().charAt(0).toUpperCase() : "";
  return {
    id: job.id,
    slug: job.slug ?? job.id,
    title: job.title,
    subtitle: formatSubtitle(job),
    seniority: formatJobType(String(job.category ?? job.jobType ?? "")),
    pay: formatPay(job),
    posted: formatPosted(job.createdAt),
    match: options?.match,
    company,
    companyInitial: initial,
    companyColor: hashColor(company || job.id),
    companyLogoUrl: employerLogo(job),
  };
}

export function workerJobCardsFromApi(
  items: WorkerJobListItem[],
  options?: { match?: number },
): WorkerJobCard[] {
  return dedupeWorkerJobListItems(items).map((j) => workerJobCardFromApi(j, options));
}
