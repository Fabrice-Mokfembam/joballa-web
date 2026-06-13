# Worker Frontend API Routes

This document lists the backend API routes integrated by the Joballa worker frontend panel, including the auth routes used to enter and maintain a worker session.

Source of truth:

- `features/auth/api/auth.ts`
- `features/worker/api/worker-portal.ts` (re-exports `worker-portal.live.ts`)

Notes:

- These are backend API paths, not Next.js page routes.
- Worker API paths use the v2 shape without an `/api` prefix.
- Dynamic values are written as `:param`.
- Most worker calls require an authenticated worker Bearer token through `joballaAxios`.
- `void` means the frontend does not consume a response body.
- `BlobDownload` means the frontend expects binary file data and reads the filename from `content-disposition`.

## Auth Routes

| Method | Route | Frontend function | Request | Response format |
| --- | --- | --- | --- | --- |
| `POST` | `/auth/register` | `postRegister` | `AuthRegisterBody` | `AuthRegisterResponse` |
| `POST` | `/auth/verify` | `postVerify` | `AuthVerifyBody` | `AuthTokensResponse` |
| `POST` | `/auth/select-role` | `postSelectRole` | `AuthSelectRoleBody` | `AuthMeResponse` |
| `POST` | `/auth/login` | `postLogin` | `AuthLoginBody` | `AuthTokensResponse` |
| `POST` | `/auth/google` | `postAuthGoogle` | `GoogleAuthBody` | `GoogleAuthResponse` |
| `POST` | `/auth/refresh` | `postRefresh`, `refreshAccessToken` | `{ refreshToken?: string }` or `{}` | `AuthRefreshResponse` |
| `POST` | `/auth/logout` | `postLogout` | `{ refreshToken?: string }` with Bearer access token | `AuthMessageResponse` |
| `POST` | `/auth/forgot-password` | `postForgotPassword` | `AuthForgotPasswordBody` | `AuthMessageResponse` |
| `POST` | `/auth/reset-password` | `postResetPassword` | `AuthResetPasswordBody` | `AuthMessageResponse` |
| `POST` | `/auth/resend-otp` | `postResendOtp` | `AuthResendOtpBody` | `AuthRegisterResponse \| AuthMessageResponse` |
| `GET` | `/auth/me` | `getAuthMe` | Bearer access token | `AuthMeResponse` |

Google auth details:

- Frontend button: `components/auth/auth-google-button.tsx`
- Google provider: `components/providers/google-oauth-provider.tsx`
- Sign-in request sends `{ idToken, mode: "signin" }`.
- Sign-up request sends `{ idToken, mode: "signup", role, preferredLanguage }`.
- `idToken` is the Google credential returned by `@react-oauth/google`.

## Auth Response Formats

```ts
type AuthRegisterResponse = {
  message: string;
  identifier: string;
};

type AuthSessionUser = {
  id: string;
  role: "WORKER" | "EMPLOYER" | "ADMIN" | string;
  email: string | null;
  phone: string | null;
  languagePreference: "EN" | "FR" | "eng" | "fre" | string;
  verificationStatus?: string;
};

type AuthTokensResponse = {
  accessToken: string;
  refreshToken?: string;
  user: AuthSessionUser;
};

type GoogleAuthResponse = AuthTokensResponse & {
  isNewUser: boolean;
};

type AuthRefreshResponse = {
  accessToken: string;
  refreshToken?: string;
};

type AuthMessageResponse = {
  message: string;
  identifier?: string;
};

type AuthMeResponse = {
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    role: string;
    languagePreference: string;
    verificationStatus: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  dashboardRoute: string | null;
  profileType: "WORKER" | "EMPLOYER" | null;
  profile: WorkerProfile | EmployerProfile | null;
};
```

## Worker Session And Dashboard

| Method | Route | Frontend function | Request/query | Response format |
| --- | --- | --- | --- | --- |
| `GET` | `/worker/me` | `getWorkerMe` | Bearer token | `WorkerMe` |
| `GET` | `/worker/profile` | `getWorkerMe`, `getWorkerFullProfile` | Bearer token | `WorkerFullProfile` |
| `GET` | `/worker/dashboard` | `getWorkerDashboard` | Bearer token | `WorkerDashboard` |

## Worker Profile

| Method | Route | Frontend function | Request/query | Response format |
| --- | --- | --- | --- | --- |
| `GET` | `/worker/profile` | `getWorkerFullProfile` | Bearer token | `WorkerFullProfile` |
| `GET` | `/worker/profile/:workerId/public` | `getWorkerPublicProfile` | `workerId` path param | `WorkerPublicProfile` |
| `PUT` | `/worker/profile` | `putWorkerProfile` | `PutWorkerProfileBody` | `WorkerFullProfile` |
| `PATCH` | `/worker/profile/personal-info` | `patchWorkerPersonalInfo` | `PatchPersonalInfoBody` | `WorkerFullProfile` |
| `PATCH` | `/worker/profile/professional-summary` | `patchWorkerProfessionalSummary` | `PatchProfessionalSummaryBody` | `WorkerFullProfile` |
| `PATCH` | `/worker/profile/skills` | `patchWorkerSkills` | `PatchSkillsBody` | `WorkerFullProfile` |
| `POST` | `/worker/profile/avatar` | `postWorkerAvatar` | multipart `{ file }` | `WorkerFullProfile` |
| `POST` | `/worker/profile/cv` | `postWorkerCv` | multipart `{ file }` | `{ cvUrl?: string; message?: string }` |
| `GET` | `/worker/profile/cv-export/status` | `getWorkerCvExportStatus` | Bearer token | `WorkerCvExportStatus` |
| `GET` | `/worker/profile/cv-export` | `getWorkerCvExport` | Bearer token | `BlobDownload` |
| `POST` | `/worker/profile/cv-export` | `postWorkerCvExport` | Bearer token | `BlobDownload` |

## Profile Records

| Method | Route | Frontend function | Request/query | Response format |
| --- | --- | --- | --- | --- |
| `POST` | `/worker/profile/work-history` | `postWorkerWorkHistory` | `CreateWorkHistoryBody` | `WorkerWorkHistory` |
| `PATCH` | `/worker/profile/work-history/:workId` | `patchWorkerWorkHistory` | `Partial<CreateWorkHistoryBody>` | `WorkerWorkHistory` |
| `DELETE` | `/worker/profile/work-history/:workId` | `deleteWorkerWorkHistory` | `workId` path param | `void` |
| `POST` | `/worker/profile/education` | `postWorkerEducation` | `CreateEducationBody` | `WorkerEducation` |
| `PATCH` | `/worker/profile/education/:educationId` | `patchWorkerEducation` | `Partial<CreateEducationBody>` | `WorkerEducation` |
| `DELETE` | `/worker/profile/education/:educationId` | `deleteWorkerEducation` | `educationId` path param | `void` |
| `POST` | `/worker/profile/certifications` | `postWorkerCertification` | `CreateCertificationBody` | `WorkerCertification` |
| `PATCH` | `/worker/profile/certifications/:certId` | `patchWorkerCertification` | `Partial<CreateCertificationBody>` | `WorkerCertification` |
| `DELETE` | `/worker/profile/certifications/:certId` | `deleteWorkerCertification` | `certId` path param | `void` |
| `POST` | `/worker/profile/documents` | `postWorkerDocument` | multipart `{ file }`, query `{ type }` | `WorkerDocument` |
| `GET` | `/worker/profile/documents` | `getWorkerDocuments` | Bearer token | `WorkerDocument[]` |
| `DELETE` | `/worker/profile/documents/:documentId` | `deleteWorkerDocument` | `documentId` path param | `void` |

## Verification And Payment Profile

| Method | Route | Frontend function | Request/query | Response format |
| --- | --- | --- | --- | --- |
| `POST` | `/worker/profile/kyc` | `postWorkerKyc` | `SubmitKycBody` | `WorkerKycSubmission` |
| `GET` | `/worker/profile/kyc` | `getWorkerKyc` | Bearer token | `WorkerKycSubmission \| null` |
| `POST` | `/files/verification-doc` | `uploadVerificationDoc` | multipart `{ file }` | `VerificationDocUploadResponse` |
| `PATCH` | `/worker/profile/payment-details` | `patchWorkerPaymentDetails` | `PatchPaymentDetailsBody` | `WorkerFullProfile` |
| `GET` | `/worker/profile/payment-accounts` | `getWorkerPaymentAccounts` | Bearer token | `WorkerPaymentAccount[]` |
| `POST` | `/worker/profile/payment-accounts` | `postWorkerPaymentAccount` | `CreateWorkerPaymentAccountBody` | `WorkerPaymentAccount` |
| `PATCH` | `/worker/profile/payment-accounts/:accountId` | `patchWorkerPaymentAccount` | `PatchWorkerPaymentAccountBody` | `WorkerPaymentAccount` |
| `DELETE` | `/worker/profile/payment-accounts/:accountId` | `deleteWorkerPaymentAccount` | `accountId` path param | `void` |

## Worker-Owned Posted Jobs

These are jobs posted by a worker, not jobs discovered by a worker.

| Method | Route | Frontend function | Request/query | Response format |
| --- | --- | --- | --- | --- |
| `POST` | `/worker/posted-jobs` | `createWorkerJob` | `CreateWorkerJobBody` | `CreateWorkerJobResponse` |
| `GET` | `/worker/posted-jobs` | `getWorkerOwnedJobs` | query `{ status?, page?, limit? }` | `Paginated<WorkerOwnedJobListItem>` |
| `GET` | `/worker/posted-jobs/:jobId` | `getWorkerOwnedJob` | `jobId` path param | `WorkerOwnedJobDetail` |
| `PATCH` | `/worker/posted-jobs/:jobId` | `patchWorkerOwnedJob` | `UpdateWorkerJobBody` | `WorkerOwnedJobDetail` |
| `PATCH` | `/worker/posted-jobs/:jobId/status` | `patchWorkerOwnedJobStatus` | `{ status: string }` | `WorkerOwnedJobDetail` |
| `POST` | `/worker/posted-jobs/:jobId/publish` | `publishWorkerPostedJob` | `UpdateWorkerJobBody?` | `CreateWorkerJobResponse` |
| `DELETE` | `/worker/posted-jobs/:jobId` | `deleteWorkerOwnedJob` | `jobId` path param | `void` |

## Incoming Applicants For Worker-Owned Jobs

| Method | Route | Frontend function | Request/query | Response format |
| --- | --- | --- | --- | --- |
| `GET` | `/worker/applicants` | `getWorkerIncomingApplications` | query `{ status?, keyword?, jobId?, page?, limit? }` | `Paginated<WorkerIncomingApplicationListItem>` |
| `GET` | `/worker/applicants/:applicationId` | `getWorkerIncomingApplication` | `applicationId` path param | `WorkerIncomingApplicationDetail` |

## Job Discovery

| Method | Route | Frontend function | Request/query | Response format |
| --- | --- | --- | --- | --- |
| `GET` | `/worker/jobs` | `searchWorkerJobs` | `JobSearchParams` | `Paginated<WorkerJobListItem>` |
| `GET` | `/worker/jobs/:jobId` | `getWorkerJob` | `jobId` path param | `WorkerJobDetail` |
| `POST` | `/worker/jobs/:jobId/save` | `saveWorkerJob` | `jobId` path param | `JobSaveResponse` |
| `DELETE` | `/worker/jobs/:jobId/save` | `unsaveWorkerJob` | `jobId` path param | `JobSaveResponse` |
| `POST` | `/worker/jobs/:jobId/hide` | `hideWorkerJob` | `jobId` path param | `unknown` |
| `DELETE` | `/worker/jobs/:jobId/hide` | `unhideWorkerJob` | `jobId` path param | `void` |
| `POST` | `/worker/jobs/:jobId/report` | `reportWorkerJob` | `JobReportBody` | `unknown` |
| `GET` | `/worker/jobs/:jobId/share` | `getWorkerJobShareLink` | `jobId` path param | `JobShareResponse` |

## Job Application Flow

| Method | Route | Frontend function | Request/query | Response format |
| --- | --- | --- | --- | --- |
| `GET` | `/worker/jobs/:jobId/application/profile` | `getJobApplicationProfileDraft` | `jobId` path param | `ApplicationProfileDraft` |
| `PUT` | `/worker/jobs/:jobId/application/profile` | `putJobApplicationProfileDraft` | `CustomizeProfileBody` | `ApplicationProfileDraft` |
| `POST` | `/worker/jobs/:jobId/application/customize-profile` | `customizeJobApplicationProfile` | `CustomizeProfileBody` | `ApplicationProfileDraft` |
| `POST` | `/worker/jobs/:jobId/apply` | `applyToWorkerJob` | `ApplyToJobBody?` | `WorkerApplicationDetail` |

## Outgoing Worker Applications

| Method | Route | Frontend function | Request/query | Response format |
| --- | --- | --- | --- | --- |
| `GET` | `/worker/applications` | `getWorkerApplications` | query `{ status?, page?, limit? }` | `Paginated<WorkerApplicationListItem>` |
| `GET` | `/worker/applications/:applicationId` | `getWorkerApplication` | `applicationId` path param | `WorkerApplicationDetail` |
| `DELETE` | `/worker/applications/:applicationId` | `archiveWorkerApplication` | `applicationId` path param | `void` |

## Saved Jobs

| Method | Route | Frontend function | Request/query | Response format |
| --- | --- | --- | --- | --- |
| `GET` | `/worker/saved-jobs` | `getSavedJobs` | `JobSearchParams` | `Paginated<SavedJobItem>` |
| `DELETE` | `/worker/saved-jobs/:jobId` | `deleteSavedJob` | `jobId` path param | `void` |
| `DELETE` | `/worker/saved-jobs` | `bulkDeleteSavedJobs` | `BulkUnsaveJobsBody` | `void` |

## Earnings

| Method | Route | Frontend function | Request/query | Response format |
| --- | --- | --- | --- | --- |
| `GET` | `/worker/earnings/summary` | `getEarningsSummary` | Bearer token | `EarningsSummary` |
| `GET` | `/worker/earnings/transactions` | `getEarningsTransactions` | `EarningsTransactionsParams` | `Paginated<EarningTransaction>` |
| `GET` | `/worker/earnings/transactions/:transactionId` | `getEarningsTransaction` | `transactionId` path param | `EarningTransaction` |
| `GET` | `/worker/earnings/statement` | `getEarningsStatement` | query `{ from: string; to: string }` | `EarningTransaction[]` |

## Engagements

| Method | Route | Frontend function | Request/query | Response format |
| --- | --- | --- | --- | --- |
| `GET` | `/worker/engagements` | `getWorkerEngagements` | query `{ page?, limit?, status? }` | `Paginated<WorkerEngagementListItem>` |
| `GET` | `/worker/engagements/:engagementId` | `getWorkerEngagement` | `engagementId` path param | `WorkerEngagementDetail` |

## Notifications And Settings

| Method | Route | Frontend function | Request/query | Response format |
| --- | --- | --- | --- | --- |
| `GET` | `/worker/notifications` | `getWorkerNotifications` | query `{ filter?, type?, unreadOnly?, page?, limit? }` | `Paginated<WorkerNotificationItem>` |
| `GET` | `/worker/notifications/unread-count` | `getWorkerNotificationsUnreadCount` | Bearer token | `WorkerNotificationUnreadCount` |
| `PATCH` | `/worker/notifications/read-all` | `patchWorkerNotificationsReadAll` | Bearer token | `{ ok: boolean }` |
| `PATCH` | `/worker/notifications/:notificationId/read` | `patchWorkerNotificationRead` | `notificationId` path param | `WorkerNotificationItem` |
| `GET` | `/worker/settings/notifications` | `getWorkerNotificationSettings` | Bearer token | `WorkerNotificationSettings` |
| `PATCH` | `/worker/settings/notifications` | `patchWorkerNotificationSettings` | `WorkerNotificationSettings` | `WorkerNotificationSettings` |

## Worker Response Formats

The worker frontend normalizes many backend responses before returning them to UI hooks. These are the normalized shapes consumed by the worker panel.

```ts
type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

type WorkerMe = {
  id: string;
  email?: string | null;
  phone?: string | null;
  role?: string;
  languagePreference?: string;
  workerProfile?: WorkerMeProfile | null;
  [key: string]: unknown;
};

type WorkerFullProfile = {
  id: string;
  userId?: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  languages?: string[];
  availabilityStatus?: string;
  availableForHire?: boolean;
  professionalTitle?: string | null;
  summary?: string | null;
  industries?: string[];
  preferredJobTypes?: string[];
  skills?: string[];
  avatarUrl?: string | null;
  photoUrl?: string | null;
  verificationStatus?: string | null;
  profileCompleteness?: number;
  profileViews?: number;
  paymentMethods?: WorkerPaymentAccount[];
  workHistories?: WorkerWorkHistory[];
  educations?: WorkerEducation[];
  certifications?: WorkerCertification[];
  documents?: WorkerDocument[];
  kycSubmissions?: WorkerKycSubmission[];
  paymentAccounts?: WorkerPaymentAccount[];
  mobileMoneyProvider?: string | null;
  mobileMoneyNumber?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  [key: string]: unknown;
};

type WorkerDashboard = {
  greeting: { name: string; profileSetupMessage?: string };
  stats: {
    activeApplications: { count?: number; amount?: number; currency?: string; trendLabel?: string };
    shortlisted: { count?: number; amount?: number; currency?: string; trendLabel?: string };
    profileViews: { count?: number; amount?: number; currency?: string; trendLabel?: string };
    earnings: { count?: number; amount?: number; currency?: string; trendLabel?: string };
  };
  recommendedJobs: WorkerJobListItem[];
  applications: WorkerApplicationListItem[];
  profileCompleteness?: number;
  profileStrengthBreakdown?: Record<string, boolean | number>;
};

type WorkerJobListItem = {
  id: string;
  slug?: string;
  title: string;
  description?: string;
  city?: string | null;
  region?: string | null;
  category?: string | null;
  jobType?: string;
  workMode?: string;
  payStructure?: string;
  payRate?: number | string | null;
  currency?: string;
  employer?: WorkerJobEmployer;
  companyName?: string;
  companyLogo?: string | null;
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

type WorkerJobDetail = WorkerJobListItem & {
  requirements?: string[];
  responsibilities?: string[];
  neighbourhood?: string | null;
  [key: string]: unknown;
};

type WorkerApplicationListItem = {
  id: string;
  status: string;
  jobId?: string;
  job?: WorkerJobListItem;
  jobTitle?: string;
  companyName?: string;
  appliedAt?: string;
  createdAt?: string;
  [key: string]: unknown;
};

type WorkerApplicationDetail = WorkerApplicationListItem & {
  jobSpecificNote?: string | null;
  employer?: WorkerJobEmployer;
  engagement?: WorkerEngagementListItem | null;
  profileSnapshot?: unknown;
  [key: string]: unknown;
};

type SavedJobItem = {
  id?: string;
  jobId: string;
  savedAt?: string;
  job: WorkerJobListItem;
  [key: string]: unknown;
};

type EarningsSummary = {
  totalEarned: number;
  totalPayments: number;
  pendingAmount: number;
  thisMonthTotal: number;
  currency: string;
};

type EarningTransaction = {
  id: string;
  amount?: number | string;
  currency?: string;
  status?: string;
  initiatedAt?: string;
  completedAt?: string | null;
  engagementId?: string | null;
  employerName?: string;
  jobTitle?: string;
  [key: string]: unknown;
};

type WorkerEngagementListItem = {
  id: string;
  status: string;
  job?: WorkerJobListItem;
  employer?: WorkerJobEmployer;
  startedAt?: string;
  [key: string]: unknown;
};

type WorkerEngagementDetail = WorkerEngagementListItem & {
  shiftLogs?: unknown[];
  [key: string]: unknown;
};

type WorkerNotificationItem = {
  id: string;
  type?: string;
  title?: string;
  body?: string;
  read: boolean;
  isRead?: boolean;
  createdAt?: string;
  deepLink?: string | null;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
};

type WorkerNotificationUnreadCount = {
  count: number;
};

type WorkerNotificationSettings = {
  pushEnabled?: boolean;
  emailEnabled?: boolean;
  jobsEnabled?: boolean;
  messagesEnabled?: boolean;
};
```

## Supporting Worker Formats

```ts
type WorkerCvExportStatus = {
  available: boolean;
  documentId: string | null;
  fileName: string | null;
  generatedAt: string | null;
  sourceProfileUpdatedAt: string | null;
  isOutdated: boolean;
  downloadUrl?: string | null;
};

type WorkerWorkHistory = {
  id: string;
  jobTitle?: string;
  companyName?: string;
  startDate?: string;
  endDate?: string | null;
  isCurrent?: boolean;
  description?: string | null;
  [key: string]: unknown;
};

type WorkerEducation = {
  id: string;
  institution?: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string | null;
  isCurrent?: boolean;
  [key: string]: unknown;
};

type WorkerCertification = {
  id: string;
  name?: string;
  issuer?: string;
  issueDate?: string;
  expiryDate?: string | null;
  credentialUrl?: string | null;
  createdAt?: string;
  [key: string]: unknown;
};

type WorkerDocument = {
  id: string;
  type?: string;
  fileName?: string;
  url?: string;
  mimeType?: string;
  fileType?: "pdf" | "image";
  createdAt?: string;
  [key: string]: unknown;
};

type WorkerKycSubmission = {
  id: string;
  documentType?: string;
  status?: string;
  frontIdImageUrl?: string | null;
  backIdImageUrl?: string | null;
  selfieImageUrl?: string | null;
  rejectionReason?: string | null;
  reviewNotes?: string | null;
  submittedAt?: string;
  createdAt?: string;
  [key: string]: unknown;
};

type WorkerPaymentAccount = {
  id: string;
  provider: string;
  phone: string;
  phoneNumber?: string;
  isPrimary?: boolean;
  createdAt?: string;
  [key: string]: unknown;
};

type VerificationDocUploadResponse = {
  url: string;
  secureUrl?: string;
};

type WorkerOwnedJobListItem = {
  jobId: string;
  department?: { id: string; name: string; category: string };
  assignedJobId?: string | null;
  rejectionReason?: string | null;
  changeRequest?: string | null;
  title: string;
  location?: string;
  jobType?: string;
  salary?: string;
  status: string;
  applicantsCount?: number;
  postedAt?: string;
  [key: string]: unknown;
};

type WorkerOwnedJobDetail = WorkerOwnedJobListItem & {
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

type WorkerIncomingApplicationListItem = {
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

type WorkerIncomingApplicationDetail = WorkerIncomingApplicationListItem & {
  profileSnapshot?: Record<string, unknown>;
  [key: string]: unknown;
};

type ApplicationProfileDraft = {
  id?: string;
  applicationId?: string | null;
  jobId: string;
  profileId?: string;
  customizedData?: ApplicationProfileCustomization | null;
  createdAt?: string;
  updatedAt?: string;
};

type JobSaveResponse = {
  jobId: string;
  saved: boolean;
};

type JobShareResponse = {
  url: string;
};
```
