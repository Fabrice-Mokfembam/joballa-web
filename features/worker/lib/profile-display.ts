import type {
  ProfileCompletenessBreakdown,
  WorkerCertification,
  WorkerDocument,
  WorkerEducation,
  WorkerFullProfile,
  WorkerWorkHistory,
} from "@/features/worker/types/worker-portal";
import { sortByMostRecent } from "@/features/worker/lib/profile-sort";

export function profileDisplayName(profile: WorkerFullProfile): string {
  const fromParts = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
  return profile.fullName?.trim() || fromParts;
}

/** One or two initials from a display name (e.g. "Jane Doe" → "JD"). */
export function profileInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase();
  }
  return parts[0]!.charAt(0).toUpperCase();
}

export function profileHeadline(profile: WorkerFullProfile): string {
  return profile.professionalTitle?.trim() ?? "";
}

export function profileLocationLine(profile: WorkerFullProfile): string {
  const parts = [profile.city, profile.region, profile.country].filter(Boolean);
  return parts.join(", ");
}

export function profileLanguagesLine(profile: WorkerFullProfile): string {
  const langs = profile.languages ?? [];
  return langs.length > 0 ? langs.join(", ") : "";
}

export function profileSkillsLine(profile: WorkerFullProfile): string {
  const skills = profile.skills ?? [];
  return skills.length > 0 ? skills.join(", ") : "";
}

export function profileEmploymentTypes(profile: WorkerFullProfile): string {
  const types = profile.preferredJobTypes ?? [];
  if (types.length === 0) return "";
  return types
    .map((t) => String(t).replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(", ");
}

export function profileIndustriesLine(profile: WorkerFullProfile): string {
  const industries = profile.industries ?? [];
  return industries.length > 0 ? industries.join(", ") : "";
}

function formatDateRange(
  startDate?: string,
  endDate?: string | null,
  isCurrent?: boolean,
): string {
  const start = startDate ? formatMonthYear(startDate) : "";
  const end =
    isCurrent || (startDate && !endDate)
      ? "Present"
      : endDate
        ? formatMonthYear(endDate)
        : "";
  if (start && end) return `${start} – ${end}`;
  return start || end;
}

export function formatWorkHistoryMeta(entry: WorkerWorkHistory): string {
  const range = formatDateRange(entry.startDate, entry.endDate, entry.isCurrent);
  const location = (entry as { city?: string }).city;
  return [range, location].filter(Boolean).join(" • ");
}

export function formatEducationMeta(entry: WorkerEducation): string {
  return formatDateRange(entry.startDate, entry.endDate, entry.isCurrent);
}

export function formatCertificationMeta(entry: WorkerCertification): string {
  const parts: string[] = [];
  if (entry.issuer?.trim()) parts.push(entry.issuer.trim());
  if (entry.issueDate) parts.push(formatMonthYear(entry.issueDate));
  if (entry.expiryDate) parts.push(`Expires ${formatMonthYear(entry.expiryDate)}`);
  return parts.join(" • ");
}

function formatMonthYear(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

function isWeightedBreakdown(
  breakdown: WorkerFullProfile["profileStrengthBreakdown"],
): breakdown is ProfileCompletenessBreakdown {
  if (!breakdown || typeof breakdown !== "object") return false;
  return "personalInfo" in breakdown || "experience" in breakdown;
}

export function profileSectionCompletion(profile: WorkerFullProfile) {
  const breakdown = profile.profileStrengthBreakdown;
  if (isWeightedBreakdown(breakdown)) {
    const max = {
      personal: 20,
      summary: 10,
      skills: 15,
      work: 20,
      education: 10,
      verification: 10,
      payment: 0,
    };
    return {
      personal: (breakdown.personalInfo ?? 0) >= max.personal,
      summary: (breakdown.summary ?? 0) >= max.summary,
      skills: (breakdown.skills ?? 0) >= max.skills,
      work: (breakdown.experience ?? 0) >= max.work,
      education: (breakdown.education ?? 0) >= max.education,
      verification: (breakdown.verification ?? 0) >= max.verification,
      payment: hasPaymentMethod(profile),
    };
  }

  return {
    personal: !!(profileDisplayName(profile) && profile.city),
    summary: !!(profile.professionalTitle && profile.summary),
    skills: (profile.skills?.length ?? 0) >= 1,
    work: (profile.workHistories?.length ?? 0) > 0,
    education: (profile.educations?.length ?? 0) > 0,
    verification:
      profile.kycSubmissions?.some((k) => String(k.status).toUpperCase() === "VERIFIED") ?? false,
    payment: hasPaymentMethod(profile),
  };
}

function hasPaymentMethod(profile: WorkerFullProfile): boolean {
  const methods = profile.paymentMethods ?? profile.paymentAccounts ?? [];
  if (methods.length > 0) return true;
  return !!(profile.mobileMoneyNumber?.trim());
}

export function sortedWorkHistories(profile: WorkerFullProfile) {
  return sortByMostRecent(profile.workHistories ?? []);
}

export function sortedEducations(profile: WorkerFullProfile) {
  return sortByMostRecent(profile.educations ?? []);
}

export function sortedCertifications(profile: WorkerFullProfile) {
  return sortByMostRecent(profile.certifications ?? []);
}

export function documentFileLabel(doc: WorkerDocument): string {
  return doc.fileName ?? doc.url ?? "";
}
