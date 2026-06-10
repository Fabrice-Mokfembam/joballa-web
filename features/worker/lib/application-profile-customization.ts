import type {
  ApplicationProfileCustomization,
  ApplicationProfileDraft,
  CustomizeProfileBody,
  WorkerFullProfile,
} from "@/features/worker/types/worker-portal";

export function buildApplicationCustomizationFromProfile(
  profile: WorkerFullProfile,
): ApplicationProfileCustomization {
  return {
    professionalTitle: profile.professionalTitle ?? undefined,
    professionalSummary: profile.summary ?? undefined,
    bio: profile.summary ?? undefined,
    skills: [...(profile.skills ?? [])],
    languages: [...(profile.languages ?? [])],
    region: profile.region ?? undefined,
    city: profile.city ?? undefined,
    detachedWorkHistoryIds: [],
    detachedEducationIds: [],
    detachedCertificationIds: [],
    detachedDocumentIds: [],
  };
}

export function mergeProfileWithCustomization(
  profile: WorkerFullProfile,
  customization: ApplicationProfileCustomization | null | undefined,
): WorkerFullProfile {
  if (!customization) return profile;

  const detachedWork = new Set(customization.detachedWorkHistoryIds ?? []);
  const detachedEducation = new Set(customization.detachedEducationIds ?? []);
  const detachedCerts = new Set(customization.detachedCertificationIds ?? []);
  const detachedDocs = new Set(customization.detachedDocumentIds ?? []);

  return {
    ...profile,
    professionalTitle: customization.professionalTitle ?? profile.professionalTitle,
    summary: customization.professionalSummary ?? customization.bio ?? profile.summary,
    skills: customization.skills ?? profile.skills,
    languages: customization.languages ?? profile.languages,
    region: customization.region ?? profile.region,
    city: customization.city ?? profile.city,
    workHistories: (profile.workHistories ?? []).filter((w) => !detachedWork.has(w.id)),
    educations: (profile.educations ?? []).filter((e) => !detachedEducation.has(e.id)),
    certifications: (profile.certifications ?? []).filter((c) => !detachedCerts.has(c.id)),
    documents: (profile.documents ?? []).filter((d) => !detachedDocs.has(d.id)),
  };
}

export function hasApplicationCustomization(
  profile: WorkerFullProfile,
  customization: ApplicationProfileCustomization | null,
): boolean {
  if (!customization) return false;
  const baseline = buildApplicationCustomizationFromProfile(profile);
  return JSON.stringify(customization) !== JSON.stringify(baseline);
}

/** Map UI customization → backend `CustomizeProfileBody` for PUT draft. */
export function encodeApplicationProfileDraft(
  customization: ApplicationProfileCustomization,
): CustomizeProfileBody {
  return {
    professionalTitle: customization.professionalTitle,
    professionalSummary: customization.professionalSummary,
    bio: customization.bio,
    skills: customization.skills,
    languages: customization.languages,
    region: customization.region,
    city: customization.city,
    detachedWorkHistoryIds: customization.detachedWorkHistoryIds,
    detachedEducationIds: customization.detachedEducationIds,
    detachedCertificationIds: customization.detachedCertificationIds,
    detachedDocumentIds: customization.detachedDocumentIds,
  };
}

/** Map backend draft → UI customization state. */
export function decodeApplicationProfileDraft(
  draft: ApplicationProfileDraft | null | undefined,
): ApplicationProfileCustomization | null {
  const data = draft?.customizedData;
  if (!data || typeof data !== "object") return null;
  return {
    professionalTitle: data.professionalTitle,
    professionalSummary: data.professionalSummary,
    bio: data.bio,
    skills: data.skills ? [...data.skills] : undefined,
    languages: data.languages ? [...data.languages] : undefined,
    region: data.region,
    city: data.city,
    detachedWorkHistoryIds: [...(data.detachedWorkHistoryIds ?? [])],
    detachedEducationIds: [...(data.detachedEducationIds ?? [])],
    detachedCertificationIds: [...(data.detachedCertificationIds ?? [])],
    detachedDocumentIds: [...(data.detachedDocumentIds ?? [])],
  };
}
