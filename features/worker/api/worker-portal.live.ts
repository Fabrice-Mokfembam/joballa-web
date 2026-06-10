/**
 * Worker portal REST API — v2 paths (`routedocs/FRONTEND_WORKER_ROUTES.md`, no `/api` prefix).
 */
import { joballaAxios } from "@/lib/http/axios-instance";
import { clampListParams } from "@/lib/http/api-pagination";
import { normalizePaginated } from "@/lib/http/normalize-paginated";
import { normalizeWorkerDashboard } from "@/features/worker/lib/dashboard-mapper";
import { normalizeWorkerJobListItem } from "@/features/worker/lib/normalize-worker-job";
import {
  normalizeEarningTransaction,
  normalizeEarningsSummary,
  normalizeWorkerApplication,
  normalizeWorkerApplicationDetail,
  normalizeWorkerEngagement,
  normalizeWorkerEngagementDetail,
  normalizeWorkerIncomingApplication,
  normalizeWorkerIncomingApplicationDetail,
  normalizeWorkerNotification,
} from "@/features/worker/lib/worker-response-mappers";
import {
  encodeKycBody,
  encodePaymentAccountBody,
  encodePersonalInfoPatch,
  encodeProfessionalSummaryPatch,
  encodePutWorkerProfile,
  mergeWorkerMeWithProfile,
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
  ApplicationProfileDraft,
  JobSaveResponse,
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
  WorkerCvDownload,
  WorkerCvExportStatus,
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
  WorkerNotificationUnreadCount,
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
  const me = normalizeWorkerMe(data);
  try {
    const { data: profileData } = await joballaAxios.get(`${WORKER}/profile`);
    return mergeWorkerMeWithProfile(me, normalizeWorkerProfile(profileData));
  } catch {
    return me;
  }
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

function cvFileName(contentDisposition?: string): string {
  const encoded = contentDisposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (encoded) return decodeURIComponent(encoded);
  return contentDisposition?.match(/filename="?([^";]+)"?/i)?.[1] ?? "joballa-cv.pdf";
}

export async function getWorkerCvExportStatus(): Promise<WorkerCvExportStatus> {
  const { data } = await joballaAxios.get<WorkerCvExportStatus>(`${WORKER}/profile/cv-export/status`);
  const downloadUrl =
    typeof data.downloadUrl === "string" && data.downloadUrl.trim()
      ? data.downloadUrl.startsWith("http")
        ? data.downloadUrl
        : `${WORKER}/profile/cv-export`
      : null;
  return { ...data, downloadUrl };
}

export async function getWorkerCvExport(): Promise<WorkerCvDownload> {
  const response = await joballaAxios.get<Blob>(`${WORKER}/profile/cv-export`, {
    responseType: "blob",
    headers: { Accept: "application/pdf" },
  });
  return {
    blob: response.data,
    fileName: cvFileName(response.headers["content-disposition"]),
  };
}

export async function postWorkerCvExport(): Promise<WorkerCvDownload> {
  const response = await joballaAxios.post<Blob>(`${WORKER}/profile/cv-export`, undefined, {
    responseType: "blob",
    headers: { Accept: "application/pdf" },
  });
  return {
    blob: response.data,
    fileName: cvFileName(response.headers["content-disposition"]),
  };
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
  const { data } = await joballaAxios.patch(`${WORKER}/profile/certifications/${certId}`, body);
  const profile = normalizeWorkerProfile(data);
  return profile.certifications?.find((c) => c.id === certId) ?? (data as WorkerCertification);
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
  const profile = normalizeWorkerProfile(data);
  return (
    profile.paymentAccounts?.find((a) => a.id === accountId) ??
    profile.paymentAccounts?.[0] ??
    (data as WorkerPaymentAccount)
  );
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

function normalizeWorkerOwnedJobListItem(item: unknown): WorkerOwnedJobListItem {
  const raw = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
  const department =
    raw.department && typeof raw.department === "object"
      ? (raw.department as { id?: string; name?: string; category?: string })
      : undefined;
  const locationParts = [raw.neighbourhood, raw.city, raw.region].filter((part) => typeof part === "string" && part.trim());
  const payAmount = typeof raw.payAmount === "number" ? raw.payAmount : undefined;
  const payCurrency = typeof raw.payCurrency === "string" ? raw.payCurrency : "XAF";
  const payStructure = typeof raw.payStructure === "string" ? raw.payStructure : undefined;
  const salary =
    typeof raw.salary === "string"
      ? raw.salary
      : payAmount != null
        ? `${payAmount.toLocaleString("en-US")} ${payCurrency}${payStructure ? `/${payStructure}` : ""}`
        : undefined;

  return {
    ...(raw as WorkerOwnedJobListItem),
    jobId: String(raw.jobId ?? raw.id ?? raw.assignedJobId ?? ""),
    title: String(raw.title ?? department?.name ?? "Job"),
    department: department
      ? {
          id: String(department.id ?? ""),
          name: String(department.name ?? "Department"),
          category: String(department.category ?? ""),
        }
      : undefined,
    location:
      typeof raw.location === "string"
        ? raw.location
        : locationParts.length > 0
          ? locationParts.join(", ")
          : undefined,
    jobType:
      typeof raw.employmentType === "string"
        ? raw.employmentType
        : typeof raw.jobType === "string"
          ? raw.jobType
          : undefined,
    salary,
    status: String(raw.status ?? "draft"),
    applicantsCount:
      typeof raw.applicantsCount === "number"
        ? raw.applicantsCount
        : typeof raw.applicationCount === "number"
          ? raw.applicationCount
          : undefined,
    postedAt:
      raw.postedAt != null
        ? String(raw.postedAt)
        : raw.createdAt != null
          ? String(raw.createdAt)
          : undefined,
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
    items: page.items.map(normalizeWorkerOwnedJobListItem),
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

function listQueryParams(params?: Record<string, unknown>) {
  const clamped = clampListParams(params as { page?: number; limit?: number } | undefined) ?? {};
  return Object.fromEntries(
    Object.entries({ ...params, ...clamped }).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === "string" && value === "") return false;
      return true;
    }),
  );
}

export async function getWorkerIncomingApplications(params?: {
  status?: string;
  keyword?: string;
  jobId?: string;
  page?: number;
  limit?: number;
}): Promise<Paginated<WorkerIncomingApplicationListItem>> {
  const { data } = await joballaAxios.get(`${WORKER}/jobs/applications`, {
    params: listQueryParams(params),
  });
  const page = normalizePaginated<unknown>(data);
  return {
    ...page,
    items: page.items
      .map(normalizeWorkerIncomingApplication)
      .filter((item) => item.applicationId || item.id),
  };
}

export async function getWorkerIncomingApplication(
  applicationId: string,
): Promise<WorkerIncomingApplicationDetail> {
  const { data } = await joballaAxios.get(`${WORKER}/jobs/applications/${applicationId}`);
  return normalizeWorkerIncomingApplicationDetail(data);
}

// —— Jobs feed ——

export async function searchWorkerJobs(params?: JobSearchParams): Promise<Paginated<WorkerJobListItem>> {
  const { data } = await joballaAxios.get(JOBS, { params: clampListParams(encodeJobSearchParams(params)) });
  const paginated = normalizePaginated<WorkerJobListItem>(data);
  return {
    ...paginated,
    items: paginated.items.map((item) =>
      normalizeWorkerJobListItem(item as Parameters<typeof normalizeWorkerJobListItem>[0]),
    ),
  };
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
  return normalizeWorkerJobListItem(data as Parameters<typeof normalizeWorkerJobListItem>[0]) as WorkerJobDetail;
}

export async function saveWorkerJob(jobId: string): Promise<JobSaveResponse> {
  const { data } = await joballaAxios.post<JobSaveResponse>(`${JOBS}/${jobId}/save`);
  return { jobId: String(data.jobId ?? jobId), saved: data.saved !== false };
}

export async function unsaveWorkerJob(jobId: string): Promise<JobSaveResponse> {
  const { data } = await joballaAxios.delete<JobSaveResponse>(`${JOBS}/${jobId}/save`);
  return { jobId: String(data?.jobId ?? jobId), saved: data?.saved === true };
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

function normalizeApplicationProfileDraft(raw: unknown, jobId: string): ApplicationProfileDraft {
  const data = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    id: data.id != null ? String(data.id) : undefined,
    applicationId: data.applicationId == null ? null : String(data.applicationId),
    jobId: String(data.jobId ?? jobId),
    profileId: data.profileId != null ? String(data.profileId) : undefined,
    customizedData: (data.customizedData ?? null) as ApplicationProfileDraft["customizedData"],
    createdAt: data.createdAt != null ? String(data.createdAt) : undefined,
    updatedAt: data.updatedAt != null ? String(data.updatedAt) : undefined,
  };
}

export async function getJobApplicationProfileDraft(jobId: string): Promise<ApplicationProfileDraft> {
  const { data } = await joballaAxios.get(`${JOBS}/${jobId}/application/profile`);
  return normalizeApplicationProfileDraft(data, jobId);
}

export async function putJobApplicationProfileDraft(
  jobId: string,
  body: CustomizeProfileBody,
): Promise<ApplicationProfileDraft> {
  const { data } = await joballaAxios.put(`${JOBS}/${jobId}/application/profile`, body);
  return normalizeApplicationProfileDraft(data, jobId);
}

export async function customizeJobApplicationProfile(
  jobId: string,
  body: CustomizeProfileBody,
): Promise<ApplicationProfileDraft> {
  const { data } = await joballaAxios.post(`${JOBS}/${jobId}/application/customize-profile`, body);
  return normalizeApplicationProfileDraft(data, jobId);
}

export async function applyToWorkerJob(jobId: string, body?: ApplyToJobBody): Promise<WorkerApplicationDetail> {
  const note = body?.coverNote ?? body?.jobSpecificNote;
  const { data } = await joballaAxios.post(`${JOBS}/${jobId}/apply`, {
    coverNote: note,
    jobSpecificNote: note,
    source: body?.source ?? "web",
    attachedDocuments: body?.attachedDocuments,
  });
  return normalizeWorkerApplicationDetail(data);
}

export async function getWorkerApplications(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<Paginated<WorkerApplicationListItem>> {
  const { data } = await joballaAxios.get(APPLICATIONS, { params: clampListParams(params) });
  const page = normalizePaginated<unknown>(data);
  return { ...page, items: page.items.map(normalizeWorkerApplication).filter((item) => item.id) };
}

export async function getWorkerApplication(applicationId: string): Promise<WorkerApplicationDetail> {
  const { data } = await joballaAxios.get(`${APPLICATIONS}/${applicationId}`);
  return normalizeWorkerApplicationDetail(data);
}

export async function archiveWorkerApplication(applicationId: string): Promise<void> {
  await joballaAxios.delete(`${APPLICATIONS}/${applicationId}`);
}

// —— Saved jobs ——

export async function getSavedJobs(params?: JobSearchParams): Promise<Paginated<SavedJobItem>> {
  const { data } = await joballaAxios.get(SAVED, { params: clampListParams(params) });
  const paginated = normalizePaginated<unknown>(data);
  const items = paginated.items
    .map((item): SavedJobItem | null => {
      if (!item || typeof item !== "object") return null;
      const raw = item as Record<string, unknown>;
      const nestedJob =
        raw.job && typeof raw.job === "object"
          ? (raw.job as Parameters<typeof normalizeWorkerJobListItem>[0])
          : (raw as Parameters<typeof normalizeWorkerJobListItem>[0]);
      const job = normalizeWorkerJobListItem(nestedJob);
      if (!job.id || !job.title) return null;
      return {
        ...raw,
        id: raw.id != null ? String(raw.id) : undefined,
        jobId: String(raw.jobId ?? job.id),
        savedAt: raw.savedAt != null ? String(raw.savedAt) : undefined,
        job,
      };
    })
    .filter((item): item is SavedJobItem => item != null);
  return {
    ...paginated,
    items,
  };
}

export async function deleteSavedJob(jobId: string): Promise<void> {
  await joballaAxios.delete(`${SAVED}/${jobId}`);
}

export async function bulkDeleteSavedJobs(body: BulkUnsaveJobsBody): Promise<void> {
  await joballaAxios.delete(SAVED, { data: body });
}

// —— Earnings ——

export async function getEarningsSummary(): Promise<EarningsSummary> {
  const { data } = await joballaAxios.get(`${EARNINGS}/summary`);
  return normalizeEarningsSummary(data);
}

export async function getEarningsTransactions(
  params?: EarningsTransactionsParams,
): Promise<Paginated<EarningTransaction>> {
  const { data } = await joballaAxios.get(`${EARNINGS}/transactions`, { params: clampListParams(params) });
  const page = normalizePaginated<unknown>(data);
  return { ...page, items: page.items.map(normalizeEarningTransaction).filter((item) => item.id) };
}

export async function getEarningsTransaction(transactionId: string): Promise<EarningTransaction> {
  const { data } = await joballaAxios.get(`${EARNINGS}/transactions/${transactionId}`);
  return normalizeEarningTransaction(data);
}

export async function getEarningsStatement(params: {
  from: string;
  to: string;
}): Promise<EarningTransaction[]> {
  const { data } = await joballaAxios.get(`${EARNINGS}/statement`, { params });
  const page = normalizePaginated<unknown>(data);
  const items = Array.isArray(data) ? data : page.items;
  return items.map(normalizeEarningTransaction).filter((item) => item.id);
}

// —— Engagements ——

export async function getWorkerEngagements(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<Paginated<WorkerEngagementListItem>> {
  const { data } = await joballaAxios.get(`${WORKER}/engagements`, { params: clampListParams(params) });
  const page = normalizePaginated<unknown>(data);
  return { ...page, items: page.items.map(normalizeWorkerEngagement).filter((item) => item.id) };
}

export async function getWorkerEngagement(engagementId: string): Promise<WorkerEngagementDetail> {
  const { data } = await joballaAxios.get(`${WORKER}/engagements/${engagementId}`);
  return normalizeWorkerEngagementDetail(data);
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
  const page = normalizePaginated<unknown>(data);
  return { ...page, items: page.items.map(normalizeWorkerNotification).filter((item) => item.id) };
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

export async function getWorkerNotificationsUnreadCount(): Promise<WorkerNotificationUnreadCount> {
  const { data } = await joballaAxios.get<WorkerNotificationUnreadCount>(`${WORKER}/notifications/unread-count`);
  return { count: Number(data.count ?? 0) || 0 };
}

export async function patchWorkerNotificationsReadAll(): Promise<{ ok: boolean }> {
  const { data } = await joballaAxios.patch<{ ok: boolean }>(`${WORKER}/notifications/read-all`);
  return { ok: data?.ok !== false };
}

export async function patchWorkerNotificationRead(notificationId: string): Promise<WorkerNotificationItem> {
  const { data } = await joballaAxios.patch(`${WORKER}/notifications/${notificationId}/read`);
  return normalizeWorkerNotification(data);
}

export async function patchWorkerNotificationSettings(
  body: WorkerNotificationSettings,
): Promise<WorkerNotificationSettings> {
  const { data } = await joballaAxios.patch(`${WORKER}/settings/notifications`, encodeWorkerNotificationSettings(body));
  return normalizeWorkerNotificationSettings(data);
}
