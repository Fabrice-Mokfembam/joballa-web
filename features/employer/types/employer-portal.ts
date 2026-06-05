/** Employer portal API types — see `docs/FRONTEND_EMPLOYER_PORTAL_API_GUIDE_MAY_2026.md`. */

export type EmployerJobStatus =
  | "draft"
  | "under_review"
  | "active"
  | "paused"
  | "closed"
  | "rejected";

export type EmployerApplicantStatus = "submitted" | "pending" | "shortlisted" | "rejected" | "hired";

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type EmployerMe = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
  languagePreference?: string;
  company?: {
    id: string;
    name: string;
    logo?: string | null;
  };
  roles?: string;
};

export type EmployerDashboardStat = {
  count: number | string;
  label?: string;
  trend?: string;
};

export type EmployerDashboard = {
  activeJobs: EmployerDashboardStat;
  totalApplicants: EmployerDashboardStat;
  hiredWorkers: EmployerDashboardStat;
  totalPayroll: EmployerDashboardStat;
  liveJobs: EmployerJobListItem[];
};

export type EmployerJobListItem = {
  jobId: string;
  title: string;
  location?: string;
  jobType?: string;
  salary?: string;
  status: EmployerJobStatus | string;
  applicantsCount?: number;
  shortlistedCount?: number;
  postedAt?: string;
};

export type EmployerJobDetail = EmployerJobListItem & {
  company?: string;
  pay?: number | string;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  city?: string;
  neighbourhood?: string;
  requiredSkills?: string[];
  requiredLevel?: string;
  employmentType?: string;
  durationValue?: number;
  durationUnit?: string;
  currency?: string;
  per?: string;
  numberOfOpenings?: number;
  startDate?: string;
  startAsap?: boolean;
  [key: string]: unknown;
};

export type CreateEmployerJobBody = {
  departmentId: string;
  title: string;
  workMode: string;
  country: string;
  region?: string;
  city: string;
  neighbourhood?: string;
  description: string;
  requiredSkills: string[];
  experienceLevel?: string;
  employmentType: string;
  duration?: string;
  payAmount: number;
  payCurrency?: "XAF";
  payStructure: string;
  numberOfOpenings: number;
  startDate?: string | null;
  startNow: boolean;
  requirements: string[];
  responsibilities: string[];
  requestedDocuments?: unknown[];
  paymentManagedByJoballa?: boolean;
  asDraft?: boolean;
};

export type UpdateEmployerJobBody = Partial<CreateEmployerJobBody>;

export type CreateEmployerJobResponse = {
  jobId: string;
  status: string;
  message: string;
};

export type EmployerApplicantFilters = {
  jobTitles: { jobId: string; title: string }[];
  statuses: EmployerApplicantStatus[];
};

export type EmployerApplicantListItem = {
  applicationId?: string;
  id?: string;
  name?: string;
  applicantName?: string;
  jobTitle?: string;
  jobId?: string;
  status?: EmployerApplicantStatus | string;
  appliedAt?: string;
  location?: string;
  jobType?: string;
  matchScore?: number;
  match?: string | number;
  topSkills?: string;
  skills?: string[];
  verificationStatus?: string;
  kycStatus?: string;
  avatarUrl?: string | null;
  photoUrl?: string | null;
  applicantAvatarUrl?: string | null;
  submittedProfile?: Record<string, unknown>;
  [key: string]: unknown;
};

export type EmployerApplicantDetail = {
  applicationId?: string;
  id?: string;
  status?: EmployerApplicantStatus | string;
  job?: EmployerJobListItem & { jobId?: string };
  submittedProfile?: Record<string, unknown>;
  employerNotes?: string | null;
  matchPercent?: number;
  [key: string]: unknown;
};

export type PatchEmployerApplicantNotesBody = {
  employerNotes: string;
};

export type EmployerApplicantNotesResponse = {
  applicationId: string;
  employerNotes: string;
};

export type EmployerWorkforceStatus = "active" | "terminated" | "rejected";

export type EmployerWorkforceStats = {
  activeWorkers?: EmployerDashboardStat;
  totalShifts?: EmployerDashboardStat;
  engagementsEnded?: EmployerDashboardStat;
  tabCounts?: { all: number; active: number; terminated: number };
  [key: string]: EmployerDashboardStat | { all: number; active: number; terminated: number } | number | string | undefined;
};

export type EmployerWorkforceListItem = {
  workerId?: string;
  id?: string;
  name?: string;
  fullName?: string;
  role?: string;
  status?: EmployerWorkforceStatus | string;
  dateJoined?: string;
  shiftsLogged?: number;
  jobType?: string;
  avatarUrl?: string;
  [key: string]: unknown;
};

export type EmployerWorkforceWorkerDetail = EmployerWorkforceListItem & {
  job?: EmployerJobDetail;
  submittedProfile?: Record<string, unknown>;
};

export type EmployerWorkforceList = {
  stats?: EmployerWorkforceStats;
  items: EmployerWorkforceListItem[];
  total: number;
  page: number;
  limit: number;
};

export type EmployerShift = {
  shiftId?: string;
  id?: string;
  date: string;
  hours: number;
  notes?: string | null;
  loggedBy?: string;
  [key: string]: unknown;
};

export type LogShiftBody = {
  date: string;
  hours: number;
  notes?: string;
};

export type UpdateWorkforceStatusBody = {
  status: string;
  reason?: string;
};

export type EmployerPaymentsSummary = Record<string, EmployerDashboardStat | unknown>;

export type EmployerPayWorkerRow = {
  engagementId?: string;
  workerId?: string;
  id?: string;
  workerName?: string;
  name?: string;
  jobTitle?: string;
  amountDue?: number;
  amount?: number;
  currency?: string;
  provider?: "mtn_momo" | "orange_money" | null;
  recipientNumber?: string;
  paymentManagedByJoballa?: boolean;
  alreadyPaid?: boolean;
  paid?: boolean;
  status?: string;
  [key: string]: unknown;
};

export type EmployerPayWorkersResponse = {
  items?: EmployerPayWorkerRow[];
  workers?: EmployerPayWorkerRow[];
  [key: string]: unknown;
};

export type PayWorkerBody = {
  engagementId: string;
  workerId: string;
  amount: number;
  provider: "mtn_momo" | "orange_money";
  recipientNumber: string;
  payPeriod?: string;
  idempotencyKey: string;
};

export type PayWorkerResponse = {
  paymentId: string;
  status: string;
  message: string;
};

export type EmployerPaymentHistoryItem = {
  paymentId?: string;
  id?: string;
  amount?: number;
  currency?: string;
  status?: string;
  workerName?: string;
  period?: string;
  createdAt?: string;
  [key: string]: unknown;
};

export type InformalJobRequestListItem = {
  id: string;
  department: { id: string; name: string; category: string };
  title: string;
  paymentManagedByJoballa: boolean;
  status: "submitted" | "under_review" | "posted" | "rejected" | "changes_requested";
  assignedJobId?: string | null;
  rejectionReason?: string | null;
  changeRequest?: string | null;
  createdAt: string;
};

export type CreateInformalJobRequest = {
  departmentId: string;
  departmentCategory:
    | "education"
    | "domestic"
    | "logistics"
    | "events"
    | "agriculture"
    | "construction"
    | "other";
  formData: Record<string, unknown>;
  paymentManagedByJoballa: boolean;
};

export type CreateInformalJobResponse = {
  id: string;
  status: "submitted" | "under_review" | "posted" | "rejected";
  assignedJobId?: string | null;
  message: string;
};

export type EmployerCompany = {
  companyId?: string;
  id?: string;
  name?: string;
  tagline?: string | null;
  industry?: string;
  size?: string;
  bio?: string;
  location?: { city?: string; region?: string; country?: string } | string;
  website?: string;
  email?: string;
  logo?: string | null;
  logoUrl?: string | null;
  verificationStatus?: string;
  documents?: EmployerDocument[];
  applicantsCount?: number;
  employeesCount?: number;
  [key: string]: unknown;
};

export type EmployerDocument = {
  id: string;
  documentName: string;
  documentUrl: string;
  documentType: "pdf" | "image" | string;
  verificationStatus: string;
  verificationNotes?: string | null;
  createdAt: string;
};

export type UpdateEmployerCompanyBody = {
  name?: string;
  tagline?: string;
  industry?: string;
  size?: string;
  bio?: string;
  location?: { city?: string; region?: string; country?: string };
  website?: string;
  logo?: string;
};

export type EmployerNotificationFilter = "all" | "applicants" | "payments";

export type EmployerNotification = {
  id: string;
  type?: string;
  title?: string;
  body?: string;
  read: boolean;
  createdAt?: string;
  deepLink?: string | null;
  [key: string]: unknown;
};

export type EmployerNotificationSettings = {
  pushEnabled?: boolean;
  emailEnabled?: boolean;
  applicantsEnabled?: boolean;
  messagesEnabled?: boolean;
};

export type ApplicantShareResponse = {
  shareUrl: string;
};
