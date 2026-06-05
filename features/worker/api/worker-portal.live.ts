/**
 * Worker portal REST API — v2 paths (`routedocs/FRONTEND_WORKER_ROUTES.md`, no `/api` prefix).
 */
import { joballaAxios } from "@/lib/http/axios-instance";
import { clampListParams } from "@/lib/http/api-pagination";
import { normalizePaginated } from "@/lib/http/normalize-paginated";
import { normalizeWorkerDashboard } from "@/features/worker/lib/dashboard-mapper";
import {
  encodeKycBody,
  encodePaymentAccountBody,
  encodePersonalInfoPatch,
  encodeProfessionalSummaryPatch,
  encodePutWorkerProfile,
  normalizeWorkerMe,
  normalizeWorkerProfile,
} from "@/features/worker/lib/profile-mapper";
import type {
  ApplyToJobBody,
  BulkUnsaveJobsBody,
  CreateCertificationBody,
  CreateEducationBody,
  CreateWorkerJobBody,
  CreateWorkerJobResponse,
  CreateWorkerPaymentAccountBody,
  CreateWorkHistoryBody,
  CustomizeProfileBody,
  EarningTransaction,
  EarningsSummary,
  EarningsTransactionsParams,
  JobReportBody,
  JobSearchParams,
  JobShareResponse,
  Paginated,
  PatchPaymentDetailsBody,
  PatchPersonalInfoBody,
  PatchProfessionalSummaryBody,
  PatchSkillsBody,
  PatchWorkerPaymentAccountBody,
  PutWorkerProfileBody,
  SavedJobItem,
  SubmitKycBody,
  UpdateWorkerJobBody,
  VerificationDocUploadResponse,
  WorkerApplicationDetail,
  WorkerApplicationListItem,
  WorkerCertification,
  WorkerDashboard,
  WorkerDocument,
  WorkerEducation,
  WorkerEngagementDetail,
  WorkerEngagementListItem,
  WorkerFullProfile,
  WorkerIncomingApplicationDetail,
  WorkerIncomingApplicationListItem,
  WorkerJobDetail,
  WorkerJobListItem,
  WorkerKycSubmission,
  WorkerMe,
  WorkerNotificationItem,
  WorkerNotificationSettings,
  WorkerOwnedJobDetail,
  WorkerOwnedJobListItem,
  WorkerPaymentAccount,
  WorkerPublicProfile,
  WorkerWorkHistory,
} from "@/features/worker/types/worker-portal";

const WORKER = "/worker";
const JOBS = `${WORKER}/jobs`;
const APPLICATIONS = `${WORKER}/applications`;
const SAVED = `${WORKER}/saved-jobs`;
const EARNINGS = `${WORKER}/earnings`;
const FILES = "/files";

// —— Session ——

export async function getWorkerMe(): Promise<WorkerMe> {
  const { data } = await joballaAxios.get(`${WORKER}/me`);
  return normalizeWorkerMe(data);
}

export async function getWorkerDashboard(): Promise<WorkerDashboard> {
  const { data } = await joballaAxios.get(`${WORKER}/dashboard`);
  return normalizeWorkerDashboard(data);
}

// —— Profile ——

export async function getWorkerFullProfile(): Promise<WorkerFullProfile> {
  const [{ data }, me] = await Promise.all([
    joballaAxios.get(`${WORKER}/profile`),
    getWorkerMe().catch(() => null),
  ]);
  const profile = normalizeWorkerProfile(data);
  return {
    ...profile,
    avatarUrl: profile.avatarUrl ?? me?.workerProfile?.avatarUrl ?? null,
  };
}

export async function getWorkerPublicProfile(workerId: string): Promise<WorkerPublicProfile> {
  const { data } = await joballaAxios.get(`${WORKER}/profile/${workerId}/public`);
  return normalizeWorkerProfile(data) as WorkerPublicProfile;
}

export async function putWorkerProfile(body: PutWorkerProfileBody): Promise<WorkerFullProfile> {
  const { data } = await joballaAxios.put(`${WORKER}/profile`, encodePutWorkerProfile(body));
  return normalizeWorkerProfile(data);
}

export async function patchWorkerPersonalInfo(body: PatchPersonalInfoBody): Promise<WorkerFullProfile> {
  const { data } = await joballaAxios.patch(`${WORKER}/profile/personal-info`, encodePersonalInfoPatch(body));
  return normalizeWorkerProfile(data);
}

export async function patchWorkerProfessionalSummary(
  body: PatchProfessionalSummaryBody,
): Promise<WorkerFullProfile> {
  const { data } = await joballaAxios.patch(
    `${WORKER}/profile/professional-summary`,
    encodeProfessionalSummaryPatch(body),
  );
  return normalizeWorkerProfile(data);
}

export async function patchWorkerSkills(body: PatchSkillsBody): Promise<WorkerFullProfile> {
  const { data } = await joballaAxios.patch(`${WORKER}/profile/skills`, body);
  return normalizeWorkerProfile(data);
}

export async function postWorkerAvatar(file: File): Promise<WorkerFullProfile> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await joballaAxios.post(`${WORKER}/profile/avatar`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  const uploaded = normalizeWorkerProfile(data);
  const profile = await getWorkerFullProfile();
  return {
    ...profile,
    avatarUrl: uploaded.avatarUrl ?? profile.avatarUrl,
  };
}

export async function postWorkerCv(file: File): Promise<{ cvUrl?: string; message?: string }> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await joballaAxios.post<{ cvUrl?: string; message?: string }>(`${WORKER}/profile/cv`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function getWorkerCvExport(): Promise<WorkerFullProfile> {
  const { data } = await joballaAxios.get(`${WORKER}/profile/cv-export`);
  return normalizeWorkerProfile(data);
}

export async function postWorkerWorkHistory(body: CreateWorkHistoryBody): Promise<WorkerWorkHistory> {
  const { data } = await joballaAxios.post(`${WORKER}/profile/work-history`, body);
  const normalized = normalizeWorkerProfile({ workHistories: [data] });
  return normalized.workHistories?.[0] ?? (data as WorkerWorkHistory);
}

export async function patchWorkerWorkHistory(
  workId: string,
  body: Partial<CreateWorkHistoryBody>,
): Promise<WorkerWorkHistory> {
  const { data } = await joballaAxios.patch<WorkerWorkHistory>(`${WORKER}/profile/work-history/${workId}`, body);
  return data;
}

export async function deleteWorkerWorkHistory(workId: string): Promise<void> {
  await joballaAxios.delete(`${WORKER}/profile/work-history/${workId}`);
}

export async function postWorkerEducation(body: CreateEducationBody): Promise<WorkerEducation> {
  const { data } = await joballaAxios.post<WorkerEducation>(`${WORKER}/profile/education`, body);
  return data;
}

export async function patchWorkerEducation(
  educationId: string,
  body: Partial<CreateEducationBody>,
): Promise<WorkerEducation> {
  const { data } = await joballaAxios.patch<WorkerEducation>(`${WORKER}/profile/education/${educationId}`, body);
  return data;
}

export async function deleteWorkerEducation(educationId: string): Promise<void> {
  await joballaAxios.delete(`${WORKER}/profile/education/${educationId}`);
}

export async function postWorkerCertification(body: CreateCertificationBody): Promise<WorkerCertification> {
  const { data } = await joballaAxios.post<WorkerCertification>(`${WORKER}/profile/certifications`, body);
  return data;
}

export async function patchWorkerCertification(
  certId: string,
  body: Partial<CreateCertificationBody>,
): Promise<WorkerCertification> {
  const { data } = await joballaAxios.patch<WorkerCertification>(`${WORKER}/profile/certifications/${certId}`, body);
  return data;
}

export async function deleteWorkerCertification(certId: string): Promise<void> {
  await joballaAxios.delete(`${WORKER}/profile/certifications/${certId}`);
}

export async function postWorkerDocument(
  file: File,
  type: string,
): Promise<WorkerDocument> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await joballaAxios.post<WorkerDocument>(`${WORKER}/profile/documents`, form, {
    params: { type },
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function getWorkerDocuments(): Promise<WorkerDocument[]> {
  const { data } = await joballaAxios.get(`${WORKER}/profile/documents`);
  return normalizeWorkerProfile({ supportingDocuments: data }).documents ?? [];
}

export async function deleteWorkerDocument(documentId: string): Promise<void> {
  await joballaAxios.delete(`${WORKER}/profile/documents/${documentId}`);
}

export async function postWorkerKyc(body: SubmitKycBody): Promise<WorkerKycSubmission> {
  const { data } = await joballaAxios.post(`${WORKER}/profile/kyc`, encodeKycBody(body));
  const profile = normalizeWorkerProfile({ latestKyc: data });
  return profile.kycSubmissions?.[0] ?? (data as WorkerKycSubmission);
}

export async function getWorkerKyc(): Promise<WorkerKycSubmission | null> {
  const { data } = await joballaAxios.get(`${WORKER}/profile/kyc`);
  if (!data) return null;
  const profile = normalizeWorkerProfile({ latestKyc: data });
  return profile.kycSubmissions?.[0] ?? null;
}

export async function patchWorkerPaymentDetails(body: PatchPaymentDetailsBody): Promise<WorkerFullProfile> {
  const { data } = await joballaAxios.patch(`${WORKER}/profile/payment-details`, encodePaymentAccountBody(body));
  return normalizeWorkerProfile(data);
}

export async function getWorkerPaymentAccounts(): Promise<WorkerPaymentAccount[]> {
  const { data } = await joballaAxios.get(`${WORKER}/profile/payment-accounts`);
  const profile = normalizeWorkerProfile({ paymentAccounts: data });
  return profile.paymentAccounts ?? [];
}

export async function postWorkerPaymentAccount(body: CreateWorkerPaymentAccountBody): Promise<WorkerPaymentAccount> {
  const { data } = await joballaAxios.post(`${WORKER}/profile/payment-accounts`, encodePaymentAccountBody(body));
  const accounts = normalizeWorkerProfile({ paymentAccounts: [data] }).paymentAccounts;
  return accounts?.[0] ?? (data as WorkerPaymentAccount);
}

export async function patchWorkerPaymentAccount(
  accountId: string,
  body: PatchWorkerPaymentAccountBody,
): Promise<WorkerPaymentAccount> {
  const { data } = await joballaAxios.patch(
    `${WORKER}/profile/payment-accounts/${accountId}`,
    encodePaymentAccountBody(body),
  );
  const accounts = normalizeWorkerProfile({ paymentAccounts: [data] }).paymentAccounts;
  return accounts?.[0] ?? (data as WorkerPaymentAccount);
}

export async function deleteWorkerPaymentAccount(accountId: string): Promise<void> {
  await joballaAxios.delete(`${WORKER}/profile/payment-accounts/${accountId}`);
}

export async function uploadVerificationDoc(file: File): Promise<VerificationDocUploadResponse> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await joballaAxios.post<VerificationDocUploadResponse>(`${FILES}/verification-doc`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// —— Worker-owned jobs ——

export async function createWorkerJob(body: CreateWorkerJobBody): Promise<CreateWorkerJobResponse> {
  const { data } = await joballaAxios.post<CreateWorkerJobResponse>(`${WORKER}/informal-requests`, body);
  return data;
}

function normalizeInformalRequestAsOwnedJob(item: unknown): WorkerOwnedJobListItem {
  const raw = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
  const department =
    raw.department && typeof raw.department === "object"
      ? (raw.department as { id?: string; name?: string; category?: string })
      : undefined;
  return {
    ...(raw as WorkerOwnedJobListItem),
    jobId: String(raw.id ?? raw.jobId ?? raw.assignedJobId ?? ""),
    title: String(raw.title ?? department?.name ?? "Informal request"),
    department: department
      ? {
          id: String(department.id ?? ""),
          name: String(department.name ?? "Department"),
          category: String(department.category ?? ""),
        }
      : undefined,
    location: typeof raw.city === "string" ? raw.city : undefined,
    status: String(raw.status ?? "submitted"),
    postedAt: raw.createdAt != null ? String(raw.createdAt) : undefined,
    assignedJobId: raw.assignedJobId != null ? String(raw.assignedJobId) : null,
    rejectionReason: raw.rejectionReason != null ? String(raw.rejectionReason) : null,
    changeRequest: raw.changeRequest != null ? String(raw.changeRequest) : null,
  };
}

export async function getWorkerOwnedJobs(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<Paginated<WorkerOwnedJobListItem>> {
  const { data } = await joballaAxios.get(`${WORKER}/informal-requests`, {
    params: clampListParams(params),
  });
  const page = normalizePaginated<unknown>(data);
  return {
    ...page,
    items: page.items.map(normalizeInformalRequestAsOwnedJob),
  };
}

export async function getWorkerOwnedJob(jobId: string): Promise<WorkerOwnedJobDetail> {
  const { data } = await joballaAxios.get<WorkerOwnedJobDetail>(`${WORKER}/jobs/${jobId}`);
  return data;
}

export async function patchWorkerOwnedJob(jobId: string, body: UpdateWorkerJobBody): Promise<WorkerOwnedJobDetail> {
  const { data } = await joballaAxios.patch<WorkerOwnedJobDetail>(`${WORKER}/jobs/${jobId}`, body);
  return data;
}

export async function patchWorkerOwnedJobStatus(jobId: string, status: string): Promise<WorkerOwnedJobDetail> {
  const { data } = await joballaAxios.patch<WorkerOwnedJobDetail>(`${WORKER}/jobs/${jobId}/status`, { status });
  return data;
}

export async function deleteWorkerOwnedJob(jobId: string): Promise<void> {
  await joballaAxios.delete(`${WORKER}/jobs/${jobId}`);
}

export async function getWorkerIncomingApplications(params?: {
  status?: string;
  keyword?: string;
  jobId?: string;
  page?: number;
  limit?: number;
}): Promise<Paginated<WorkerIncomingApplicationListItem>> {
  const { data } = await joballaAxios.get(`${WORKER}/jobs/applications`, {
    params: clampListParams(params),
  });
  return normalizePaginated<WorkerIncomingApplicationListItem>(data);
}

export async function getWorkerIncomingApplication(
  applicationId: string,
): Promise<WorkerIncomingApplicationDetail> {
  const { data } = await joballaAxios.get<WorkerIncomingApplicationDetail>(
    `${WORKER}/jobs/applications/${applicationId}`,
  );
  return data;
}

// —— Jobs feed ——

export async function searchWorkerJobs(params?: JobSearchParams): Promise<Paginated<WorkerJobListItem>> {
  const { data } = await joballaAxios.get(JOBS, { params: clampListParams(encodeJobSearchParams(params)) });
  return normalizePaginated<WorkerJobListItem>(data);
}

function encodeJobSearchParams(params?: JobSearchParams): Record<string, unknown> | undefined {
  if (!params) return undefined;
  const encoded: Record<string, unknown> = { ...params };
  if (params.keyword && !params.search) encoded.search = params.keyword;
  if (params.category && !params.departmentId) encoded.departmentId = params.category;
  if (params.jobType && !params.employmentType) encoded.employmentType = normalizeEmploymentType(String(params.jobType));
  if (params.sortBy && !params.sort) encoded.sort = params.sortBy === "payRate" ? "highest_pay" : "recent";
  delete encoded.keyword;
  delete encoded.category;
  delete encoded.jobType;
  delete encoded.sortBy;
  delete encoded.sortOrder;
  return encoded;
}

function normalizeEmploymentType(raw: string): string {
  const value = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (value === "temporary") return "casual";
  if (["full_time", "part_time", "contract", "casual", "seasonal", "internship"].includes(value)) return value;
  return value;
}

export async function getWorkerJob(jobId: string): Promise<WorkerJobDetail> {
  const { data } = await joballaAxios.get<WorkerJobDetail>(`${JOBS}/${jobId}`);
  return data;
}

export async function saveWorkerJob(jobId: string): Promise<unknown> {
  const { data } = await joballaAxios.post(`${JOBS}/${jobId}/save`);
  return data;
}

export async function unsaveWorkerJob(jobId: string): Promise<void> {
  await joballaAxios.delete(`${JOBS}/${jobId}/save`);
}

export async function hideWorkerJob(jobId: string): Promise<unknown> {
  const { data } = await joballaAxios.post(`${JOBS}/${jobId}/hide`);
  return data;
}

export async function unhideWorkerJob(jobId: string): Promise<void> {
  await joballaAxios.delete(`${JOBS}/${jobId}/hide`);
}

export async function reportWorkerJob(jobId: string, body: JobReportBody): Promise<unknown> {
  const { data } = await joballaAxios.post(`${JOBS}/${jobId}/report`, body);
  return data;
}

export async function getWorkerJobShareLink(jobId: string): Promise<JobShareResponse> {
  const { data } = await joballaAxios.get<JobShareResponse>(`${JOBS}/${jobId}/share`);
  return data;
}

// —— Applications ——

export async function customizeJobApplicationProfile(
  jobId: string,
  body: CustomizeProfileBody,
): Promise<unknown> {
  const { data } = await joballaAxios.post(`${JOBS}/${jobId}/application/customize-profile`, body);
  return data;
}

export async function applyToWorkerJob(jobId: string, body?: ApplyToJobBody): Promise<WorkerApplicationDetail> {
  const { data } = await joballaAxios.post<WorkerApplicationDetail>(`${JOBS}/${jobId}/apply`, {
    coverNote: body?.coverNote ?? body?.jobSpecificNote,
    attachedDocuments: body?.attachedDocuments,
  });
  return data;
}

export async function getWorkerApplications(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<Paginated<WorkerApplicationListItem>> {
  const { data } = await joballaAxios.get(APPLICATIONS, { params: clampListParams(params) });
  return normalizePaginated<WorkerApplicationListItem>(data);
}

export async function getWorkerApplication(applicationId: string): Promise<WorkerApplicationDetail> {
  const { data } = await joballaAxios.get<WorkerApplicationDetail>(`${APPLICATIONS}/${applicationId}`);
  return data;
}

export async function archiveWorkerApplication(applicationId: string): Promise<void> {
  await joballaAxios.delete(`${APPLICATIONS}/${applicationId}`);
}

// —— Saved jobs ——

export async function getSavedJobs(params?: JobSearchParams): Promise<Paginated<SavedJobItem>> {
  const { data } = await joballaAxios.get(SAVED, { params: clampListParams(params) });
  return normalizePaginated<SavedJobItem>(data);
}

export async function deleteSavedJob(jobId: string): Promise<void> {
  await joballaAxios.delete(`${SAVED}/${jobId}`);
}

export async function bulkDeleteSavedJobs(body: BulkUnsaveJobsBody): Promise<void> {
  await joballaAxios.delete(SAVED, { data: body });
}

// —— Earnings ——

export async function getEarningsSummary(): Promise<EarningsSummary> {
  const { data } = await joballaAxios.get<EarningsSummary>(`${EARNINGS}/summary`);
  return data;
}

export async function getEarningsTransactions(
  params?: EarningsTransactionsParams,
): Promise<Paginated<EarningTransaction>> {
  const { data } = await joballaAxios.get(`${EARNINGS}/transactions`, { params: clampListParams(params) });
  return normalizePaginated<EarningTransaction>(data);
}

export async function getEarningsTransaction(transactionId: string): Promise<EarningTransaction> {
  const { data } = await joballaAxios.get<EarningTransaction>(`${EARNINGS}/transactions/${transactionId}`);
  return data;
}

export async function getEarningsStatement(params: {
  from: string;
  to: string;
}): Promise<EarningTransaction[]> {
  const { data } = await joballaAxios.get<EarningTransaction[]>(`${EARNINGS}/statement`, { params });
  return data;
}

// —— Engagements ——

export async function getWorkerEngagements(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<Paginated<WorkerEngagementListItem>> {
  const { data } = await joballaAxios.get(`${WORKER}/engagements`, { params: clampListParams(params) });
  return normalizePaginated<WorkerEngagementListItem>(data);
}

export async function getWorkerEngagement(engagementId: string): Promise<WorkerEngagementDetail> {
  const { data } = await joballaAxios.get<WorkerEngagementDetail>(`${WORKER}/engagements/${engagementId}`);
  return data;
}

export async function getWorkerNotifications(params?: {
  filter?: string;
  type?: string;
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}): Promise<Paginated<WorkerNotificationItem>> {
  const { data } = await joballaAxios.get(`${WORKER}/notifications`, {
    params: clampListParams(encodeNotificationParams(params)),
  });
  return normalizePaginated<WorkerNotificationItem>(data);
}

function encodeNotificationParams(params?: {
  filter?: string;
  type?: string;
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}) {
  if (!params) return undefined;
  const { filter, ...rest } = params;
  return {
    ...rest,
    type: rest.type ?? (filter && filter !== "all" ? filter : undefined),
  };
}

function normalizeWorkerNotificationSettings(data: unknown): WorkerNotificationSettings {
  const raw = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  return {
    pushEnabled: typeof raw.inAppEnabled === "boolean" ? raw.inAppEnabled : Boolean(raw.pushEnabled ?? true),
    emailEnabled: typeof raw.emailEnabled === "boolean" ? raw.emailEnabled : true,
    jobsEnabled:
      typeof raw.jobUpdates === "boolean"
        ? raw.jobUpdates
        : typeof raw.jobsEnabled === "boolean"
          ? raw.jobsEnabled
          : true,
    messagesEnabled:
      typeof raw.engagementUpdates === "boolean"
        ? raw.engagementUpdates
        : typeof raw.messagesEnabled === "boolean"
          ? raw.messagesEnabled
          : false,
  };
}

function encodeWorkerNotificationSettings(body: WorkerNotificationSettings): Record<string, boolean | undefined> {
  return {
    inAppEnabled: body.pushEnabled,
    emailEnabled: body.emailEnabled,
    jobUpdates: body.jobsEnabled,
    engagementUpdates: body.messagesEnabled,
  };
}

export async function getWorkerNotificationSettings(): Promise<WorkerNotificationSettings> {
  const { data } = await joballaAxios.get(`${WORKER}/settings/notifications`);
  return normalizeWorkerNotificationSettings(data);
}

export async function patchWorkerNotificationRead(notificationId: string): Promise<WorkerNotificationItem> {
  const { data } = await joballaAxios.patch<WorkerNotificationItem>(
    `${WORKER}/notifications/${notificationId}/read`,
  );
  return data;
}

export async function patchWorkerNotificationSettings(
  body: WorkerNotificationSettings,
): Promise<WorkerNotificationSettings> {
  const { data } = await joballaAxios.patch(`${WORKER}/settings/notifications`, encodeWorkerNotificationSettings(body));
  return normalizeWorkerNotificationSettings(data);
}
