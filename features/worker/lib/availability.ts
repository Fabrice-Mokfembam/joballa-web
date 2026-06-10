import type { WorkerFullProfile } from "@/features/worker/types/worker-portal";

/** `availableForHire` is server-derived; fall back to availability status until API ships it. */
export function isAvailableForHire(profile: Pick<WorkerFullProfile, "availableForHire" | "availabilityStatus">): boolean {
  if (typeof profile.availableForHire === "boolean") return profile.availableForHire;
  const status = String(profile.availabilityStatus ?? "").toUpperCase();
  return status === "AVAILABLE" || status === "OPEN_TO_OFFERS";
}
