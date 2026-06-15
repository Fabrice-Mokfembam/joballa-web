/**
 * Employer portal REST API — v2 paths (`routedocs/FRONTEND_EMPLOYER_ROUTES.md`, no `/api` prefix).
 */
import { joballaAxios } from "@/lib/http/axios-instance";
import {
  encodeUpdateEmployerCompany,
  normalizeEmployerCompany,
} from "@/features/employer/lib/company-mapper";
import { toApiEmployerJobStatus } from "@/features/employer/lib/employer-job-status";
import { normalizeEmployerMe } from "@/features/employer/lib/normalize-employer-me";
import {
  normalizeEmployerDashboard,
  normalizeEmployerJobDetail,
  normalizeEmployerJobListItem,
} from "@/features/employer/lib/normalize-employer-job";
import { mapApplicantStatusForApi } from "@/features/employer/lib/employer-applicant-status";
import {
  normalizeEmployerApplicantDetail,
  normalizeEmployerApplicantFilters,
  normalizeEmployerApplicantListItem,
  normalizeEmployerApplicantPage,
} from "@/features/employer/lib/normalize-employer-applicant";
import {
  normalizeEmployerWorkforceList,
  normalizeEmployerWorkforceWorker,
} from "@/features/employer/lib/normalize-employer-workforce";
import { normalizeEmployerJobDepartment } from "@/features/employer/lib/normalize-employer-department";
import { normalizePaginated } from "@/lib/http/normalize-paginated";
import type {
  ApplicantShareResponse,
  CreateEmployerJobBody,
  CreateEmployerJobResponse,
  EmployerApplicantDetail,
  EmployerApplicantFilters,
  EmployerApplicantListItem,
  EmployerApplicantNotesResponse,
  EmployerApplicantStatus,
  EmployerCompany,
  EmployerDashboard,
  EmployerJobDetail,
  EmployerJobListItem,
  EmployerJobDepartment,
  EmployerMe,
  EmployerNotification,
  EmployerNotificationSettings,
  EmployerPaymentHistoryItem,
  EmployerPayWorkersResponse,
  EmployerPaymentsSummary,
  EmployerWorkforceList,
  CreateInformalJobRequest,
  CreateInformalJobResponse,
  InformalJobRequestListItem,
  Paginated,
  PatchEmployerApplicantNotesBody,
  PayWorkerBody,
  PayWorkerResponse,
  UpdateEmployerCompanyBody,
  UpdateEmployerJobBody,
  UpdateWorkforceStatusBody,
} from "@/features/employer/types/employer-portal";

const BASE = "/employer";

export async function getEmployerMe(): Promise<EmployerMe> {
  const { data } = await joballaAxios.get(`${BASE}/me`);
  return normalizeEmployerMe(data);
}

export async function getEmployerDashboard(): Promise<EmployerDashboard> {
  const { data } = await joballaAxios.get(`${BASE}/dashboard`);
  return normalizeEmployerDashboard(data as Record<string, unknown>);
}

export async function createEmployerJob(body: CreateEmployerJobBody): Promise<CreateEmployerJobResponse> {
  const { data } = await joballaAxios.post<CreateEmployerJobResponse>(`${BASE}/jobs`, body);
  return data;
}

export async function getEmployerJobs(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<Paginated<EmployerJobListItem>> {
  const { data } = await joballaAxios.get(`${BASE}/jobs`, { params });
  const paginated = normalizePaginated<EmployerJobListItem>(data);
  return {
    ...paginated,
    items: paginated.items.map((item) =>
      normalizeEmployerJobListItem(item as Parameters<typeof normalizeEmployerJobListItem>[0]),
    ),
  };
}

export async function getEmployerJob(jobId: string): Promise<EmployerJobDetail> {
  const { data } = await joballaAxios.get<EmployerJobDetail>(`${BASE}/jobs/${jobId}`);
  return normalizeEmployerJobDetail(data as Parameters<typeof normalizeEmployerJobDetail>[0]);
}

export async function patchEmployerJob(jobId: string, body: UpdateEmployerJobBody): Promise<EmployerJobDetail> {
  const { data } = await joballaAxios.patch<EmployerJobDetail>(`${BASE}/jobs/${jobId}`, body);
  return normalizeEmployerJobDetail(data as Parameters<typeof normalizeEmployerJobDetail>[0]);
}

export async function patchEmployerJobStatus(
  jobId: string,
  status: string,
): Promise<EmployerJobDetail> {
  const { data } = await joballaAxios.patch<EmployerJobDetail>(`${BASE}/jobs/${jobId}/status`, {
    status: toApiEmployerJobStatus(status),
  });
  return normalizeEmployerJobDetail(data as Parameters<typeof normalizeEmployerJobDetail>[0]);
}

export async function saveEmployerJobDraft(
  jobId: string,
  body: UpdateEmployerJobBody,
): Promise<EmployerJobDetail> {
  const { data } = await joballaAxios.post<EmployerJobDetail>(`${BASE}/jobs/${jobId}/draft`, body);
  return normalizeEmployerJobDetail(data as Parameters<typeof normalizeEmployerJobDetail>[0]);
}

export async function publishEmployerJob(
  jobId: string,
  body?: UpdateEmployerJobBody,
): Promise<CreateEmployerJobResponse> {
  const { data } = await joballaAxios.post<CreateEmployerJobResponse>(`${BASE}/jobs/${jobId}/publish`, body ?? {});
  return data;
}

export async function deleteEmployerJob(jobId: string): Promise<void> {
  await joballaAxios.delete(`${BASE}/jobs/${jobId}`);
}

export async function getEmployerDepartments(params?: {
  isActive?: boolean;
  category?: string;
}): Promise<Paginated<EmployerJobDepartment>> {
  const { data } = await joballaAxios.get(`${BASE}/departments`, { params });
  const paginated = normalizePaginated<EmployerJobDepartment>(data);
  return {
    ...paginated,
    items: paginated.items
      .map((item) => normalizeEmployerJobDepartment(item))
      .filter((item): item is EmployerJobDepartment => item != null),
  };
}

export async function getEmployerApplicantFilters(): Promise<EmployerApplicantFilters> {
  const { data } = await joballaAxios.get(`${BASE}/applicants/filters`);
  return normalizeEmployerApplicantFilters(data);
}

export async function getEmployerApplicants(params?: {
  search?: string;
  jobId?: string;
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
  view?: "list" | "grid";
}): Promise<Paginated<EmployerApplicantListItem>> {
  const apiParams = {
    ...params,
    status: mapApplicantStatusForApi(params?.status),
  };
  const { data } = await joballaAxios.get(`${BASE}/applicants`, { params: apiParams });
  return normalizeEmployerApplicantPage(normalizePaginated<EmployerApplicantListItem>(data));
}

export async function getEmployerApplicant(applicationId: string): Promise<EmployerApplicantDetail> {
  const { data } = await joballaAxios.get<EmployerApplicantDetail>(`${BASE}/applicants/${applicationId}`);
  return normalizeEmployerApplicantDetail(data);
}

export async function patchEmployerApplicantStatus(
  applicationId: string,
  body: { status: EmployerApplicantStatus; note?: string },
): Promise<EmployerApplicantListItem> {
  const { data } = await joballaAxios.patch<EmployerApplicantListItem>(
    `${BASE}/applicants/${applicationId}/status`,
    body,
  );
  return normalizeEmployerApplicantListItem(data);
}

export async function patchEmployerApplicantNotes(
  applicationId: string,
  body: PatchEmployerApplicantNotesBody,
): Promise<EmployerApplicantNotesResponse> {
  const { data } = await joballaAxios.patch<EmployerApplicantNotesResponse>(
    `${BASE}/applicants/${applicationId}/notes`,
    body,
  );
  return data;
}

export async function getEmployerApplicantShare(applicationId: string): Promise<ApplicantShareResponse> {
  const { data } = await joballaAxios.get<ApplicantShareResponse>(
    `${BASE}/applicants/${applicationId}/share`,
  );
  return data;
}

export async function getEmployerWorkforce(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<EmployerWorkforceList> {
  const apiParams =
    params?.status && params.status !== "all"
      ? { page: params.page, limit: params.limit, status: params.status }
      : { page: params?.page, limit: params?.limit };
  const { data } = await joballaAxios.get(`${BASE}/workforce`, { params: apiParams });
  return normalizeEmployerWorkforceList(data);
}

export async function getEmployerWorkforceWorker(workerId: string): Promise<Record<string, unknown>> {
  const { data } = await joballaAxios.get(`${BASE}/workforce/${workerId}`);
  return normalizeEmployerWorkforceWorker(data);
}

export async function patchEmployerWorkforceStatus(
  workerId: string,
  body: UpdateWorkforceStatusBody,
): Promise<Record<string, unknown>> {
  const { data } = await joballaAxios.patch<Record<string, unknown>>(
    `${BASE}/workforce/${workerId}/status`,
    body,
  );
  return data;
}

export async function getEmployerPaymentsSummary(params?: {
  month?: number;
  year?: number;
}): Promise<EmployerPaymentsSummary> {
  const { data } = await joballaAxios.get<EmployerPaymentsSummary>(`${BASE}/payments`, { params });
  return data;
}

export async function getEmployerPaymentWorkers(params?: {
  month?: number;
  year?: number;
}): Promise<EmployerPayWorkersResponse> {
  const { data } = await joballaAxios.get<EmployerPayWorkersResponse>(`${BASE}/payments/workers`, { params });
  return data;
}

export async function payEmployerWorker(body: PayWorkerBody): Promise<PayWorkerResponse> {
  const { data } = await joballaAxios.post<PayWorkerResponse>(`${BASE}/payments/pay`, body);
  return data;
}

export async function getEmployerPaymentHistory(params?: {
  search?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}): Promise<Paginated<EmployerPaymentHistoryItem>> {
  const { data } = await joballaAxios.get(`${BASE}/payments/history`, { params });
  return normalizePaginated<EmployerPaymentHistoryItem>(data);
}

export async function getEmployerPayment(paymentId: string): Promise<Record<string, unknown>> {
  const { data } = await joballaAxios.get<Record<string, unknown>>(`${BASE}/payments/${paymentId}`);
  return data;
}

export async function getEmployerPaymentStatement(params: {
  from: string;
  to: string;
}): Promise<Record<string, unknown>> {
  const { data } = await joballaAxios.get<Record<string, unknown>>(`${BASE}/payments/statement`, { params });
  return data;
}

export async function getEmployerCompany(): Promise<EmployerCompany> {
  const { data } = await joballaAxios.get(`${BASE}/company`);
  return normalizeEmployerCompany(data);
}

export async function patchEmployerCompany(body: UpdateEmployerCompanyBody): Promise<EmployerCompany> {
  const { data } = await joballaAxios.patch(`${BASE}/company`, encodeUpdateEmployerCompany(body));
  return normalizeEmployerCompany(data);
}

export async function uploadEmployerCompanyLogo(file: File): Promise<EmployerCompany> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await joballaAxios.post(`${BASE}/company/logo`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return normalizeEmployerCompany(data);
}

export async function uploadEmployerCompanyDocument(file: File, documentName?: string): Promise<EmployerCompany> {
  const form = new FormData();
  form.append("file", file);
  if (documentName?.trim()) form.append("documentName", documentName.trim());
  const { data } = await joballaAxios.post(`${BASE}/company/documents`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return normalizeEmployerCompany(data);
}

export async function deleteEmployerCompanyDocument(documentId: string): Promise<void> {
  await joballaAxios.delete(`${BASE}/company/documents/${documentId}`);
}

export async function getEmployerNotifications(params?: {
  filter?: string;
  type?: string;
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}): Promise<Paginated<EmployerNotification>> {
  const { data } = await joballaAxios.get(`${BASE}/notifications`, {
    params: encodeNotificationParams(params),
  });
  return normalizePaginated<EmployerNotification>(data);
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

function normalizeEmployerNotificationSettings(data: unknown): EmployerNotificationSettings {
  const raw = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  return {
    pushEnabled: typeof raw.pushEnabled === "boolean" ? raw.pushEnabled : true,
    emailEnabled: typeof raw.emailEnabled === "boolean" ? raw.emailEnabled : true,
    applicantsEnabled:
      typeof raw.applicationUpdates === "boolean"
        ? raw.applicationUpdates
        : typeof raw.applicantsEnabled === "boolean"
          ? raw.applicantsEnabled
          : true,
    messagesEnabled:
      typeof raw.engagementUpdates === "boolean"
        ? raw.engagementUpdates
        : typeof raw.messagesEnabled === "boolean"
          ? raw.messagesEnabled
          : false,
  };
}

function encodeEmployerNotificationSettings(body: EmployerNotificationSettings): Record<string, boolean | undefined> {
  return {
    pushEnabled: body.pushEnabled,
    emailEnabled: body.emailEnabled,
    applicationUpdates: body.applicantsEnabled,
    engagementUpdates: body.messagesEnabled,
  };
}

export async function getEmployerNotificationSettings(): Promise<EmployerNotificationSettings> {
  const { data } = await joballaAxios.get(`${BASE}/settings/notifications`);
  return normalizeEmployerNotificationSettings(data);
}

export async function patchEmployerNotificationRead(notificationId: string): Promise<EmployerNotification> {
  const { data } = await joballaAxios.patch<EmployerNotification>(
    `${BASE}/notifications/${notificationId}/read`,
  );
  return data;
}

export async function patchEmployerNotificationSettings(
  body: EmployerNotificationSettings,
): Promise<EmployerNotificationSettings> {
  const { data } = await joballaAxios.patch(
    `${BASE}/settings/notifications`,
    encodeEmployerNotificationSettings(body),
  );
  return normalizeEmployerNotificationSettings(data);
}

export async function getEmployerInformalRequests(params?: {
  page?: number;
  limit?: number;
}): Promise<Paginated<InformalJobRequestListItem>> {
  const { data } = await joballaAxios.get(`${BASE}/informal-requests`, { params });
  return normalizePaginated<InformalJobRequestListItem>(data);
}

export async function createEmployerInformalRequest(
  body: CreateInformalJobRequest,
): Promise<CreateInformalJobResponse> {
  const { data } = await joballaAxios.post<CreateInformalJobResponse>(
    `${BASE}/informal-requests`,
    body,
  );
  return data;
}
