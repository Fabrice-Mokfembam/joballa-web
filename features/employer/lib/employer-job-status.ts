/** Employer job status — API uses `active`; UI copy uses "Active" (not "live"). */

const ACTIVE_ALIASES = new Set(["active", "live"]);

export function normalizeEmployerJobStatusFromApi(status: string | undefined | null): string {
  const value = String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  if (ACTIVE_ALIASES.has(value)) return "active";
  return value;
}

/** Map UI or legacy values to API `PATCH …/status` body. */
export function toApiEmployerJobStatus(status: string): string {
  const value = String(status).trim().toLowerCase().replace(/\s+/g, "_");
  if (ACTIVE_ALIASES.has(value)) return "active";
  return value;
}

export function displayEmployerJobStatus(status: string | undefined | null): string {
  const normalized = normalizeEmployerJobStatusFromApi(status);
  if (normalized === "active") return "Active";
  if (normalized === "under_review") return "Under review";
  if (!normalized) return "—";
  return normalized
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export type EmployerJobStatusAction = "active" | "paused" | "closed";

/** Employer-facing status transitions allowed by API (see BACKEND_RESPONSE_EMPLOYER_JOB_SUBMIT_FOR_REVIEW.md). */
export function employerJobStatusActions(status: string | undefined | null): EmployerJobStatusAction[] {
  const normalized = normalizeEmployerJobStatusFromApi(status);
  switch (normalized) {
    case "active":
      return ["paused", "closed"];
    case "paused":
      return ["active", "closed"];
    case "under_review":
    case "draft":
    case "rejected":
      return ["closed"];
    default:
      return [];
  }
}

export function jobStatusMatchesFilter(status: string, filter: string): boolean {
  if (!filter) return true;
  const normalized = normalizeEmployerJobStatusFromApi(status);
  const filterNorm = toApiEmployerJobStatus(filter);
  if (filterNorm === "active") return normalized === "active";
  return normalized === filterNorm;
}
