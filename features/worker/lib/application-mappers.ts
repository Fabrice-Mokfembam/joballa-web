import type {
  WorkerApplicationDetail,
  WorkerApplicationListItem,
} from "@/features/worker/types/worker-portal";
import type { WorkerApplicationRow, WorkerApplicationStatus } from "@/lib/worker-applications-data";
import { workerJobCardFromApi } from "@/features/worker/lib/job-mappers";

function mapStatus(status: string): WorkerApplicationStatus {
  const s = status.toUpperCase();
  if (s === "SHORTLISTED") return "shortlisted";
  if (s === "REJECTED") return "rejected";
  if (s === "HIRED") return "shortlisted";
  return "pending";
}

function formatAppliedTime(iso?: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;
  return `${Math.floor(days / 30)}mo`;
}

function cleanJobTitle(title: string, location?: string): string {
  const trimmed = String(title ?? "").trim();
  if (!trimmed) return "";
  const locationName = location?.trim();
  if (!locationName) return trimmed;
  return trimmed.replace(new RegExp(`\\s*\\(${locationName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)\\s*$`, "i"), "");
}

export function workerApplicationRowFromApi(
  app: WorkerApplicationListItem | WorkerApplicationDetail,
): WorkerApplicationRow {
  const job = app.job;
  const company = String(
    app.companyName ??
    job?.employer?.companyName ??
    job?.employer?.name ??
    job?.companyName ??
    "",
  );
  const companyInitial = company.trim() ? company.trim().charAt(0).toUpperCase() : "";
  const card = job ? workerJobCardFromApi(job) : undefined;

  const location = String(job?.city ?? "");
  return {
    slug: app.id,
    jobTitle: cleanJobTitle(app.jobTitle ?? job?.title ?? "", location),
    company,
    companyInitial,
    companyColor: card?.companyColor ?? "bg-teal-600",
    companyLogoUrl: card?.companyLogoUrl ?? null,
    jobType: String(job?.jobType ?? "").replace(/_/g, " "),
    location,
    pay: card?.pay ?? "",
    status: mapStatus(String(app.status)),
    appliedTime: formatAppliedTime(app.appliedAt ?? app.createdAt),
    matchPct: null,
    linkedJobSlug: job?.id ?? app.jobId,
  };
}

export function workerApplicationRowsFromApi(
  items: WorkerApplicationListItem[],
): WorkerApplicationRow[] {
  return items.map(workerApplicationRowFromApi);
}
