import type { WorkerJobListItem } from "@/features/worker/types/worker-portal";

export type JobPosterType = "employer" | "worker";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

/** Whether the listing was posted by an employer company or a worker/individual. */
export function resolveJobPosterType(job?: WorkerJobListItem | null): JobPosterType | null {
  if (!job) return null;

  const raw = record(job);
  const owner = record(raw.owner);

  const role = String(raw.ownerRole ?? raw.owner_role ?? raw.posterRole ?? owner.role ?? "")
    .trim()
    .toLowerCase();
  if (role === "employer") return "employer";
  if (role === "worker") return "worker";

  if (raw.postedByWorkerId ?? raw.posted_by_worker_id) return "worker";
  if (raw.employerId ?? raw.employer_id) return "employer";

  const employer = job.employer;
  const employerId = employer?.id != null ? String(employer.id) : "";
  const companyName = String(employer?.companyName ?? job.companyName ?? "").trim();
  const ownerName = String(raw.ownerName ?? owner.displayName ?? "").trim();

  if (employerId && companyName) return "employer";
  if (ownerName && !employerId) return "worker";
  if (companyName && !ownerName) return "employer";
  if (ownerName) return "worker";

  return null;
}
