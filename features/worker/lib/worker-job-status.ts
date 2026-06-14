/** Worker-owned job status — close-only actions (no pause/resume). */

const ACTIVE_ALIASES = new Set(["active", "live"]);

export function normalizeWorkerOwnedJobStatusFromApi(status: string | undefined | null): string {
  const value = String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  if (ACTIVE_ALIASES.has(value)) return "active";
  return value;
}

export function toApiWorkerOwnedJobStatus(status: string): string {
  const value = String(status).trim().toLowerCase().replace(/\s+/g, "_");
  if (ACTIVE_ALIASES.has(value)) return "active";
  return value;
}

export type WorkerOwnedJobStatusAction = "closed";

/** Worker posters may only close active or paused jobs. */
export function workerOwnedJobStatusActions(status: string | undefined | null): WorkerOwnedJobStatusAction[] {
  const normalized = normalizeWorkerOwnedJobStatusFromApi(status);
  switch (normalized) {
    case "active":
    case "live":
    case "paused":
      return ["closed"];
    default:
      return [];
  }
}
