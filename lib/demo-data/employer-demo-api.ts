import type {
  ApplicantShareResponse,
  CreateInformalJobRequest,
  CreateInformalJobResponse,
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
  EmployerMe,
  EmployerNotification,
  EmployerNotificationSettings,
  EmployerPaymentHistoryItem,
  EmployerPayWorkersResponse,
  EmployerPaymentsSummary,
  EmployerWorkforceList,
  InformalJobRequestListItem,
  Paginated,
  PayWorkerBody,
  PayWorkerResponse,
  UpdateEmployerCompanyBody,
  UpdateEmployerJobBody,
} from "@/features/employer/types/employer-portal";
import { WORKER_NOTIFICATIONS } from "@/lib/worker-notifications-data";
import { demoDelay, paginate } from "@/lib/demo-data/paginate";
import {
  applicantFilters,
  applicantToDetail,
  buildEmployerDashboard,
  createDemoApplicants,
  createDemoEmployerJobs,
  createDemoPaymentHistory,
  createDemoWorkforce,
  DEMO_EMPLOYER_COMPANY,
  DEMO_EMPLOYER_ME,
  DEMO_PAYMENTS_SUMMARY,
  demoPayWorkers,
  jobToDetail,
  workforceWorkerToDetail,
} from "@/lib/demo-data/employer-fixtures";

type EmployerDemoState = {
  jobs: EmployerJobListItem[];
  applicants: EmployerApplicantListItem[];
  workforce: ReturnType<typeof createDemoWorkforce>;
  paymentHistory: EmployerPaymentHistoryItem[];
  informalRequests: InformalJobRequestListItem[];
  company: EmployerCompany;
  notifications: EmployerNotification[];
  notificationSettings: EmployerNotificationSettings;
};

function initialState(): EmployerDemoState {
  const jobs = createDemoEmployerJobs(18);
  return {
    jobs,
    applicants: createDemoApplicants(jobs),
    workforce: createDemoWorkforce(),
    paymentHistory: createDemoPaymentHistory(),
    informalRequests: [
      {
        id: "demo-employer-request-1",
        department: { id: "demo-dept-domestic", name: "Domestic work", category: "domestic" },
        title: "Weekend house support",
        paymentManagedByJoballa: true,
        status: "submitted",
        assignedJobId: null,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ],
    company: structuredClone(DEMO_EMPLOYER_COMPANY),
    notifications: WORKER_NOTIFICATIONS.slice(0, 4).map((n) => ({
      id: n.id,
      type: n.filter,
      title: n.actor ?? "Joballa",
      body: n.text,
      read: n.read,
      createdAt: new Date().toISOString(),
      deepLink: n.href ?? null,
    })),
    notificationSettings: {
      pushEnabled: true,
      emailEnabled: true,
      applicantsEnabled: true,
      messagesEnabled: false,
    },
  };
}

let state = initialState();

export function resetEmployerDemoState(): void {
  state = initialState();
}

export async function getEmployerMe(): Promise<EmployerMe> {
  await demoDelay();
  return { ...DEMO_EMPLOYER_ME };
}

export async function getEmployerDashboard(): Promise<EmployerDashboard> {
  await demoDelay();
  return buildEmployerDashboard(state.jobs, state.applicants);
}

export async function createEmployerJob(body: CreateEmployerJobBody): Promise<CreateEmployerJobResponse> {
  await demoDelay(150);
  const jobId = `demo-emp-job-${state.jobs.length + 1}`;
  state.jobs.unshift({
    jobId,
    title: body.title,
    location: body.city,
    jobType: body.employmentType,
    salary: `${body.payAmount} ${body.payCurrency ?? "XAF"}/${body.payStructure}`,
    status: body.asDraft ? "draft" : "under_review",
    applicantsCount: 0,
    shortlistedCount: 0,
    postedAt: new Date().toISOString(),
  });
  return { jobId, status: body.asDraft ? "draft" : "under_review", message: "Job saved (demo)." };
}

export async function getEmployerJobs(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<Paginated<EmployerJobListItem>> {
  await demoDelay();
  const status = params?.status;
  return paginate(
    state.jobs,
    params,
    status ? (j) => String(j.status) === status : undefined,
  );
}

export async function getEmployerJob(jobId: string): Promise<EmployerJobDetail> {
  await demoDelay();
  const job = state.jobs.find((j) => j.jobId === jobId);
  if (!job) throw new Error("Job not found");
  return jobToDetail(job);
}

export async function patchEmployerJob(jobId: string, body: UpdateEmployerJobBody): Promise<EmployerJobDetail> {
  await demoDelay(100);
  const job = state.jobs.find((j) => j.jobId === jobId);
  if (!job) throw new Error("Job not found");
  if (body.title) job.title = body.title;
  if (body.city) job.location = body.city;
  return jobToDetail(job);
}

export async function patchEmployerJobStatus(jobId: string, status: string): Promise<EmployerJobDetail> {
  await demoDelay(80);
  const job = state.jobs.find((j) => j.jobId === jobId);
  if (!job) throw new Error("Job not found");
  job.status = status;
  return jobToDetail(job);
}

export async function saveEmployerJobDraft(jobId: string, body: UpdateEmployerJobBody): Promise<EmployerJobDetail> {
  await patchEmployerJob(jobId, body);
  const job = state.jobs.find((j) => j.jobId === jobId)!;
  job.status = "draft";
  return jobToDetail(job);
}

export async function deleteEmployerJob(jobId: string): Promise<void> {
  await demoDelay(80);
  state.jobs = state.jobs.filter((j) => j.jobId !== jobId);
}

export async function getEmployerApplicantFilters(): Promise<EmployerApplicantFilters> {
  await demoDelay(40);
  return applicantFilters(state.jobs);
}

export async function getEmployerApplicants(params?: {
  search?: string;
  jobId?: string;
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<Paginated<EmployerApplicantListItem>> {
  await demoDelay();
  let list = [...state.applicants];
  if (params?.jobId) list = list.filter((a) => a.jobId === params.jobId);
  if (params?.status) list = list.filter((a) => String(a.status) === params.status);
  if (params?.sort === "match") {
    list.sort((a, b) => Number(b.matchScore ?? 0) - Number(a.matchScore ?? 0));
  } else {
    list.sort((a, b) => String(b.appliedAt).localeCompare(String(a.appliedAt)));
  }
  return paginate(list, { page: params?.page, limit: params?.limit, search: params?.search });
}

export async function getEmployerApplicant(applicationId: string): Promise<EmployerApplicantDetail> {
  await demoDelay();
  const app = state.applicants.find((a) => (a.applicationId ?? a.id) === applicationId);
  if (!app) throw new Error("Applicant not found");
  const job = state.jobs.find((j) => j.jobId === app.jobId);
  return applicantToDetail(app, job ? jobToDetail(job) : undefined);
}

export async function patchEmployerApplicantStatus(
  applicationId: string,
  status: EmployerApplicantStatus,
): Promise<EmployerApplicantListItem> {
  await demoDelay(80);
  const app = state.applicants.find((a) => (a.applicationId ?? a.id) === applicationId);
  if (!app) throw new Error("Applicant not found");
  app.status = status;
  return { ...app };
}

export async function patchEmployerApplicantNotes(
  applicationId: string,
  body: { employerNotes: string },
): Promise<EmployerApplicantNotesResponse> {
  await demoDelay(60);
  const app = state.applicants.find((a) => (a.applicationId ?? a.id) === applicationId);
  if (!app) throw new Error("Applicant not found");
  app.employerNotes = body.employerNotes;
  return { applicationId, employerNotes: body.employerNotes };
}

export async function getEmployerApplicantShare(applicationId: string): Promise<ApplicantShareResponse> {
  await demoDelay(40);
  return { shareUrl: `https://joballa.test/applicants/${applicationId}` };
}

function workforceStatusFilter(status?: string) {
  if (status === "active") {
    return (item: (typeof state.workforce)[number]) => String(item.status ?? "active") === "active";
  }
  if (status === "terminated") {
    return (item: (typeof state.workforce)[number]) => {
      const value = String(item.status ?? "active");
      return value === "terminated" || value === "rejected";
    };
  }
  return undefined;
}

function workforceTabCounts() {
  const all = state.workforce.length;
  const active = state.workforce.filter((item) => String(item.status ?? "active") === "active").length;
  const terminated = state.workforce.filter((item) => {
    const value = String(item.status ?? "active");
    return value === "terminated" || value === "rejected";
  }).length;
  return { all, active, terminated };
}

export async function getEmployerWorkforce(params?: {
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}): Promise<EmployerWorkforceList> {
  await demoDelay();
  const filter = params?.status && params.status !== "all" ? workforceStatusFilter(params.status) : undefined;
  const page = paginate(state.workforce, params, filter);
  const tabCounts = workforceTabCounts();
  return {
    ...page,
    stats: {
      activeWorkers: { count: 4, trend: "1 hired this month" },
      engagementsEnded: { count: 5, trend: "4 this year" },
      tabCounts: { all: 6, active: 4, terminated: 3 },
    },
  };
}

export async function getEmployerWorkforceWorker(workerId: string): Promise<Record<string, unknown>> {
  await demoDelay();
  const w = state.workforce.find((x) => (x.workerId ?? x.id) === workerId);
  if (!w) return {};
  return workforceWorkerToDetail(w);
}

export async function patchEmployerWorkforceStatus(_workerId: string, _body: { status: string }): Promise<unknown> {
  await demoDelay(60);
  return { ok: true };
}

export async function getEmployerPaymentsSummary(_params?: {
  month?: number;
  year?: number;
}): Promise<EmployerPaymentsSummary> {
  await demoDelay();
  return { ...DEMO_PAYMENTS_SUMMARY };
}

export async function getEmployerPaymentWorkers(_params?: {
  month?: number;
  year?: number;
}): Promise<EmployerPayWorkersResponse> {
  await demoDelay();
  return demoPayWorkers(state.workforce);
}

export async function payEmployerWorker(_body: PayWorkerBody): Promise<PayWorkerResponse> {
  await demoDelay(150);
  return { paymentId: `demo-pay-new-${Date.now()}`, status: "completed", message: "Payment recorded (demo)." };
}

export async function getEmployerPaymentHistory(params?: {
  page?: number;
  limit?: number;
}): Promise<Paginated<EmployerPaymentHistoryItem>> {
  await demoDelay();
  return paginate(state.paymentHistory, params);
}

export async function getEmployerPayment(paymentId: string): Promise<Record<string, unknown>> {
  await demoDelay();
  const p = state.paymentHistory.find((x) => (x.paymentId ?? x.id) === paymentId);
  return { ...(p ?? {}), paymentId };
}

export async function getEmployerPaymentStatement(_params: { from: string; to: string }): Promise<unknown> {
  await demoDelay();
  return { items: state.paymentHistory.slice(0, 15) };
}

export async function getEmployerCompany(): Promise<EmployerCompany> {
  await demoDelay();
  return structuredClone(state.company);
}

export async function patchEmployerCompany(body: UpdateEmployerCompanyBody): Promise<EmployerCompany> {
  await demoDelay(100);
  Object.assign(state.company, body);
  return structuredClone(state.company);
}

export async function uploadEmployerCompanyLogo(_file: File): Promise<EmployerCompany> {
  await demoDelay(100);
  return structuredClone(state.company);
}

export async function uploadEmployerCompanyDocument(file: File, documentName?: string): Promise<EmployerCompany> {
  await demoDelay(100);
  const documents = state.company.documents ?? [];
  state.company.documents = [
    ...documents,
    {
      id: `demo-company-doc-${documents.length + 1}`,
      documentName: documentName?.trim() || file.name || "Business document",
      documentUrl: "#",
      documentType: file.type.includes("image") ? "image" : "pdf",
      verificationStatus: "pending",
      createdAt: new Date().toISOString(),
    },
  ];
  return structuredClone(state.company);
}

export async function deleteEmployerCompanyDocument(documentId: string): Promise<void> {
  await demoDelay(60);
  state.company.documents = (state.company.documents ?? []).filter((doc) => doc.id !== documentId);
}

export async function getEmployerNotifications(params?: {
  filter?: string;
  page?: number;
  limit?: number;
}): Promise<Paginated<EmployerNotification>> {
  await demoDelay();
  const filter = params?.filter ?? "all";
  const items =
    filter === "all"
      ? state.notifications
      : state.notifications.filter((n) => String(n.type).includes(filter.replace(/s$/, "")));
  return paginate(items, params);
}

export async function patchEmployerNotificationRead(notificationId: string): Promise<EmployerNotification> {
  await demoDelay(40);
  const item = state.notifications.find((n) => n.id === notificationId);
  if (!item) throw new Error("Notification not found");
  item.read = true;
  return { ...item };
}

export async function getEmployerNotificationSettings(): Promise<EmployerNotificationSettings> {
  await demoDelay(40);
  return { ...state.notificationSettings };
}

export async function patchEmployerNotificationSettings(
  body: EmployerNotificationSettings,
): Promise<EmployerNotificationSettings> {
  await demoDelay(40);
  state.notificationSettings = { ...state.notificationSettings, ...body };
  return { ...state.notificationSettings };
}

export async function getEmployerInformalRequests(params?: {
  page?: number;
  limit?: number;
}): Promise<Paginated<InformalJobRequestListItem>> {
  await demoDelay();
  return paginate(state.informalRequests, params);
}

export async function createEmployerInformalRequest(
  body: CreateInformalJobRequest,
): Promise<CreateInformalJobResponse> {
  await demoDelay(100);
  const id = `demo-employer-request-${state.informalRequests.length + 1}`;
  const title = String(body.formData.title ?? body.departmentCategory);
  state.informalRequests.unshift({
    id,
    department: {
      id: body.departmentId,
      name: body.departmentCategory,
      category: body.departmentCategory,
    },
    title,
    paymentManagedByJoballa: body.paymentManagedByJoballa,
    status: "submitted",
    assignedJobId: null,
    createdAt: new Date().toISOString(),
  });
  return { id, status: "submitted", assignedJobId: null, message: "Informal request submitted (demo)." };
}
