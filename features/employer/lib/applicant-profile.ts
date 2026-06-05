import type { EmployerApplicantListItem } from "@/features/employer/types/employer-portal";

export function formatAppliedAgo(iso?: string): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;
  return `${Math.floor(days / 30)}mo`;
}

export function applicantMatchText(applicant: EmployerApplicantListItem): string | null {
  const raw = applicant.matchScore ?? applicant.match;
  if (raw == null || raw === "") return null;
  if (typeof raw === "number") return `${raw}% match`;
  const s = String(raw);
  return s.includes("%") ? s : `${s}% match`;
}

export function applicantSkillsList(applicant: EmployerApplicantListItem): string[] {
  if (Array.isArray(applicant.skills)) {
    return applicant.skills.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof applicant.topSkills === "string" && applicant.topSkills.trim()) {
    return applicant.topSkills
      .split(/[,•|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export function applicantHeadline(applicant: EmployerApplicantListItem): string {
  const profile = applicant.submittedProfile as Record<string, unknown> | undefined;
  if (typeof profile?.headline === "string" && profile.headline.trim()) {
    return profile.headline;
  }
  const role = String(applicant.jobTitle ?? applicant.role ?? "—");
  return role;
}

export function applicantIsVerified(applicant: EmployerApplicantListItem): boolean {
  const status =
    applicant.verificationStatus ??
    applicant.kycStatus ??
    (applicant.submittedProfile as Record<string, unknown> | undefined)?.verificationStatus ??
    (applicant.submittedProfile as Record<string, unknown> | undefined)?.kycStatus;
  return String(status ?? "").toUpperCase() === "VERIFIED";
}

export type ParsedApplicantProfile = {
  fullName: string;
  headline: string;
  location: string;
  phone: string;
  languages: string;
  availability: string;
  summary: string;
  industries: string;
  skills: string[];
  highlightedSkills: string[];
  workHistory: { company: string; role: string; description: string; period: string }[];
  documents: { name: string; type: string }[];
  avatarUrl: string | null;
  verified: boolean;
};

export function parseSubmittedProfile(profile: Record<string, unknown> | undefined): ParsedApplicantProfile {
  const p = profile ?? {};
  const fullName = String(p.fullName ?? p.name ?? "Applicant");
  const headline = String(p.headline ?? p.title ?? p.role ?? "");
  const location = String(p.location ?? p.city ?? "");
  const phone = String(p.phone ?? p.phoneNumber ?? "");
  const languages = String(p.languages ?? p.language ?? "");
  const availability = String(p.availability ?? p.workAvailability ?? "");

  const summary = String(p.professionalSummary ?? p.summary ?? p.bio ?? "");
  const industries = String(p.industries ?? p.industry ?? "");

  const skillsRaw = p.skills;
  let skills: string[] = [];
  if (Array.isArray(skillsRaw)) {
    skills = skillsRaw.map((s) => String(s).trim()).filter(Boolean);
  } else if (typeof skillsRaw === "string") {
    skills = skillsRaw
      .split(/[,•|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const highlightedRaw = p.highlightedSkills ?? p.topSkills;
  let highlightedSkills: string[] = [];
  if (Array.isArray(highlightedRaw)) {
    highlightedSkills = highlightedRaw.map((s) => String(s).trim()).filter(Boolean);
  } else if (typeof highlightedRaw === "string") {
    highlightedSkills = highlightedRaw
      .split(/[,•|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const workRaw = p.workHistory ?? p.experience ?? p.workExperience;
  let workHistory: ParsedApplicantProfile["workHistory"] = [];
  if (Array.isArray(workRaw)) {
    workHistory = workRaw.map((item) => {
      const row = item as Record<string, unknown>;
      return {
        company: String(row.company ?? row.employer ?? ""),
        role: String(row.role ?? row.title ?? ""),
        description: String(row.description ?? row.summary ?? ""),
        period: String(row.period ?? row.dates ?? [row.startDate, row.endDate].filter(Boolean).join(" – ")),
      };
    });
  }

  const docsRaw = p.documents ?? p.supportingDocuments;
  let documents: ParsedApplicantProfile["documents"] = [];
  if (Array.isArray(docsRaw)) {
    documents = docsRaw.map((item) => {
      const row = item as Record<string, unknown>;
      const name = String(row.name ?? row.fileName ?? "Document");
      const ext = name.split(".").pop()?.toUpperCase() ?? "FILE";
      return { name, type: String(row.type ?? ext) };
    });
  }

  const avatarUrl =
    typeof p.photoUrl === "string"
      ? p.photoUrl
      : typeof p.avatarUrl === "string"
        ? p.avatarUrl
        : typeof p.profilePhotoUrl === "string"
          ? p.profilePhotoUrl
      : typeof p.photo === "string"
        ? p.photo
        : typeof p.avatar === "string"
          ? p.avatar
          : null;
  const verified = String(p.verificationStatus ?? p.kycStatus ?? "").toUpperCase() === "VERIFIED";

  return {
    fullName,
    headline,
    location,
    phone,
    languages,
    availability,
    summary,
    industries,
    skills,
    highlightedSkills,
    workHistory,
    documents,
    avatarUrl,
    verified,
  };
}
