import { normalizeEmployerJobDetail } from "@/features/employer/lib/normalize-employer-job";
import type {
  EmployerApplicantDetail,
  EmployerApplicantFilters,
  EmployerApplicantListItem,
  EmployerApplicantStatus,
  ApplicantProfileSnapshot,
} from "@/features/employer/types/employer-portal";
import { normalizeApplicantStatusForUi } from "@/features/employer/lib/employer-applicant-status";
import {
  resolveApplicantDisplayName,
  resolveApplicantHeadline,
  resolveApplicantProfile,
  type RawApplicantIdentity,
} from "@/features/employer/lib/resolve-applicant-display";

type RawEmployerApplicant = RawApplicantIdentity;

function normalizeSkills(raw: RawEmployerApplicant): string[] {
  if (Array.isArray(raw.skills)) {
    return raw.skills.map((s) => String(s).trim()).filter(Boolean);
  }
  const top = raw.topSkills;
  if (Array.isArray(top)) {
    return top.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof top === "string" && top.trim()) {
    return top
      .split(/[,•|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

/** Maps v2 API applicant rows (`workerName`, `submittedAt`, …) to portal list item fields. */
export function normalizeEmployerApplicantListItem(raw: RawEmployerApplicant): EmployerApplicantListItem {
  const skills = normalizeSkills(raw);
  const displayName = resolveApplicantDisplayName(raw);
  const headline = resolveApplicantHeadline(raw);
  const appliedAt = raw.appliedAt ?? raw.submittedAt ?? undefined;
  const photo =
    (typeof raw.workerPhotoUrl === "string" ? raw.workerPhotoUrl : undefined) ??
    (typeof raw.photoUrl === "string" ? raw.photoUrl : undefined) ??
    (typeof raw.avatarUrl === "string" ? raw.avatarUrl : undefined) ??
    (typeof raw.applicantAvatarUrl === "string" ? raw.applicantAvatarUrl : undefined);
  const location = raw.workerLocation ?? raw.location;
  const profile = resolveApplicantProfile(raw);

  return {
    ...raw,
    applicationId: String(raw.applicationId ?? raw.id ?? ""),
    id: String(raw.id ?? raw.applicationId ?? ""),
    applicantName: displayName,
    name: displayName,
    appliedAt: appliedAt ? String(appliedAt) : raw.appliedAt,
    photoUrl: photo ?? raw.photoUrl,
    avatarUrl: photo ?? raw.avatarUrl,
    applicantAvatarUrl: photo ?? raw.applicantAvatarUrl,
    location: location != null ? String(location) : raw.location,
    skills: skills.length > 0 ? skills : raw.skills,
    topSkills: skills.length > 0 ? skills.join(", ") : raw.topSkills,
    matchScore:
      raw.matchScore ??
      (typeof raw.match === "number" ? raw.match : typeof raw.match === "string" ? Number.parseFloat(raw.match) : undefined),
    verificationStatus: raw.verificationStatus ?? raw.kycStatus,
    submittedProfile: profile,
    workerHeadline: headline ?? (typeof raw.workerHeadline === "string" ? raw.workerHeadline : null),
    workerEmail: typeof raw.workerEmail === "string" ? raw.workerEmail : raw.workerEmail ?? null,
    status: normalizeApplicantStatusForUi(raw.status as EmployerApplicantStatus | string | undefined),
  };
}

export function normalizeEmployerApplicantDetail(raw: EmployerApplicantDetail): EmployerApplicantDetail {
  const snapshot = (raw as { profileSnapshot?: ApplicantProfileSnapshot }).profileSnapshot;
  const listItem = normalizeEmployerApplicantListItem({
    ...raw,
    profileSnapshot: snapshot,
  } as RawEmployerApplicant);

  return {
    ...listItem,
    profileSnapshot: snapshot,
    submittedProfile: (snapshot ?? raw.submittedProfile ?? listItem.submittedProfile) as
      | ApplicantProfileSnapshot
      | Record<string, unknown>
      | undefined,
    employerNotes: raw.employerNotes,
    coverNote:
      raw.coverNote ??
      (typeof (raw as { jobSpecificNote?: string | null }).jobSpecificNote === "string"
        ? (raw as { jobSpecificNote?: string | null }).jobSpecificNote
        : null),
    attachedDocuments: raw.attachedDocuments,
    liveProfile: (raw as { liveProfile?: EmployerApplicantDetail["liveProfile"] }).liveProfile ?? null,
    job: raw.job
      ? normalizeEmployerJobDetail(raw.job as Parameters<typeof normalizeEmployerJobDetail>[0])
      : undefined,
  };
}

export function normalizeEmployerApplicantPage<T extends { items?: unknown[] }>(
  page: T,
): T & { items: EmployerApplicantListItem[] } {
  const items = Array.isArray(page.items)
    ? page.items.map((item) => normalizeEmployerApplicantListItem(item as RawEmployerApplicant))
    : [];
  return { ...page, items };
}

/** Maps v2 filter payload (`jobs` or `jobTitles`) to portal filter fields. */
export function normalizeEmployerApplicantFilters(raw: unknown): EmployerApplicantFilters {
  const record = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const jobsRaw = record.jobTitles ?? record.jobs ?? [];
  const jobTitles = Array.isArray(jobsRaw)
    ? jobsRaw
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const row = item as Record<string, unknown>;
          const jobId = String(row.jobId ?? row.id ?? "").trim();
          const title = String(row.title ?? "").trim();
          if (!jobId) return null;
          return { jobId, title: title || jobId };
        })
        .filter((item): item is { jobId: string; title: string } => item != null)
    : [];
  const statusesRaw = record.statuses;
  const statuses = Array.isArray(statusesRaw)
    ? statusesRaw.map((status) => String(status) as EmployerApplicantStatus)
    : [];
  return { jobTitles, statuses };
}
