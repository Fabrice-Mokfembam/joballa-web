import type { EmployerApplicantDetail, EmployerApplicantListItem } from "@/features/employer/types/employer-portal";
import { coerceProfileSnapshot } from "@/features/employer/lib/applicant-profile";
import type {
  WorkerIncomingApplicationDetail,
  WorkerIncomingApplicationListItem,
  WorkerOwnedJobDetail,
} from "@/features/worker/types/worker-portal";

function snapshotFromItem(item: WorkerIncomingApplicationListItem): Record<string, unknown> | undefined {
  const raw = item.profileSnapshot;
  return raw && typeof raw === "object" ? (raw as Record<string, unknown>) : undefined;
}

function profileExtras(snapshot?: Record<string, unknown>) {
  if (!snapshot) {
    return {
      headline: undefined as string | undefined,
      location: undefined as string | undefined,
      skills: [] as string[],
      verificationStatus: undefined as string | undefined,
    };
  }
  const coerced = coerceProfileSnapshot(snapshot);
  const skills = Array.isArray(coerced.skills)
    ? coerced.skills.map((skill) => String(skill).trim()).filter(Boolean)
    : [];
  return {
    headline: String(coerced.headline ?? "").trim() || undefined,
    location: String(coerced.location ?? "").trim() || undefined,
    skills,
    verificationStatus: String(coerced.verificationStatus ?? "").trim() || undefined,
  };
}

/** Map worker incoming application rows to employer applicant card shape (shared Figma ApplicantCard). */
export function workerIncomingToApplicantListItem(
  item: WorkerIncomingApplicationListItem,
): EmployerApplicantListItem {
  const snapshot = snapshotFromItem(item);
  const extras = profileExtras(snapshot);

  return {
    applicationId: item.applicationId ?? item.id,
    id: item.id ?? item.applicationId,
    applicantName: item.applicantName,
    workerName: item.applicantName,
    workerPhotoUrl: item.applicantAvatarUrl,
    applicantAvatarUrl: item.applicantAvatarUrl,
    photoUrl: item.applicantAvatarUrl,
    avatarUrl: item.applicantAvatarUrl,
    workerHeadline: extras.headline,
    workerLocation: extras.location,
    location: extras.location,
    jobTitle: item.jobTitle,
    jobId: item.jobId,
    status: item.status,
    matchScore: item.matchPercent,
    appliedAt: item.appliedAt,
    profileSnapshot: snapshot,
    topSkills: extras.skills,
    skills: extras.skills,
    verificationStatus: extras.verificationStatus,
  };
}

export function workerIncomingToApplicantDetail(
  item: WorkerIncomingApplicationDetail | undefined,
  job?: WorkerOwnedJobDetail | null,
): EmployerApplicantDetail | undefined {
  if (!item) return undefined;

  const base = workerIncomingToApplicantListItem(item);
  const jobDetail = job
    ? {
        id: job.jobId,
        jobId: job.jobId,
        title: job.title,
        jobType: job.jobType,
        employmentType: job.jobType,
        city: job.city,
        location: job.location,
        neighbourhood: job.neighbourhood,
        salary: job.salary,
        pay: job.pay,
        currency: job.currency,
        per: job.per,
        requiredSkills: job.requiredSkills,
        applicantsCount: job.applicantsCount,
        description: job.description,
        requirements: job.requirements,
        responsibilities: job.responsibilities,
      }
    : undefined;

  const coverNote =
    typeof item.coverNote === "string"
      ? item.coverNote
      : typeof (item as { jobSpecificNote?: string }).jobSpecificNote === "string"
        ? (item as { jobSpecificNote?: string }).jobSpecificNote
        : undefined;

  return {
    ...base,
    profileSnapshot: snapshotFromItem(item) as EmployerApplicantDetail["profileSnapshot"],
    job: jobDetail as EmployerApplicantDetail["job"],
    coverNote,
  };
}
