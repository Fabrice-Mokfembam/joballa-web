import type { WorkerFullProfile } from "@/features/worker/types/worker-portal";
import type {
  AvailabilityStatus,
  MomoProvider,
  VerificationStatus,
  WorkerProfile,
} from "@/lib/types";

/** Map portal `WorkerFullProfile` → legacy `WorkerProfile` for older consumers. */
export function mapPortalProfileToLegacy(profile: WorkerFullProfile): WorkerProfile {
  const fullName =
    profile.fullName?.trim() ||
    [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() ||
    "Worker";

  return {
    id: profile.id,
    userId: profile.userId ?? "",
    fullName,
    city: profile.city ?? null,
    region: profile.region ?? null,
    dateOfBirth: null,
    bio: profile.summary ?? null,
    preferredJobCategories: profile.industries ?? [],
    languagesSpoken: profile.languages ?? [],
    availabilityStatus: (profile.availabilityStatus ?? "AVAILABLE") as AvailabilityStatus,
    skills: profile.skills ?? [],
    workHistory: (profile.workHistories ?? []).map((w) => ({
      employer: w.companyName ?? "",
      role: w.jobTitle ?? "",
      startDate: w.startDate ?? "",
      endDate: w.endDate ?? null,
      description: w.description ?? null,
    })),
    education: (profile.educations ?? []).map((e) => ({
      institution: e.institution ?? "",
      qualification: e.degree ?? e.fieldOfStudy ?? "",
      startYear: e.startDate ? new Date(e.startDate).getFullYear() : null,
      endYear: e.endDate ? new Date(e.endDate).getFullYear() : null,
    })),
    nationalIdDocUrl: profile.kycSubmissions?.[0]?.frontIdImageUrl ?? null,
    verificationStatus: (profile.kycSubmissions?.[0]?.status ??
      "UNVERIFIED") as VerificationStatus,
    verificationNotes: null,
    uploadedResumeUrl: profile.documents?.[0]?.url ?? null,
    profileCompleteness: profile.profileCompleteness ?? 0,
    mobileMoneyProvider: (profile.mobileMoneyProvider ?? null) as MomoProvider | null,
    mobileMoneyNumber: profile.mobileMoneyNumber ?? null,
    createdAt: "",
    updatedAt: "",
  };
}
