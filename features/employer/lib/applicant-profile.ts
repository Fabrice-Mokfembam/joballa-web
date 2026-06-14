import type {
  EmployerApplicantListItem,
  EmployerApplicantDetail,
  EmployerJobDetail,
} from "@/features/employer/types/employer-portal";
import {
  resolveApplicantDisplayName,
  resolveApplicantHeadline,
  type RawApplicantIdentity,
} from "@/features/employer/lib/resolve-applicant-display";

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[,•|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function joinLocationParts(...parts: unknown[]): string {
  return parts.map((part) => String(part ?? "").trim()).filter(Boolean).join(", ");
}

function formatPreferredJobTypes(value: unknown): string {
  const labels: Record<string, string> = {
    FULL_TIME: "Full-time",
    PART_TIME: "Part-time",
    CONTRACT: "Contract",
    INTERNSHIP: "Internship",
    TEMPORARY: "Temporary",
  };
  if (Array.isArray(value)) {
    return value
      .map((item) => labels[String(item).trim().toUpperCase().replace(/-/g, "_")] ?? String(item))
      .join(", ");
  }
  return String(value ?? "").trim();
}

function formatIndustryItem(item: string): string {
  const key = item.trim().toUpperCase().replace(/-/g, "_");
  const labels: Record<string, string> = {
    SOFTWARE_TECH: "Software & Tech",
    DESIGN: "Design & Creative",
    DESIGN_CREATIVE: "Design & Creative",
    MARKETING: "Marketing",
    FINANCE: "Finance",
    EDUCATION: "Education",
    HEALTH: "Health",
    HEALTHCARE: "Health",
  };
  if (labels[key]) return labels[key];
  if (key.includes("_")) {
    return item
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
  return item.trim();
}

function formatIndustries(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => formatIndustryItem(String(item))).filter(Boolean).join(", ");
  }
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (raw.includes(",")) {
    return raw.split(",").map((part) => formatIndustryItem(part)).filter(Boolean).join(", ");
  }
  return formatIndustryItem(raw);
}

function formatAvailabilityStatus(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const upper = raw.toUpperCase();
  if (upper === "AVAILABLE") return "Available";
  if (upper === "NOT_AVAILABLE") return "Not available";
  return raw;
}

function resolveAvailability(p: Record<string, unknown>): string {
  const preformatted = String(p.availability ?? "").trim();
  if (preformatted && (preformatted.includes("·") || (preformatted.includes(",") && preformatted.includes("-")))) {
    return preformatted;
  }

  const preferred = formatPreferredJobTypes(p.preferredJobTypes);
  const status = formatAvailabilityStatus(p.availabilityStatus ?? (preformatted || undefined));
  if (preferred && status) return `${status} · ${preferred}`;
  return preferred || status || preformatted;
}

function formatFileSize(value: unknown): string | undefined {
  if (value == null || value === "") return undefined;
  if (typeof value === "string") return value.trim() || undefined;
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return String(value);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10240 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatWorkPeriod(row: Record<string, unknown>): string {
  const existing = String(row.period ?? row.dates ?? "").trim();
  if (existing) return existing;

  const start = [row.startMonth, row.startYear].map((part) => String(part ?? "").trim()).filter(Boolean).join(" ");
  const end = row.isCurrent
    ? "Present"
    : [row.endMonth, row.endYear].map((part) => String(part ?? "").trim()).filter(Boolean).join(" ");

  if (start || end) {
    return [start, end].filter(Boolean).join(" - ");
  }

  return [row.startDate, row.endDate].map((part) => String(part ?? "").trim()).filter(Boolean).join(" – ");
}

function formatLanguages(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean).join(", ");
  }
  return String(value ?? "").trim();
}

function mapDocumentRow(item: unknown): ParsedApplicantProfile["documents"][number] {
  if (typeof item === "string") {
    const name = item.split("/").pop() ?? "Document";
    const ext = name.split(".").pop()?.toUpperCase() ?? "FILE";
    return { name, type: ext };
  }

  const row = item as Record<string, unknown>;
  const name = String(row.name ?? row.fileName ?? "Document");
  const ext = name.split(".").pop()?.toUpperCase() ?? "FILE";
  const size = formatFileSize(row.size ?? row.fileSize);
  const downloadUrl = typeof row.downloadUrl === "string" ? row.downloadUrl : undefined;
  const url =
    downloadUrl ??
    (typeof row.url === "string" ? row.url : typeof row.fileUrl === "string" ? row.fileUrl : undefined);

  return { name, type: String(row.type ?? ext), size, url, downloadUrl };
}

function mergeDocumentRows(...groups: unknown[][]): ParsedApplicantProfile["documents"] {
  const seen = new Set<string>();
  const documents: ParsedApplicantProfile["documents"] = [];

  for (const group of groups) {
    if (!Array.isArray(group)) continue;
    for (const item of group) {
      const doc = mapDocumentRow(item);
      const key = `${doc.url ?? ""}:${doc.name}`.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      documents.push(doc);
    }
  }

  return documents;
}

function resolveSnapshotHeadline(p: Record<string, unknown>): string {
  const summary = String(p.professionalSummary ?? p.summary ?? p.bio ?? p.shortBio ?? "").trim();
  const professionalTitle = String(p.professionalTitle ?? "").trim();
  if (professionalTitle) return professionalTitle;
  const legacyHeadline = String(p.headline ?? p.title ?? "").trim();
  if (legacyHeadline && legacyHeadline !== summary) return legacyHeadline;
  return "";
}

function resolveWorkHistoryRaw(p: Record<string, unknown>): unknown[] | undefined {
  const raw =
    p.workHistory ??
    p.workHistories ??
    p.workExperiences ??
    p.experience ??
    p.workExperience;
  return Array.isArray(raw) ? raw : undefined;
}

function resolveEducationRaw(p: Record<string, unknown>): unknown[] | undefined {
  const raw = p.educations ?? p.education;
  return Array.isArray(raw) ? raw : undefined;
}

function resolveCertificationsRaw(p: Record<string, unknown>): unknown[] | undefined {
  const raw = p.certifications;
  return Array.isArray(raw) ? raw : undefined;
}

function mapCertificationRow(
  item: unknown,
): ParsedApplicantProfile["certifications"][number] {
  const row = item as Record<string, unknown>;
  return {
    name: String(row.name ?? ""),
    issuer: String(row.issuer ?? ""),
    issueDate: String(row.issueDate ?? ""),
    expiryDate: String(row.expiryDate ?? ""),
    credentialUrl: String(row.credentialUrl ?? row.url ?? ""),
  };
}

function mapEducationRow(item: unknown): ParsedApplicantProfile["education"][number] {
  const row = item as Record<string, unknown>;
  const institution = String(row.institution ?? row.school ?? row.university ?? "");
  const degree = String(row.degree ?? row.qualification ?? "");
  const field = String(row.fieldOfStudy ?? row.field ?? row.major ?? "");
  const period = formatWorkPeriod(row);
  const description = String(row.description ?? "");
  return { institution, degree, field, period, description };
}

function resolveDocumentsRaw(p: Record<string, unknown>): unknown[] | undefined {
  const raw = p.documents ?? p.supportingDocuments ?? p.workerDocuments;
  return Array.isArray(raw) ? raw : undefined;
}

/** Normalize worker DB snapshot fields into the UI profile shape. */
export function coerceProfileSnapshot(profile: Record<string, unknown> | undefined): Record<string, unknown> {
  const p = profile ?? {};
  const workRaw = resolveWorkHistoryRaw(p);
  const workHistory = workRaw
    ? workRaw.map((item) => {
        const row = item as Record<string, unknown>;
        const location = String(row.location ?? joinLocationParts(row.city, row.region, row.country));
        const period = formatWorkPeriod(row);
        return {
          company: String(row.company ?? row.companyName ?? row.employer ?? ""),
          role: String(row.role ?? row.jobTitle ?? row.title ?? ""),
          description: String(row.description ?? row.summary ?? ""),
          period,
          location,
        };
      })
    : undefined;

  const docsRaw = resolveDocumentsRaw(p);
  const documents = docsRaw ? docsRaw.map(mapDocumentRow) : undefined;

  const eduRaw = resolveEducationRaw(p);
  const education = eduRaw ? eduRaw.map(mapEducationRow) : undefined;

  const certRaw = resolveCertificationsRaw(p);
  const certifications = certRaw ? certRaw.map(mapCertificationRow) : undefined;

  const skills = asStringArray(p.skills);
  const highlightedSkills = asStringArray(p.highlightedSkills ?? p.topSkills);

  return {
    ...p,
    fullName: String(
      p.fullName ??
        ([p.firstName, p.lastName].map((part) => String(part ?? "").trim()).filter(Boolean).join(" ") ||
          p.name ||
          ""),
    ),
    headline: resolveSnapshotHeadline(p),
    location: String(p.location ?? joinLocationParts(p.city, p.region, p.country)),
    phone: String(p.phone ?? p.phoneNumber ?? p.mobileMoneyNumber ?? ""),
    languages: formatLanguages(p.languages ?? p.languagesSpoken ?? p.language),
    availability: resolveAvailability(p),
    summary: String(p.professionalSummary ?? p.summary ?? p.bio ?? p.shortBio ?? ""),
    industries: formatIndustries(p.industries ?? p.industry ?? p.preferredJobCategories),
    skills: skills.length > 0 ? skills : p.skills,
    highlightedSkills: highlightedSkills.length > 0 ? highlightedSkills : p.highlightedSkills,
    workHistory,
    education,
    certifications,
    documents,
    avatarUrl: p.avatarUrl ?? p.photoUrl ?? p.profilePhotoUrl ?? p.photo,
    verificationStatus: p.verificationStatus ?? p.kycStatus,
  };
}

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
  const top = applicant.topSkills;
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

export function applicantHeadline(applicant: EmployerApplicantListItem): string {
  return resolveApplicantHeadline(applicant as RawApplicantIdentity) ?? "";
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
  workHistory: { company: string; role: string; description: string; period: string; location: string }[];
  education: { institution: string; degree: string; field: string; period: string; description: string }[];
  certifications: {
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate: string;
    credentialUrl: string;
  }[];
  documents: { name: string; type: string; size?: string; url?: string; downloadUrl?: string }[];
  avatarUrl: string | null;
  verified: boolean;
};

export function parseSubmittedProfile(profile: Record<string, unknown> | undefined): ParsedApplicantProfile {
  const p = coerceProfileSnapshot(profile);
  const fullName = String(p.fullName ?? p.name ?? "Applicant");
  const headline = resolveSnapshotHeadline(p);
  const location = String(p.location ?? joinLocationParts(p.city, p.region, p.country));
  const phone = String(p.phone ?? p.phoneNumber ?? p.mobileMoneyNumber ?? "");
  const languages = formatLanguages(p.languages ?? p.languagesSpoken ?? p.language);
  const availability = resolveAvailability(p);

  const summary = String(p.professionalSummary ?? p.summary ?? p.bio ?? p.shortBio ?? "");
  const industries = formatIndustries(p.industries ?? p.industry ?? p.preferredJobCategories);

  const skills = asStringArray(p.skills);
  const highlightedSkills = asStringArray(p.highlightedSkills ?? p.topSkills);

  const workRaw = resolveWorkHistoryRaw(p);
  let workHistory: ParsedApplicantProfile["workHistory"] = [];
  if (workRaw) {
    workHistory = workRaw.map((item) => {
      const row = item as Record<string, unknown>;
      const locationValue = String(row.location ?? joinLocationParts(row.city, row.region, row.country));
      return {
        company: String(row.company ?? row.companyName ?? row.employer ?? ""),
        role: String(row.role ?? row.jobTitle ?? row.title ?? ""),
        description: String(row.description ?? row.summary ?? ""),
        period: formatWorkPeriod(row),
        location: locationValue,
      };
    });
  }

  const docsRaw = resolveDocumentsRaw(p);
  const documents = docsRaw ? docsRaw.map(mapDocumentRow) : [];

  const eduRaw = resolveEducationRaw(p);
  const education: ParsedApplicantProfile["education"] = eduRaw ? eduRaw.map(mapEducationRow) : [];

  const certRaw = resolveCertificationsRaw(p);
  const certifications: ParsedApplicantProfile["certifications"] = certRaw
    ? certRaw.map(mapCertificationRow).filter((c) => c.name.trim())
    : [];

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
    education,
    certifications,
    documents,
    avatarUrl,
    verified,
  };
}

/** Merge API applicant fields with submitted/profile snapshot for detail views. */
export function parseApplicantDetailProfile(data: EmployerApplicantDetail | undefined): ParsedApplicantProfile {
  if (!data) {
    return parseSubmittedProfile(undefined);
  }

  const raw = data as RawApplicantIdentity & {
    workerPhotoUrl?: string | null;
    workerLocation?: string | null;
    workerHeadline?: string | null;
    topSkills?: string[] | string | null;
    verificationStatus?: string | null;
    attachedDocuments?: unknown[];
    profileSnapshot?: Record<string, unknown>;
  };

  const snapshot = raw.profileSnapshot;
  const profileSource = coerceProfileSnapshot(
    snapshot && typeof snapshot === "object" ? (snapshot as Record<string, unknown>) : undefined,
  );

  const parsed = parseSubmittedProfile(profileSource);

  parsed.fullName = resolveApplicantDisplayName(raw);
  parsed.headline = resolveApplicantHeadline(raw) ?? parsed.headline;

  if (!parsed.avatarUrl && typeof raw.workerPhotoUrl === "string" && raw.workerPhotoUrl.trim()) {
    parsed.avatarUrl = raw.workerPhotoUrl.trim();
  }
  if (!parsed.location && typeof raw.workerLocation === "string" && raw.workerLocation.trim()) {
    parsed.location = raw.workerLocation.trim();
  }

  const topSkills = asStringArray(raw.topSkills);
  if (parsed.skills.length === 0 && topSkills.length > 0) {
    parsed.skills = topSkills;
  } else if (topSkills.length > 0) {
    const merged = [...parsed.skills];
    for (const skill of topSkills) {
      if (!merged.some((item) => item.toLowerCase() === skill.toLowerCase())) {
        merged.push(skill);
      }
    }
    parsed.skills = merged;
  }

  // Prefer snapshot highlightedSkills from backend; only fall back to list topSkills / job match.
  if (parsed.highlightedSkills.length === 0 && topSkills.length > 0) {
    parsed.highlightedSkills = topSkills;
  }

  const job = data.job as EmployerJobDetail | undefined;
  const requiredSkills = asStringArray(job?.requiredSkills);
  if (parsed.highlightedSkills.length === 0 && requiredSkills.length > 0 && parsed.skills.length > 0) {
    parsed.highlightedSkills = parsed.skills.filter((skill) =>
      requiredSkills.some((required) => required.toLowerCase() === skill.toLowerCase()),
    );
  }

  if (!parsed.verified) {
    parsed.verified = String(raw.verificationStatus ?? "").toUpperCase() === "VERIFIED";
  }

  // Backend keeps snapshot docs (worker CV) separate from apply-time attachedDocuments — merge for UI.
  parsed.documents = mergeDocumentRows(
    resolveDocumentsRaw(profileSource) ?? [],
    Array.isArray(raw.attachedDocuments) ? raw.attachedDocuments : [],
  );

  return parsed;
}

export function parseLiveWorkerProfile(data: EmployerApplicantDetail | undefined): ParsedApplicantProfile | null {
  const raw = (data as { liveProfile?: Record<string, unknown> | null } | undefined)?.liveProfile;
  if (!raw || typeof raw !== "object") return null;
  return parseSubmittedProfile(raw);
}
