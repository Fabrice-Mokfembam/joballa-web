import type { EmployerApplicantListItem } from "@/features/employer/types/employer-portal";

export type RawApplicantIdentity = EmployerApplicantListItem &
  Record<string, unknown> & {
    workerName?: string | null;
    workerHeadline?: string | null;
    workerEmail?: string | null;
    workerFullName?: string | null;
    fullName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    profileSnapshot?: Record<string, unknown> | unknown;
  };

function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isNonEmptyProfile(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && Object.keys(value as object).length > 0);
}

function profileRecord(raw: RawApplicantIdentity): Record<string, unknown> | undefined {
  const submitted = isNonEmptyProfile(raw.submittedProfile) ? raw.submittedProfile : undefined;
  const snapshot = isNonEmptyProfile(raw.profileSnapshot) ? (raw.profileSnapshot as Record<string, unknown>) : undefined;
  // Detail route returns normalized profileSnapshot — prefer it over slim list submittedProfile.
  return snapshot ?? submitted;
}

function profileSummaryText(profile: Record<string, unknown> | undefined): string {
  if (!profile) return "";
  return String(
    profile.summary ?? profile.bio ?? profile.professionalSummary ?? profile.shortBio ?? "",
  ).trim();
}

function joinName(first?: unknown, last?: unknown): string | undefined {
  const parts = [first, last].map((part) => String(part ?? "").trim()).filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : undefined;
}

function pickDisplayName(candidates: Array<string | undefined | null>): string | undefined {
  for (const candidate of candidates) {
    const value = String(candidate ?? "").trim();
    if (!value || looksLikeEmail(value)) continue;
    return value;
  }
  return undefined;
}

/**
 * Display name for applicant cards.
 * Backend (June 2026) sends `workerName` from profileSnapshot — never email.
 * See `routedocs/BACKEND_RESPONSE_EMPLOYER_APPLICANT_LIST.md`.
 */
export function resolveApplicantDisplayName(raw: RawApplicantIdentity): string {
  const profile = profileRecord(raw);

  const resolved = pickDisplayName([
    typeof raw.workerName === "string" ? raw.workerName : undefined,
    typeof profile?.fullName === "string" ? profile.fullName : undefined,
    joinName(profile?.firstName, profile?.lastName),
    typeof raw.workerFullName === "string" ? raw.workerFullName : undefined,
    typeof raw.fullName === "string" ? raw.fullName : undefined,
    typeof raw.applicantName === "string" ? raw.applicantName : undefined,
    typeof raw.name === "string" ? raw.name : undefined,
    joinName(raw.firstName, raw.lastName),
  ]);

  return resolved ?? "Worker";
}

/** Card subtitle — API `workerHeadline`, then snapshot professionalTitle (not bio/tagline). */
export function resolveApplicantHeadline(raw: RawApplicantIdentity): string | undefined {
  if (typeof raw.workerHeadline === "string" && raw.workerHeadline.trim()) {
    return raw.workerHeadline.trim();
  }

  const profile = profileRecord(raw);
  const summary = profileSummaryText(profile);

  const professionalTitle =
    (typeof profile?.professionalTitle === "string" && profile.professionalTitle.trim()) || undefined;
  if (professionalTitle) return professionalTitle;

  const legacyHeadline =
    (typeof profile?.headline === "string" && profile.headline.trim()) ||
    (typeof profile?.title === "string" && profile.title.trim()) ||
    (typeof raw.headline === "string" && raw.headline.trim()) ||
    undefined;

  if (legacyHeadline && legacyHeadline !== summary) return legacyHeadline;

  return undefined;
}

export function resolveApplicantProfile(raw: RawApplicantIdentity): Record<string, unknown> | undefined {
  const profile = profileRecord(raw);
  const headline = resolveApplicantHeadline(raw);
  const fullName = resolveApplicantDisplayName(raw);

  if (!profile && !headline) return undefined;

  return {
    ...(profile ?? {}),
    fullName: profile?.fullName ?? fullName,
    ...(headline ? { headline } : {}),
  };
}
