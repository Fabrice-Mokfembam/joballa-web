/**
 * Worker portal API types — `docs/FRONTEND_WORKER_PORTAL_API_GUIDE_MAY_2026.md`
 */
import type {
  CreateEmployerJobBody,
  CreateEmployerJobResponse,
  UpdateEmployerJobBody,
} from "@/features/employer/types/employer-portal";
import type {
  ApplicationStatus,
  AvailabilityStatus,
  EngagementStatus,
  JobType,
  MomoProvider,
  PayStructure,
  PaymentStatus,
  VerificationStatus,
} from "@/lib/types/enums";

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type WorkerApplicationStatus = ApplicationStatus;

export type JobReportReason =
  | "FAKE_JOB"
  | "MISLEADING_DESCRIPTION"
  | "INAPPROPRIATE_CONTENT"
  | "SCAM"
  | "DUPLICATE"
  | "OTHER";

export type WorkMode = "ON_SITE" | "REMOTE" | "HYBRID";

export type KycDocumentType = "NATIONAL_ID" | "PASSPORT" | "DRIVERS_LICENSE";

export type ProfileDocumentType = "CV" | "CERTIFICATE" | "PORTFOLIO" | "OTHER";

export type ProfileStrengthBreakdown = Record<string, boolean | number>;

export type ProfileCompletenessBreakdown = {
  personalInfo?: number;
  summary?: number;
  skills?: number;
  experience?: number;
  education?: number;
  certifications?: number;
  verification?: number;
  languages?: number;
};

export type WorkerMeProfile = {
  id: string;
  fullName?: string | null;
  city?: string | null;
  region?: string | null;
  professionalTitle?: string | null;
  profileCompleteness?: number;
  profileStrengthBreakdown?: ProfileStrengthBreakdown;
  profileViews?: number;
  availabilityStatus?: AvailabilityStatus;
  availableForHire?: boolean;
  verificationStatus?: VerificationStatus;
  avatarUrl?: string | null;
  [key: string]: unknown;
};

export type WorkerMe = {
  id: string;
  email?: string | null;
  phone?: string | null;
  role?: string;
  languagePreference?: string;
  workerProfile?: WorkerMeProfile | null;
  [key: string]: unknown;
};

export type WorkerCvExportStatus = {
  available: boolean;
  documentId: string | null;
  fileName: string | null;
  generatedAt: string | null;
  sourceProfileUpdatedAt: string | null;
  isOutdated: boolean;
  /** Direct API download URL — preferred over raw storage URLs. */
  downloadUrl?: string | null;
};

export type WorkerCvDownload = {
  blob: Blob;
  fileName: string;
};

export type WorkerWorkHistory = {
  id: string;
  jobTitle?: string;
  companyName?: string;
  startDate?: string;
  endDate?: string | null;
  isCurrent?: boolean;
  description?: string | null;
  [key: string]: unknown;
};

export type WorkerEducation = {
  id: string;
  institution?: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string | null;
  isCurrent?: boolean;
  [key: string]: unknown;
};

export type WorkerCertification = {
  id: string;
  name?: string;
  issuer?: string;
  issueDate?: string;
  expiryDate?: string | null;
  credentialUrl?: string | null;
  createdAt?: string;
  [key: string]: unknown;
};

export type WorkerDocument = {
  id: string;
  type?: ProfileDocumentType | string;
  fileName?: string;
  url?: string;
  mimeType?: string;
  fileType?: "pdf" | "image";
  createdAt?: string;
  [key: string]: unknown;
};

export type WorkerKycSubmission = {
  id: string;
  documentType?: KycDocumentType | string;
  status?: VerificationStatus | string;
  frontIdImageUrl?: string | null;
  backIdImageUrl?: string | null;
  selfieImageUrl?: string | null;
  rejectionReason?: string | null;
  reviewNotes?: string | null;
  submittedAt?: string;
  createdAt?: string;
  [key: string]: unknown;
};

export type WorkerPaymentAccount = {
  id: string;
  provider: MomoProvider | string;
  phone: string;
  phoneNumber?: string;
  isPrimary?: boolean;
  createdAt?: string;
  [key: string]: unknown;
};

export type WorkerPaymentMethod = WorkerPaymentAccount;

export type WorkerFullProfile = {
  id: string;
  userId?: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  languages?: string[];
  availabilityStatus?: AvailabilityStatus;
  /** Server-derived from availabilityStatus — read-only. */
  availableForHire?: boolean;
  professionalTitle?: string | null;
  summary?: string | null;
  industries?: string[];
  preferredJobTypes?: JobType[];
  skills?: string[];
  avatarUrl?: string | null;
  photoUrl?: string | null;
  verificationStatus?: VerificationStatus | string | null;
  profileCompleteness?: number;
  profileStrengthBreakdown?: ProfileStrengthBreakdown | ProfileCompletenessBreakdown;
  profileCompletenessBreakdown?: ProfileCompletenessBreakdown;
  profileViews?: number;
  paymentMethods?: WorkerPaymentMethod[];
  workHistories?: WorkerWorkHistory[];
  educations?: WorkerEducation[];
  certifications?: WorkerCertification[];
  documents?: WorkerDocument[];
  kycSubmissions?: WorkerKycSubmission[];
  paymentAccounts?: WorkerPaymentAccount[];
  mobileMoneyProvider?: MomoProvider | null;
  mobileMoneyNumber?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  [key: string]: unknown;
};

export type WorkerPublicProfile = Omit<
  WorkerFullProfile,
  "mobileMoneyProvider" | "mobileMoneyNumber" | "bankName" | "accountNumber"
>;

export type PatchPersonalInfoBody = {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  region?: string;
  country?: string;
  languages?: string[];
  availabilityStatus?: AvailabilityStatus;
};

export type PatchProfessionalSummaryBody = {
  title?: string;
  summary?: string;
  industries?: string[];
  preferredJobTypes?: JobType[];
};

export type PatchSkillsBody = {
  skills: string[];
};

export type PatchPaymentDetailsBody = {
  mobileMoneyProvider?: MomoProvider;
  mobileMoneyNumber?: string;
  bankName?: string;
  accountNumber?: string;
};

export type PutWorkerProfileBody = PatchPersonalInfoBody &
  PatchProfessionalSummaryBody &
  Partial<PatchSkillsBody> &
  PatchPaymentDetailsBody & {
    professionalTitle?: string;
    workHistories?: WorkerWorkHistory[];
    educations?: WorkerEducation[];
    certifications?: WorkerCertification[];
    documents?: WorkerDocument[];
    paymentAccounts?: WorkerPaymentAccount[];
    [key: string]: unknown;
  };

export type CreateWorkerPaymentAccountBody = {
  provider: MomoProvider | string;
  phone: string;
  isPrimary?: boolean;
};

export type PatchWorkerPaymentAccountBody = Partial<CreateWorkerPaymentAccountBody>;

export type VerificationDocUploadResponse = {
  url: string;
  secureUrl?: string;
};

export type WorkerDashboardStat = {
  count?: number;
  amount?: number;
  currency?: string;
  trendLabel?: string;
};

export type WorkerDashboard = {
  greeting: { name: string; profileSetupMessage?: string };
  stats: {
    activeApplications: WorkerDashboardStat;
    shortlisted: WorkerDashboardStat;
    profileViews: WorkerDashboardStat;
    earnings: WorkerDashboardStat;
  };
  recommendedJobs: WorkerJobListItem[];
  applications: WorkerApplicationListItem[];
  profileCompleteness?: number;
  profileStrengthBreakdown?: ProfileStrengthBreakdown;
};

export type InformalRequestStatus = "submitted" | "under_review" | "posted" | "rejected" | "changes_requested";
export type DepartmentCategory =
  | "education"
  | "domestic"
  | "logistics"
  | "events"
  | "agriculture"
  | "construction"
  | "other";

export type WorkerOwnedJobStatus = InformalRequestStatus | "draft" | "pending_review" | "live" | "paused" | "closed";

export type WorkerOwnedJobListItem = {
  jobId: string;
  department?: { id: string; name: string; category: string };
  assignedJobId?: string | null;
  rejectionReason?: string | null;
  changeRequest?: string | null;
  postedByType?: "worker" | "company" | string;
  title: string;
  location?: string;
  jobType?: string;
  salary?: string;
  status: WorkerOwnedJobStatus | string;
  applicantsCount?: number;
  postedAt?: string;
  [key: string]: unknown;
};

export type WorkerOwnedJobDetail = WorkerOwnedJobListItem & {
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  city?: string;
  neighbourhood?: string;
  requiredSkills?: string[];
  pay?: number | string;
  currency?: string;
  per?: string;
  [key: string]: unknown;
};

/** Same contract as `POST /employer/jobs` — see `POST /worker/posted-jobs`. */
export type CreateWorkerJobBody = CreateEmployerJobBody;

export type UpdateWorkerJobBody = UpdateEmployerJobBody;

export type CreateWorkerJobResponse = CreateEmployerJobResponse;

export type WorkerIncomingApplicationListItem = {
  applicationId?: string;
  id?: string;
  applicantName?: string;
  applicantAvatarUrl?: string | null;
  workerId?: string;
  jobTitle?: string;
  jobId?: string;
  status?: string;
  matchPercent?: number;
  appliedAt?: string;
  [key: string]: unknown;
};

export type WorkerIncomingApplicationDetail = WorkerIncomingApplicationListItem & {
  profileSnapshot?: Record<string, unknown>;
  [key: string]: unknown;
};

export type WorkerNotificationFilter = "all" | "jobs" | "payments";

export type WorkerNotificationType =
  | "APPLICATION_SUBMITTED"
  | "APPLICATION_SHORTLISTED"
  | "APPLICATION_REJECTED"
  | "APPLICATION_ACCEPTED"
  | "HIRED"
  | "CONTRACT_STARTED"
  | "CONTRACT_COMPLETED"
  | "CONTRACT_TERMINATED"
  | "KYC_SUBMITTED"
  | "KYC_APPROVED"
  | "KYC_REJECTED"
  | "PAYMENT_RECEIVED"
  | "PAYMENT_SENT"
  | "JOB_MATCH_FOUND"
  | "SAVED_JOB_UPDATED"
  | string;

export type WorkerNotificationItem = {
  id: string;
  type?: WorkerNotificationType;
  title?: string;
  body?: string;
  read: boolean;
  isRead?: boolean;
  createdAt?: string;
  deepLink?: string | null;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
};

export type WorkerNotificationUnreadCount = {
  count: number;
};

export type WorkerNotificationSettings = {
  pushEnabled?: boolean;
  emailEnabled?: boolean;
  jobsEnabled?: boolean;
  messagesEnabled?: boolean;
};

export type CreateWorkHistoryBody = {
  jobTitle: string;
  companyName: string;
  startDate: string;
  endDate?: string | null;
  description?: string;
};

export type CreateEducationBody = {
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string | null;
};

export type CreateCertificationBody = {
  name: string;
  issuer?: string;
  issueDate?: string;
  expiryDate?: string | null;
  credentialUrl?: string;
};

export type SubmitKycBody = {
  documentType: KycDocumentType;
  frontIdImageUrl: string;
  backIdImageUrl?: string;
  selfieImageUrl?: string;
};

export type WorkerJobEmployer = {
  id?: string;
  companyName?: string;
  name?: string;
  logoUrl?: string | null;
  [key: string]: unknown;
};

export type WorkerJobListItem = {
  id: string;
  slug?: string;
  title: string;
  description?: string;
  city?: string | null;
  region?: string | null;
  category?: string | null;
  jobType?: JobType | string;
  workMode?: WorkMode | string;
  payStructure?: PayStructure | string;
  payRate?: number | string | null;
  currency?: string;
  employer?: WorkerJobEmployer;
  companyName?: string;
  companyLogo?: string | null;
  companyLogoUrl?: string | null;
  isSaved?: boolean;
  saved?: boolean;
  hasApplied?: boolean;
  applicationId?: string | null;
  createdAt?: string;
  postedAt?: string;
  applicationCount?: number;
  relaxedFilters?: boolean;
  [key: string]: unknown;
};

export type WorkerJobDetail = WorkerJobListItem & {
  requirements?: string[];
  responsibilities?: string[];
  neighbourhood?: string | null;
  [key: string]: unknown;
};

export type JobSearchParams = {
  keyword?: string;
  search?: string;
  departmentId?: string;
  city?: string;
  category?: string;
  jobType?: JobType | string;
  employmentType?: string;
  workMode?: WorkMode | string;
  payStructure?: PayStructure | string;
  minPay?: number;
  maxPay?: number;
  sort?: "recent" | "highest_pay" | "nearest";
  sortBy?: "createdAt" | "payRate";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export type JobShareResponse = {
  url: string;
};

export type JobReportBody = {
  reason: JobReportReason;
  description?: string;
};

export type ApplicationProfileDraft = {
  id?: string;
  applicationId?: string | null;
  jobId: string;
  profileId?: string;
  customizedData?: ApplicationProfileCustomization | null;
  createdAt?: string;
  updatedAt?: string;
};

export type JobSaveResponse = {
  jobId: string;
  saved: boolean;
};

export type ApplicationProfileCustomization = {
  professionalTitle?: string;
  professionalSummary?: string;
  bio?: string;
  skills?: string[];
  languages?: string[];
  region?: string;
  city?: string;
  detachedWorkHistoryIds?: string[];
  detachedEducationIds?: string[];
  detachedCertificationIds?: string[];
  detachedDocumentIds?: string[];
};

/** @deprecated Prefer ApplicationProfileCustomization */
export type CustomizeProfileBody = ApplicationProfileCustomization & {
  workHistoryIds?: string[];
};

export type ApplicationProfileSnapshot = {
  id?: string;
  applicationId?: string;
  profileId?: string;
  customizedData?: CustomizeProfileBody;
  createdAt?: string;
};

export type ApplyToJobBody = {
  jobSpecificNote?: string;
  coverNote?: string;
  source?: "web" | "mobile_app" | "mobile";
  attachedDocuments?: Array<{
    requestedDocumentKey?: string;
    supportingDocumentId?: string;
    fileUrl?: string;
    fileName?: string;
  }> | string[];
};

export type WorkerApplicationListItem = {
  id: string;
  status: WorkerApplicationStatus | string;
  jobId?: string;
  job?: WorkerJobListItem;
  jobTitle?: string;
  companyName?: string;
  appliedAt?: string;
  createdAt?: string;
  [key: string]: unknown;
};

export type WorkerApplicationDetail = WorkerApplicationListItem & {
  jobSpecificNote?: string | null;
  employer?: WorkerJobEmployer;
  engagement?: WorkerEngagementListItem | null;
  profileSnapshot?: unknown;
  [key: string]: unknown;
};

export type SavedJobItem = {
  id?: string;
  jobId: string;
  savedAt?: string;
  job: WorkerJobListItem;
  [key: string]: unknown;
};

export type BulkUnsaveJobsBody = {
  jobIds: string[];
};

export type EarningsSummary = {
  totalEarned: number;
  totalPayments: number;
  pendingAmount: number;
  thisMonthTotal: number;
  currency: string;
};

export type EarningTransaction = {
  id: string;
  amount?: number | string;
  currency?: string;
  status?: PaymentStatus | string;
  initiatedAt?: string;
  completedAt?: string | null;
  engagementId?: string | null;
  employerName?: string;
  jobTitle?: string;
  [key: string]: unknown;
};

export type EarningsTransactionsParams = {
  page?: number;
  limit?: number;
  status?: PaymentStatus | string;
  engagementId?: string;
  from?: string;
  to?: string;
};

export type WorkerEngagementListItem = {
  id: string;
  status: EngagementStatus | string;
  job?: WorkerJobListItem;
  employer?: WorkerJobEmployer;
  startedAt?: string;
  [key: string]: unknown;
};

export type WorkerEngagementDetail = WorkerEngagementListItem & {
  shiftLogs?: unknown[];
  [key: string]: unknown;
};
