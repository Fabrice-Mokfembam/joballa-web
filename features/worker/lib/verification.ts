import type { VerificationStatus } from "@/lib/types/enums";

type VerificationSource = {
  verificationStatus?: VerificationStatus | string | null;
  status?: VerificationStatus | string | null;
} | null | undefined;

export function getVerificationStatus(...sources: VerificationSource[]): string {
  for (const source of sources) {
    const status = source?.verificationStatus ?? source?.status;
    if (status) return String(status).toUpperCase();
  }
  return "UNVERIFIED";
}

export function isVerifiedStatus(status?: string | null) {
  return String(status ?? "").toUpperCase() === "VERIFIED";
}

export function isPendingStatus(status?: string | null) {
  return String(status ?? "").toUpperCase() === "PENDING";
}

export function isRejectedStatus(status?: string | null) {
  const normalized = String(status ?? "").toUpperCase();
  return normalized === "REJECTED" || normalized === "MORE_INFO_REQUIRED" || normalized === "RESUBMISSION_REQUESTED";
}

export function verificationStatusLabel(status?: string | null) {
  const normalized = String(status ?? "").toUpperCase();
  if (normalized === "VERIFIED") return "Verified";
  if (normalized === "PENDING") return "Under Review";
  if (normalized === "REJECTED") return "Rejected";
  if (normalized === "MORE_INFO_REQUIRED") return "More info required";
  if (normalized === "RESUBMISSION_REQUESTED") return "Resubmission requested";
  if (normalized === "NOT_SUBMITTED" || normalized === "UNVERIFIED") return "Not Submitted";
  return "Not Submitted";
}

export function isNotSubmittedStatus(status?: string | null) {
  const normalized = String(status ?? "").toUpperCase();
  return !normalized || normalized === "NOT_SUBMITTED" || normalized === "UNVERIFIED";
}
