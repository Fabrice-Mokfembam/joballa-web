import type { ApplicationProfileCustomization } from "@/features/worker/types/worker-portal";

const STORAGE_PREFIX = "joballa:apply-draft:";

function storageKey(jobId: string) {
  return `${STORAGE_PREFIX}${jobId}`;
}

/** Per-job apply customization kept in sessionStorage until submit (no server draft). */
export function readApplicationProfileDraft(jobId: string): ApplicationProfileCustomization | null {
  if (typeof window === "undefined" || !jobId) return null;
  try {
    const raw = sessionStorage.getItem(storageKey(jobId));
    if (!raw) return null;
    return JSON.parse(raw) as ApplicationProfileCustomization;
  } catch {
    return null;
  }
}

export function writeApplicationProfileDraft(jobId: string, customization: ApplicationProfileCustomization): void {
  if (typeof window === "undefined" || !jobId) return;
  try {
    sessionStorage.setItem(storageKey(jobId), JSON.stringify(customization));
  } catch {
    // Quota or private mode — in-memory state in the apply flow still works for the session.
  }
}

export function clearApplicationProfileDraft(jobId: string): void {
  if (typeof window === "undefined" || !jobId) return;
  try {
    sessionStorage.removeItem(storageKey(jobId));
  } catch {
    // ignore
  }
}
