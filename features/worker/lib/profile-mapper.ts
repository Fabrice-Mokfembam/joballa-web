import type {
  PatchPaymentDetailsBody,
  PatchPersonalInfoBody,
  PatchProfessionalSummaryBody,
  PatchSkillsBody,
  PutWorkerProfileBody,
  SubmitKycBody,
  WorkerCertification,
  WorkerDocument,
  WorkerEducation,
  WorkerFullProfile,
  WorkerKycSubmission,
  WorkerMe,
  WorkerMeProfile,
  WorkerPaymentAccount,
  WorkerWorkHistory,
  CreateWorkerPaymentAccountBody,
} from "@/features/worker/types/worker-portal";

type ApiRecord = Record<string, unknown>;

function asRecord(value: unknown): ApiRecord | null {
  return value && typeof value === "object" ? (value as ApiRecord) : null;
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function mapWorkHistory(entry: unknown): WorkerWorkHistory | null {
  const raw = asRecord(entry);
  if (!raw) return null;
  const id = String(raw.id ?? raw.workId ?? "");
  const jobTitle = String(raw.jobTitle ?? raw.role ?? raw.title ?? "").trim();
  const companyName = String(raw.companyName ?? raw.company ?? raw.employer ?? "").trim();
  if (!id && !jobTitle && !companyName) return null;
  return {
    id: id || `work-${jobTitle}-${companyName}`,
    jobTitle,
    companyName,
    startDate: raw.startDate != null ? String(raw.startDate) : undefined,
    endDate: raw.endDate != null ? String(raw.endDate) : raw.endDate === null ? null : undefined,
    isCurrent: typeof raw.isCurrent === "boolean" ? raw.isCurrent : undefined,
    description: typeof raw.description === "string" ? raw.description : undefined,
  };
}

function mapEducation(entry: unknown): WorkerEducation | null {
  const raw = asRecord(entry);
  if (!raw) return null;
  const id = String(raw.id ?? raw.educationId ?? "");
  const institution = String(raw.institution ?? raw.school ?? "").trim();
  const degree = String(raw.degree ?? raw.qualification ?? raw.certificate ?? "").trim();
  if (!id && !institution && !degree) return null;
  return {
    id: id || `education-${institution}`,
    institution,
    degree: degree || undefined,
    fieldOfStudy: typeof raw.fieldOfStudy === "string" ? raw.fieldOfStudy : undefined,
    startDate: raw.startDate != null ? String(raw.startDate) : undefined,
    endDate: raw.endDate != null ? String(raw.endDate) : raw.endDate === null ? null : undefined,
    isCurrent: typeof raw.isCurrent === "boolean" ? raw.isCurrent : undefined,
  };
}

function mapCertification(entry: unknown): WorkerCertification | null {
  const raw = asRecord(entry);
  if (!raw) return null;
  const id = String(raw.id ?? raw.certificationId ?? "");
  const name = String(raw.name ?? raw.title ?? raw.certificationName ?? "").trim();
  if (!id && !name) return null;
  return {
    id: id || `cert-${name}`,
    name,
    issuer: typeof raw.issuer === "string" ? raw.issuer : undefined,
    issueDate: raw.issueDate != null ? String(raw.issueDate) : undefined,
    expiryDate: raw.expiryDate != null ? String(raw.expiryDate) : raw.expiryDate === null ? null : undefined,
    credentialUrl:
      typeof raw.credentialUrl === "string"
        ? raw.credentialUrl
        : raw.credentialUrl === null
          ? null
          : undefined,
    createdAt: raw.createdAt != null ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt != null ? String(raw.updatedAt) : undefined,
  };
}

function mapDocument(entry: unknown): WorkerDocument | null {
  const raw = asRecord(entry);
  if (!raw) return null;
  const id = String(raw.id ?? raw.documentId ?? "");
  const url = String(raw.url ?? raw.fileUrl ?? "");
  if (!id && !url) return null;
  const mimeType = typeof raw.mimeType === "string" ? raw.mimeType : undefined;
  const fileType =
    raw.fileType === "pdf" || raw.fileType === "image"
      ? raw.fileType
      : mimeType?.startsWith("image/")
        ? "image"
        : mimeType === "application/pdf"
          ? "pdf"
          : undefined;
  return {
    id: id || url,
    type: typeof raw.type === "string" ? raw.type : undefined,
    fileName: typeof raw.fileName === "string" ? raw.fileName : undefined,
    url: url || undefined,
    mimeType,
    fileType,
    createdAt: raw.createdAt != null ? String(raw.createdAt) : undefined,
  };
}

function mapKyc(entry: unknown): WorkerKycSubmission | null {
  const raw = asRecord(entry);
  if (!raw) return null;
  const id = String(raw.id ?? "");
  const docType = String(raw.documentType ?? raw.kycType ?? "").toUpperCase();
  return {
    id: id || "kyc-latest",
    documentType: docType || undefined,
    status: raw.status != null ? String(raw.status) : undefined,
    frontIdImageUrl:
      typeof raw.frontIdImageUrl === "string"
        ? raw.frontIdImageUrl
        : typeof raw.frontUrl === "string"
          ? raw.frontUrl
          : null,
    backIdImageUrl:
      typeof raw.backIdImageUrl === "string"
        ? raw.backIdImageUrl
        : typeof raw.backUrl === "string"
          ? raw.backUrl
          : null,
    selfieImageUrl:
      typeof raw.selfieImageUrl === "string"
        ? raw.selfieImageUrl
        : typeof raw.selfieUrl === "string"
          ? raw.selfieUrl
          : null,
    rejectionReason: typeof raw.rejectionReason === "string" ? raw.rejectionReason : null,
    reviewNotes: typeof raw.reviewNotes === "string" ? raw.reviewNotes : null,
    submittedAt: raw.submittedAt != null ? String(raw.submittedAt) : undefined,
    createdAt: raw.createdAt != null ? String(raw.createdAt) : undefined,
  };
}

function mapPaymentAccount(entry: unknown): WorkerPaymentAccount | null {
  const raw = asRecord(entry);
  if (!raw) return null;
  const id = String(raw.id ?? raw.accountId ?? "");
  const phone = String(raw.phone ?? raw.phoneNumber ?? "").trim();
  const provider = String(raw.provider ?? "").trim();
  if (!id && !phone) return null;
  return {
    id: id || phone,
    provider,
    phone,
    phoneNumber: phone,
    isPrimary: typeof raw.isPrimary === "boolean" ? raw.isPrimary : undefined,
    createdAt: raw.createdAt != null ? String(raw.createdAt) : undefined,
  };
}

function providerToUi(provider: string): "MTN_MOMO" | "ORANGE_MONEY" {
  const p = provider.toLowerCase();
  if (p.includes("orange")) return "ORANGE_MONEY";
  return "MTN_MOMO";
}

function providerToApi(provider: string): string {
  const p = provider.toUpperCase();
  if (p.includes("ORANGE")) return "orange_money";
  return "mtn_momo";
}

/** Map v2 `GET /worker/profile` (and PATCH responses) → UI `WorkerFullProfile`. */
export function normalizeWorkerProfile(raw: unknown): WorkerFullProfile {
  const root = asRecord(raw) ?? {};
  const data =
    asRecord(root.workerProfile) ??
    asRecord(root.profile) ??
    asRecord(root.data) ??
    root;
  const workRaw =
    data.workHistories ??
    data.workExperiences ??
    data.workHistory ??
    [];
  const educationRaw = data.educations ?? data.education ?? [];
  const documentsRaw = data.documents ?? data.supportingDocuments ?? [];
  const kycRaw = data.kycSubmissions ?? (data.latestKyc ? [data.latestKyc] : []);
  const paymentAccounts = asArray<unknown>(data.paymentAccounts ?? data.paymentMethods)
    .map(mapPaymentAccount)
    .filter((a): a is WorkerPaymentAccount => a != null);
  const primaryAccount =
    paymentAccounts.find((a) => a.isPrimary) ?? paymentAccounts[0] ?? null;
  const completenessBreakdown =
    (data.profileStrengthBreakdown ?? data.profileCompletenessBreakdown) as WorkerFullProfile["profileStrengthBreakdown"];

  const profile: WorkerFullProfile = {
    id: String(data.id ?? ""),
    userId: data.userId != null ? String(data.userId) : undefined,
    firstName: data.firstName != null ? String(data.firstName) : null,
    lastName: data.lastName != null ? String(data.lastName) : null,
    fullName:
      data.fullName != null
        ? String(data.fullName)
        : [data.firstName, data.lastName].filter(Boolean).join(" ").trim() || null,
    city: data.city != null ? String(data.city) : null,
    region: data.region != null ? String(data.region) : null,
    country: data.country != null ? String(data.country) : null,
    languages: asArray<string>(data.languages),
    availabilityStatus:
      data.availabilityStatus != null ? (String(data.availabilityStatus) as WorkerFullProfile["availabilityStatus"]) : undefined,
    availableForHire: typeof data.availableForHire === "boolean" ? data.availableForHire : undefined,
    professionalTitle:
      data.professionalTitle != null
        ? String(data.professionalTitle)
        : data.title != null
          ? String(data.title)
          : null,
    summary:
      data.summary != null
        ? String(data.summary)
        : data.shortBio != null
          ? String(data.shortBio)
          : data.bio != null
            ? String(data.bio)
            : null,
    industries: asArray<string>(data.industries ?? data.preferredJobCategories),
    preferredJobTypes: asArray(data.preferredJobTypes) as WorkerFullProfile["preferredJobTypes"],
    skills: asArray<string>(data.skills),
    avatarUrl:
      data.photoUrl != null
        ? String(data.photoUrl)
        : data.avatarUrl != null
          ? String(data.avatarUrl)
          : data.profilePhotoUrl != null
            ? String(data.profilePhotoUrl)
            : root.photoUrl != null
              ? String(root.photoUrl)
              : root.avatarUrl != null
                ? String(root.avatarUrl)
                : null,
    verificationStatus:
      data.verificationStatus != null ? String(data.verificationStatus) : undefined,
    profileCompleteness:
      typeof data.profileCompleteness === "number" ? data.profileCompleteness : undefined,
    profileStrengthBreakdown: completenessBreakdown,
    profileCompletenessBreakdown: completenessBreakdown as WorkerFullProfile["profileCompletenessBreakdown"],
    workHistories: asArray<unknown>(workRaw)
      .map(mapWorkHistory)
      .filter((w): w is WorkerWorkHistory => w != null),
    educations: asArray<unknown>(educationRaw)
      .map(mapEducation)
      .filter((e): e is WorkerEducation => e != null),
    certifications: asArray<unknown>(data.certifications)
      .map(mapCertification)
      .filter((c): c is WorkerCertification => c != null),
    documents: asArray<unknown>(documentsRaw)
      .map(mapDocument)
      .filter((d): d is WorkerDocument => d != null),
    kycSubmissions: asArray<unknown>(kycRaw)
      .map(mapKyc)
      .filter((k): k is WorkerKycSubmission => k != null),
    paymentAccounts,
    paymentMethods: paymentAccounts,
    mobileMoneyProvider: primaryAccount ? providerToUi(String(primaryAccount.provider)) : null,
    mobileMoneyNumber: primaryAccount?.phone ?? null,
  };

  return profile;
}

function mapMeProfileNested(workerProfile: ApiRecord) {
  const workRaw =
    workerProfile.workHistory ?? workerProfile.workHistories ?? workerProfile.experiences;
  const educationRaw = workerProfile.educations ?? workerProfile.education;
  const documentsRaw = workerProfile.documents ?? workerProfile.profileDocuments;

  return {
    workHistory: asArray<unknown>(workRaw)
      .map(mapWorkHistory)
      .filter((w): w is WorkerWorkHistory => w != null),
    educations: asArray<unknown>(educationRaw)
      .map(mapEducation)
      .filter((e): e is WorkerEducation => e != null),
    certifications: asArray<unknown>(workerProfile.certifications)
      .map(mapCertification)
      .filter((c): c is WorkerCertification => c != null),
    documents: asArray<unknown>(documentsRaw)
      .map(mapDocument)
      .filter((d): d is WorkerDocument => d != null),
    kycSubmissions: (() => {
      const list = asArray<unknown>(workerProfile.kycSubmissions);
      const mapped = list.map(mapKyc).filter((k): k is WorkerKycSubmission => k != null);
      if (mapped.length > 0) return mapped;
      const latest = workerProfile.latestKyc;
      if (latest && typeof latest === "object") {
        const one = mapKyc(latest);
        return one ? [one] : [];
      }
      return [];
    })(),
  };
}

/** Map v2 `GET /worker/me`, whose worker profile avatar field is `photoUrl`. */
export function normalizeWorkerMe(raw: unknown): WorkerMe {
  const data = asRecord(raw) ?? {};
  const workerProfile = asRecord(data.workerProfile);
  if (!workerProfile) return data as WorkerMe;

  const nested = mapMeProfileNested(workerProfile);

  return {
    ...(data as WorkerMe),
    workerProfile: {
      ...workerProfile,
      id: String(workerProfile.id ?? ""),
      fullName: workerProfile.fullName != null ? String(workerProfile.fullName) : null,
      professionalTitle:
        workerProfile.professionalTitle != null ? String(workerProfile.professionalTitle) : null,
      profileCompleteness:
        typeof workerProfile.profileCompleteness === "number"
          ? workerProfile.profileCompleteness
          : Number(workerProfile.profileCompleteness ?? 0) || 0,
      avatarUrl:
        workerProfile.photoUrl != null
          ? String(workerProfile.photoUrl)
          : workerProfile.avatarUrl != null
            ? String(workerProfile.avatarUrl)
            : workerProfile.profilePhotoUrl != null
              ? String(workerProfile.profilePhotoUrl)
              : null,
      summary:
        typeof workerProfile.summary === "string"
          ? workerProfile.summary
          : typeof workerProfile.shortBio === "string"
            ? workerProfile.shortBio
            : undefined,
      skills: asArray<string>(workerProfile.skills).map(String),
      languages: asArray<string>(workerProfile.languages).map(String),
      ...nested,
    },
  };
}

/** Enrich sparse `GET /worker/me` with `GET /worker/profile` for nav, logging, and completeness. */
export function mergeWorkerMeWithProfile(me: WorkerMe, profile: WorkerFullProfile): WorkerMe {
  if (!me.workerProfile) return me;

  return {
    ...me,
    workerProfile: {
      ...me.workerProfile,
      fullName: me.workerProfile.fullName ?? profile.fullName ?? null,
      professionalTitle: me.workerProfile.professionalTitle ?? profile.professionalTitle ?? null,
      city: me.workerProfile.city ?? profile.city ?? null,
      region: me.workerProfile.region ?? profile.region ?? null,
      profileCompleteness: profile.profileCompleteness ?? me.workerProfile.profileCompleteness,
      profileStrengthBreakdown:
        profile.profileStrengthBreakdown ?? me.workerProfile.profileStrengthBreakdown,
      verificationStatus: (profile.verificationStatus ??
        me.workerProfile.verificationStatus) as WorkerMeProfile["verificationStatus"],
      availabilityStatus: (profile.availabilityStatus ??
        me.workerProfile.availabilityStatus) as WorkerMeProfile["availabilityStatus"],
      availableForHire: profile.availableForHire ?? me.workerProfile.availableForHire,
      avatarUrl: profile.avatarUrl ?? me.workerProfile.avatarUrl ?? null,
      summary: profile.summary ?? (me.workerProfile.summary as string | undefined),
      skills: profile.skills?.length ? profile.skills : (me.workerProfile.skills as string[] | undefined),
      languages: profile.languages?.length
        ? profile.languages
        : (me.workerProfile.languages as string[] | undefined),
      workHistory: profile.workHistory ?? (me.workerProfile.workHistory as WorkerWorkHistory[] | undefined),
      educations: profile.educations ?? (me.workerProfile.educations as WorkerEducation[] | undefined),
      certifications:
        profile.certifications ?? (me.workerProfile.certifications as WorkerCertification[] | undefined),
      documents: profile.documents ?? (me.workerProfile.documents as WorkerDocument[] | undefined),
      kycSubmissions:
        profile.kycSubmissions ?? (me.workerProfile.kycSubmissions as WorkerKycSubmission[] | undefined),
      paymentAccounts:
        profile.paymentAccounts ?? (me.workerProfile.paymentAccounts as WorkerPaymentAccount[] | undefined),
    },
  };
}

export function encodePersonalInfoPatch(body: PatchPersonalInfoBody): ApiRecord {
  return {
    fullName: body.fullName,
    firstName: body.firstName,
    lastName: body.lastName,
    city: body.city,
    region: body.region,
    country: body.country,
    languages: body.languages,
    availabilityStatus: body.availabilityStatus?.toLowerCase(),
  };
}

export function encodeProfessionalSummaryPatch(body: PatchProfessionalSummaryBody): ApiRecord {
  const payload: ApiRecord = {};
  const title = body.title;
  if (title) payload.professionalTitle = title;
  if (body.summary) payload.shortBio = body.summary;
  if (body.industries?.length) payload.preferredJobCategories = body.industries;
  if (body.preferredJobTypes?.length) payload.preferredJobTypes = body.preferredJobTypes;
  return payload;
}

export function encodePutWorkerProfile(body: PutWorkerProfileBody): ApiRecord {
  const payload: ApiRecord = {};
  if (body.firstName !== undefined) payload.firstName = body.firstName;
  if (body.lastName !== undefined) payload.lastName = body.lastName;
  if (body.city !== undefined) payload.city = body.city;
  if (body.region !== undefined) payload.region = body.region;
  if (body.country !== undefined) payload.country = body.country;
  if (body.languages !== undefined) payload.languages = body.languages;
  if (body.availabilityStatus !== undefined) {
    payload.availabilityStatus = String(body.availabilityStatus).toLowerCase();
  }
  if (body.skills !== undefined) payload.skills = body.skills;
  const title = body.title ?? body.professionalTitle;
  if (title !== undefined) payload.professionalTitle = title;
  if (body.summary !== undefined) payload.shortBio = body.summary;
  if (body.industries !== undefined) payload.preferredJobCategories = body.industries;
  if (body.preferredJobTypes !== undefined) payload.preferredJobTypes = body.preferredJobTypes;
  return payload;
}

export function encodePaymentAccountBody(body: {
  mobileMoneyProvider?: string;
  mobileMoneyNumber?: string;
  provider?: string;
  phone?: string;
  isPrimary?: boolean;
}): ApiRecord {
  const provider = body.mobileMoneyProvider ?? body.provider;
  const phone = body.mobileMoneyNumber ?? body.phone;
  const payload: ApiRecord = {};
  if (provider) payload.provider = providerToApi(String(provider));
  if (phone) payload.phoneNumber = String(phone).trim();
  if ("isPrimary" in body && body.isPrimary !== undefined) payload.isPrimary = body.isPrimary;
  return payload;
}

const KYC_TYPE_TO_API: Record<string, string> = {
  NATIONAL_ID: "national_id",
  PASSPORT: "passport",
  DRIVERS_LICENSE: "drivers_license",
};

export function encodeKycBody(body: SubmitKycBody): ApiRecord {
  return {
    kycType: KYC_TYPE_TO_API[String(body.documentType).toUpperCase()] ?? "national_id",
    frontUrl: body.frontIdImageUrl,
    backUrl: body.backIdImageUrl ?? null,
    selfieUrl: body.selfieImageUrl,
  };
}
