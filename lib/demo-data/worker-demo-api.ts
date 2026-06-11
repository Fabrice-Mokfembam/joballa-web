import type {
  ApplyToJobBody,
  BulkUnsaveJobsBody,
  CreateCertificationBody,
  CreateEducationBody,
  CreateWorkHistoryBody,
  CreateWorkerJobBody,
  CreateWorkerJobResponse,
  CreateWorkerPaymentAccountBody,
  ApplicationProfileDraft,
  CustomizeProfileBody,
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
  SubmitKycBody,
  SavedJobItem,
  UpdateWorkerJobBody,
  VerificationDocUploadResponse,
  WorkerCertification,
  WorkerCvDownload,
  WorkerCvExportStatus,
  WorkerDocument,
  WorkerEducation,
  WorkerKycSubmission,
  WorkerWorkHistory,
  WorkerApplicationDetail,
  WorkerApplicationListItem,
  WorkerDashboard,
  WorkerEngagementDetail,
  WorkerEngagementListItem,
  WorkerFullProfile,
  WorkerIncomingApplicationDetail,
  WorkerIncomingApplicationListItem,
  WorkerJobDetail,
  WorkerJobListItem,
  WorkerMe,
  WorkerNotificationItem,
  WorkerNotificationUnreadCount,
  WorkerNotificationSettings,
  WorkerOwnedJobDetail,
  WorkerOwnedJobListItem,
  WorkerPaymentAccount,
  WorkerPublicProfile,
} from "@/features/worker/types/worker-portal";
import { sanitizePutWorkerProfileBody } from "@/features/worker/lib/profile-payload";
import { WORKER_NOTIFICATIONS } from "@/lib/worker-notifications-data";
import { demoDelay, paginate } from "@/lib/demo-data/paginate";
import {
  applicationToDetail,
  createDemoApplications,
  createDemoEngagements,
  createDemoJobs,
  createDemoTransactions,
  DEMO_EARNINGS_SUMMARY,
  DEMO_WORKER_ME,
  DEMO_WORKER_PROFILE,
  jobToDetail,
  savedFromJobs,
} from "@/lib/demo-data/worker-fixtures";

type WorkerDemoState = {
  jobs: WorkerJobListItem[];
  ownedJobs: WorkerOwnedJobListItem[];
  incomingApplications: WorkerIncomingApplicationListItem[];
  applications: WorkerApplicationListItem[];
  engagements: WorkerEngagementListItem[];
  transactions: EarningTransaction[];
  profile: WorkerFullProfile;
  hiddenJobIds: Set<string>;
  notificationSettings: WorkerNotificationSettings;
  applicationProfileDrafts: Map<string, CustomizeProfileBody>;
};

function initialState(): WorkerDemoState {
  const jobs = createDemoJobs(36);
  return {
    jobs,
    ownedJobs: [
      {
        jobId: "demo-worker-job-1",
        title: "Home Tutor",
        location: "Yaounde",
        jobType: "Part-time",
        salary: "45,000 XAF/month",
        status: "live",
        applicantsCount: 3,
        postedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
      {
        jobId: "demo-worker-job-2",
        title: "Volunteer Coordinator",
        location: "Douala",
        jobType: "Full Time",
        salary: "120,000 XAF/month",
        status: "pending_review",
        applicantsCount: 0,
        postedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ],
    incomingApplications: [
      {
        applicationId: "demo-incoming-1",
        applicantName: "Marie Nguema",
        applicantAvatarUrl: null,
        jobTitle: "Home Tutor",
        jobId: "demo-worker-job-1",
        status: "shortlisted",
        matchPercent: 82,
        appliedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        profileSnapshot: {
          fullName: "Marie Nguema",
          professionalTitle: "Mathematics Tutor",
          headline: "Mathematics Tutor",
          location: "Douala, Littoral",
          city: "Douala",
          region: "Littoral",
          skills: ["Algebra", "Calculus", "French"],
          professionalSummary:
            "Experienced tutor helping secondary students improve grades in mathematics and exam preparation.",
          verificationStatus: "VERIFIED",
          workHistory: [
            {
              company: "Bright Minds Academy",
              role: "Private Tutor",
              period: "2022 - Present",
              location: "Douala",
            },
          ],
        },
      },
      {
        applicationId: "demo-incoming-2",
        applicantName: "Paul Atangana",
        jobTitle: "Home Tutor",
        jobId: "demo-worker-job-1",
        status: "pending",
        matchPercent: 74,
        appliedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        profileSnapshot: {
          fullName: "Paul Atangana",
          professionalTitle: "Science & Math Tutor",
          location: "Yaoundé, Centre",
          skills: ["Physics", "Chemistry", "Exam prep"],
          verificationStatus: "VERIFIED",
        },
      },
    ],
    applications: createDemoApplications(jobs),
    engagements: createDemoEngagements(jobs),
    transactions: createDemoTransactions(),
    profile: structuredClone(DEMO_WORKER_PROFILE),
    hiddenJobIds: new Set(),
    notificationSettings: {
      pushEnabled: true,
      emailEnabled: true,
      jobsEnabled: true,
      messagesEnabled: false,
    },
    applicationProfileDrafts: new Map(),
  };
}

let state = initialState();

function visibleJobs(): WorkerJobListItem[] {
  return state.jobs.filter((j) => !state.hiddenJobIds.has(j.id));
}

export function resetWorkerDemoState(): void {
  state = initialState();
}

export async function getWorkerMe(): Promise<WorkerMe> {
  await demoDelay();
  const wp = DEMO_WORKER_ME.workerProfile;
  return {
    ...DEMO_WORKER_ME,
    workerProfile: wp
      ? {
          ...wp,
          profileCompleteness: state.profile.profileCompleteness ?? wp.profileCompleteness,
          profileViews: 28,
          profileStrengthBreakdown: state.profile.profileStrengthBreakdown,
        }
      : null,
  };
}

export async function getWorkerDashboard(): Promise<WorkerDashboard> {
  await demoDelay();
  const recommendedJobs = visibleJobs()
    .filter((j) => !state.applications.some((a) => a.jobId === j.id))
    .slice(0, 6);
  return {
    greeting: {
      name: state.profile.firstName ?? "there",
      profileSetupMessage: "Complete your profile to unlock more opportunities.",
    },
    stats: {
      activeApplications: { count: state.applications.length, trendLabel: `${state.applications.length} active` },
      shortlisted: {
        count: state.applications.filter((a) => String(a.status).toUpperCase() === "SHORTLISTED").length,
        trendLabel: "+2 this week",
      },
      profileViews: { count: 28, trendLabel: "28 total views" },
      earnings: { amount: DEMO_EARNINGS_SUMMARY.thisMonthTotal, currency: DEMO_EARNINGS_SUMMARY.currency, trendLabel: "this month" },
    },
    recommendedJobs,
    applications: state.applications.slice(0, 5),
    profileCompleteness: state.profile.profileCompleteness,
    profileStrengthBreakdown: state.profile.profileStrengthBreakdown,
  };
}

export async function getWorkerFullProfile(): Promise<WorkerFullProfile> {
  await demoDelay();
  return structuredClone(state.profile);
}

export async function getWorkerPublicProfile(workerId: string): Promise<WorkerPublicProfile> {
  await demoDelay();
  const { mobileMoneyProvider: _a, mobileMoneyNumber: _b, bankName: _c, accountNumber: _d, ...pub } =
    structuredClone(state.profile);
  void workerId;
  return pub;
}

export async function putWorkerProfile(body: PutWorkerProfileBody): Promise<WorkerFullProfile> {
  await demoDelay();
  const sanitized = sanitizePutWorkerProfileBody(body);
  const { title, ...rest } = sanitized;
  Object.assign(state.profile, rest);
  if (title !== undefined) state.profile.professionalTitle = title;
  return structuredClone(state.profile);
}

export async function patchWorkerPersonalInfo(body: PatchPersonalInfoBody): Promise<WorkerFullProfile> {
  await demoDelay();
  Object.assign(state.profile, body);
  return structuredClone(state.profile);
}

export async function patchWorkerProfessionalSummary(body: PatchProfessionalSummaryBody): Promise<WorkerFullProfile> {
  await demoDelay();
  if (body.title) state.profile.professionalTitle = body.title;
  if (body.summary) state.profile.summary = body.summary;
  if (body.industries) state.profile.industries = body.industries;
  if (body.preferredJobTypes) state.profile.preferredJobTypes = body.preferredJobTypes;
  return structuredClone(state.profile);
}

export async function patchWorkerSkills(body: PatchSkillsBody): Promise<WorkerFullProfile> {
  await demoDelay();
  state.profile.skills = body.skills;
  return structuredClone(state.profile);
}

export async function postWorkerAvatar(_file: File): Promise<WorkerFullProfile> {
  await demoDelay();
  return structuredClone(state.profile);
}

export async function postWorkerCv(file: File): Promise<{ cvUrl?: string; message?: string }> {
  await demoDelay(120);
  const cvUrl = `#${encodeURIComponent(file.name || "worker-cv.pdf")}`;
  state.profile.documents = [
    ...(state.profile.documents ?? []),
    {
      id: `doc-cv-${Date.now()}`,
      type: "CV",
      fileName: file.name || "Worker CV.pdf",
      url: cvUrl,
      createdAt: new Date().toISOString(),
    },
  ];
  return { cvUrl, message: "CV uploaded (demo)." };
}

let demoCvGeneratedAt: string | null = null;

function demoCvDownload(): WorkerCvDownload {
  return {
    blob: new Blob(["Demo Joballa generated CV"], { type: "application/pdf" }),
    fileName: "joballa-cv-demo-worker.pdf",
  };
}

export async function getWorkerCvExportStatus(): Promise<WorkerCvExportStatus> {
  await demoDelay(80);
  return {
    available: demoCvGeneratedAt != null,
    documentId: demoCvGeneratedAt ? "demo-generated-cv" : null,
    fileName: demoCvGeneratedAt ? "joballa-cv-demo-worker.pdf" : null,
    generatedAt: demoCvGeneratedAt,
    sourceProfileUpdatedAt: demoCvGeneratedAt,
    isOutdated: false,
    downloadUrl: demoCvGeneratedAt ? "/worker/profile/cv-export" : null,
  };
}

export async function getWorkerCvExport(): Promise<WorkerCvDownload> {
  await demoDelay(80);
  return demoCvDownload();
}

export async function postWorkerCvExport(): Promise<WorkerCvDownload> {
  await demoDelay(120);
  demoCvGeneratedAt = new Date().toISOString();
  return demoCvDownload();
}

export async function postWorkerWorkHistory(body: CreateWorkHistoryBody): Promise<WorkerWorkHistory> {
  await demoDelay(80);
  const b = body as CreateWorkHistoryBody & { role?: string; company?: string };
  const entry: WorkerWorkHistory = {
    id: `wh-${Date.now()}`,
    jobTitle: b.jobTitle ?? b.role,
    companyName: b.companyName ?? b.company,
    startDate: body.startDate,
    description: body.description,
  };
  state.profile.workHistories = [...(state.profile.workHistories ?? []), entry];
  return entry;
}

export async function patchWorkerWorkHistory(
  workId: string,
  body: Partial<CreateWorkHistoryBody>,
): Promise<WorkerWorkHistory> {
  await demoDelay(80);
  const list = state.profile.workHistories ?? [];
  const idx = list.findIndex((w) => w.id === workId);
  if (idx < 0) throw new Error("Work history not found");
  list[idx] = { ...list[idx], ...body };
  return list[idx]!;
}

export async function deleteWorkerWorkHistory(workId: string): Promise<void> {
  state.profile.workHistories = (state.profile.workHistories ?? []).filter((w) => w.id !== workId);
}

export async function postWorkerEducation(body: CreateEducationBody): Promise<WorkerEducation> {
  await demoDelay(80);
  const entry: WorkerEducation = { id: `edu-${Date.now()}`, ...body };
  state.profile.educations = [...(state.profile.educations ?? []), entry];
  return entry;
}

export async function patchWorkerEducation(
  educationId: string,
  body: Partial<CreateEducationBody>,
): Promise<WorkerEducation> {
  const list = state.profile.educations ?? [];
  const idx = list.findIndex((e) => e.id === educationId);
  if (idx < 0) throw new Error("Education not found");
  list[idx] = { ...list[idx], ...body };
  return list[idx]!;
}

export async function deleteWorkerEducation(educationId: string): Promise<void> {
  state.profile.educations = (state.profile.educations ?? []).filter((e) => e.id !== educationId);
}

export async function postWorkerCertification(body: CreateCertificationBody): Promise<WorkerCertification> {
  const entry: WorkerCertification = { id: `cert-${Date.now()}`, ...body };
  state.profile.certifications = [...(state.profile.certifications ?? []), entry];
  return entry;
}

export async function patchWorkerCertification(
  certId: string,
  body: Partial<CreateCertificationBody>,
): Promise<WorkerCertification> {
  const list = state.profile.certifications ?? [];
  const idx = list.findIndex((c) => c.id === certId);
  if (idx < 0) throw new Error("Certification not found");
  list[idx] = { ...list[idx], ...body };
  return list[idx]!;
}

export async function deleteWorkerCertification(certId: string): Promise<void> {
  state.profile.certifications = (state.profile.certifications ?? []).filter((c) => c.id !== certId);
}

export async function postWorkerDocument(file: File, type: string): Promise<WorkerDocument> {
  await demoDelay(80);
  const doc: WorkerDocument = {
    id: `doc-${Date.now()}`,
    type,
    fileName: file.name,
    url: "#",
    createdAt: new Date().toISOString(),
  };
  state.profile.documents = [...(state.profile.documents ?? []), doc];
  return doc;
}

export async function deleteWorkerDocument(documentId: string): Promise<void> {
  state.profile.documents = (state.profile.documents ?? []).filter((d) => d.id !== documentId);
}

export async function postWorkerKyc(body: SubmitKycBody): Promise<WorkerKycSubmission> {
  await demoDelay(100);
  const kyc: WorkerKycSubmission = {
    id: "kyc-1",
    documentType: body.documentType,
    status: "PENDING",
    frontIdImageUrl: body.frontIdImageUrl,
    backIdImageUrl: body.backIdImageUrl,
    createdAt: new Date().toISOString(),
  };
  state.profile.kycSubmissions = [kyc];
  return kyc;
}

export async function patchWorkerPaymentDetails(body: PatchPaymentDetailsBody): Promise<WorkerFullProfile> {
  await demoDelay();
  Object.assign(state.profile, body);
  return structuredClone(state.profile);
}

export async function getWorkerDocuments() {
  await demoDelay();
  return state.profile.documents ?? [];
}

export async function getWorkerKyc() {
  await demoDelay();
  return state.profile.kycSubmissions?.[0] ?? null;
}

export async function searchWorkerJobs(params?: JobSearchParams): Promise<Paginated<WorkerJobListItem>> {
  await demoDelay();
  let items = visibleJobs();
  const kw = params?.keyword?.trim().toLowerCase();
  if (kw) {
    items = items.filter(
      (j) =>
        j.title.toLowerCase().includes(kw) ||
        (j.companyName ?? "").toLowerCase().includes(kw) ||
        (j.city ?? "").toLowerCase().includes(kw),
    );
  }
  if (params?.city) items = items.filter((j) => j.city === params.city);
  if (params?.jobType) items = items.filter((j) => String(j.jobType) === params.jobType);
  const sorted = [...items];
  if (params?.sortBy === "payRate") {
    sorted.sort((a, b) => Number(b.payRate ?? 0) - Number(a.payRate ?? 0));
  } else {
    sorted.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }
  if (params?.sortOrder === "asc") sorted.reverse();
  return paginate(sorted, params);
}

export async function getWorkerJob(jobId: string): Promise<WorkerJobDetail> {
  await demoDelay();
  const job = state.jobs.find((j) => j.id === jobId);
  if (!job) throw new Error("Job not found");
  return jobToDetail(job);
}

export async function saveWorkerJob(jobId: string): Promise<JobSaveResponse> {
  await demoDelay(60);
  const job = state.jobs.find((j) => j.id === jobId);
  if (job) {
    job.isSaved = true;
    job.saved = true;
  }
  return { jobId, saved: true };
}

export async function unsaveWorkerJob(jobId: string): Promise<JobSaveResponse> {
  await demoDelay(60);
  const job = state.jobs.find((j) => j.id === jobId);
  if (job) {
    job.isSaved = false;
    job.saved = false;
  }
  return { jobId, saved: false };
}

export async function hideWorkerJob(jobId: string): Promise<unknown> {
  await demoDelay(60);
  state.hiddenJobIds.add(jobId);
  return { ok: true };
}

export async function unhideWorkerJob(jobId: string): Promise<void> {
  state.hiddenJobIds.delete(jobId);
}

export async function reportWorkerJob(_jobId: string, _body: JobReportBody): Promise<unknown> {
  await demoDelay(60);
  return { ok: true };
}

export async function getWorkerJobShareLink(jobId: string): Promise<JobShareResponse> {
  await demoDelay(40);
  return { url: `https://joballa.test/jobs/${jobId}` };
}

export async function getJobApplicationProfileDraft(jobId: string): Promise<ApplicationProfileDraft> {
  await demoDelay(40);
  const customizedData = state.applicationProfileDrafts.get(jobId) ?? null;
  return {
    applicationId: null,
    jobId,
    customizedData,
  };
}

export async function putJobApplicationProfileDraft(
  jobId: string,
  body: CustomizeProfileBody,
): Promise<ApplicationProfileDraft> {
  await demoDelay(60);
  state.applicationProfileDrafts.set(jobId, body);
  return getJobApplicationProfileDraft(jobId);
}

export async function customizeJobApplicationProfile(
  jobId: string,
  body: CustomizeProfileBody,
): Promise<ApplicationProfileDraft> {
  return putJobApplicationProfileDraft(jobId, body);
}

export async function applyToWorkerJob(jobId: string, body?: ApplyToJobBody): Promise<WorkerApplicationDetail> {
  await demoDelay(120);
  const job = state.jobs.find((j) => j.id === jobId);
  if (!job) throw new Error("Job not found");
  const app: WorkerApplicationListItem = {
    id: `demo-app-${state.applications.length + 1}`,
    status: "PENDING",
    jobId,
    job,
    jobTitle: job.title,
    companyName: job.companyName,
    appliedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  state.applications.unshift(app);
  return { ...applicationToDetail(app), jobSpecificNote: body?.jobSpecificNote ?? null };
}

export async function getWorkerApplications(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<Paginated<WorkerApplicationListItem>> {
  await demoDelay();
  const status = params?.status?.toUpperCase();
  return paginate(
    state.applications,
    params,
    status && status !== "ALL" ? (a) => String(a.status).toUpperCase() === status : undefined,
  );
}

export async function getWorkerApplication(applicationId: string): Promise<WorkerApplicationDetail> {
  await demoDelay();
  const app = state.applications.find((a) => a.id === applicationId);
  if (!app) throw new Error("Application not found");
  return applicationToDetail(app);
}

export async function archiveWorkerApplication(applicationId: string): Promise<void> {
  await demoDelay(60);
  state.applications = state.applications.filter((a) => a.id !== applicationId);
}

export async function getSavedJobs(params?: JobSearchParams): Promise<Paginated<SavedJobItem>> {
  await demoDelay();
  const saved = savedFromJobs(state.jobs);
  return paginate(saved, params);
}

export async function deleteSavedJob(jobId: string): Promise<void> {
  await unsaveWorkerJob(jobId);
}

export async function bulkDeleteSavedJobs(body: BulkUnsaveJobsBody): Promise<void> {
  await demoDelay(60);
  for (const id of body.jobIds) await unsaveWorkerJob(id);
}

export async function getEarningsSummary(): Promise<EarningsSummary> {
  await demoDelay();
  return { ...DEMO_EARNINGS_SUMMARY };
}

export async function getEarningsTransactions(
  params?: EarningsTransactionsParams,
): Promise<Paginated<EarningTransaction>> {
  await demoDelay();
  const status = params?.status?.toUpperCase();
  return paginate(
    state.transactions,
    params,
    status ? (t) => String(t.status).toUpperCase() === status : undefined,
  );
}

export async function getEarningsStatement(params: { from: string; to: string }): Promise<EarningTransaction[]> {
  await demoDelay();
  void params;
  return state.transactions.slice(0, 20);
}

export async function getWorkerEngagements(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<Paginated<WorkerEngagementListItem>> {
  await demoDelay();
  const status = params?.status?.toUpperCase();
  return paginate(
    state.engagements,
    params,
    status ? (e) => String(e.status).toUpperCase() === status : undefined,
  );
}

export async function getWorkerEngagement(engagementId: string): Promise<WorkerEngagementDetail> {
  await demoDelay();
  const eng = state.engagements.find((e) => e.id === engagementId);
  if (!eng) throw new Error("Engagement not found");
  return { ...eng, shiftLogs: [] };
}

export async function getWorkerPaymentAccounts(): Promise<WorkerPaymentAccount[]> {
  await demoDelay();
  return state.profile.paymentAccounts ?? [];
}

export async function postWorkerPaymentAccount(body: CreateWorkerPaymentAccountBody): Promise<WorkerPaymentAccount> {
  await demoDelay(60);
  const account: WorkerPaymentAccount = {
    id: `demo-pay-${Date.now()}`,
    provider: body.provider,
    phone: body.phone,
    isPrimary: body.isPrimary ?? false,
  };
  state.profile.paymentAccounts = [...(state.profile.paymentAccounts ?? []), account];
  return account;
}

export async function patchWorkerPaymentAccount(
  accountId: string,
  body: PatchWorkerPaymentAccountBody,
): Promise<WorkerPaymentAccount> {
  await demoDelay(60);
  const accounts = state.profile.paymentAccounts ?? [];
  const idx = accounts.findIndex((a) => a.id === accountId);
  if (idx < 0) throw new Error("Payment account not found");
  accounts[idx] = { ...accounts[idx]!, ...body };
  state.profile.paymentAccounts = accounts;
  return accounts[idx]!;
}

export async function deleteWorkerPaymentAccount(accountId: string): Promise<void> {
  await demoDelay(40);
  state.profile.paymentAccounts = (state.profile.paymentAccounts ?? []).filter((a) => a.id !== accountId);
}

export async function uploadVerificationDoc(_file: File): Promise<VerificationDocUploadResponse> {
  await demoDelay(120);
  return { url: "https://res.cloudinary.com/demo/image/upload/v1/kyc-doc.jpg", secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/kyc-doc.jpg" };
}

export async function createWorkerJob(body: CreateWorkerJobBody): Promise<CreateWorkerJobResponse> {
  await demoDelay(120);
  const jobId = `demo-worker-job-${state.ownedJobs.length + 1}`;
  const title = String(body.title ?? "Untitled job");
  const asDraft = Boolean(body.asDraft);
  state.ownedJobs.unshift({
    jobId,
    department: {
      id: body.departmentId ?? "other",
      name: body.departmentId ?? "Department",
      category: "other",
    },
    title,
    location: [body.neighbourhood, body.city, body.region].filter(Boolean).join(", "),
    jobType: String(body.employmentType ?? "full_time"),
    salary: `${body.payAmount} ${String(body.payCurrency ?? "XAF")}/${String(body.payStructure ?? "monthly")}`,
    status: asDraft ? "draft" : "under_review",
    applicantsCount: 0,
    postedAt: new Date().toISOString(),
  });
  return {
    jobId,
    status: asDraft ? "draft" : "under_review",
    message: asDraft ? "Job saved as draft (demo)." : "Job submitted for review (demo).",
  };
}

export async function getWorkerOwnedJobs(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<Paginated<WorkerOwnedJobListItem>> {
  await demoDelay();
  const status = params?.status;
  const list = status ? state.ownedJobs.filter((j) => j.status === status) : state.ownedJobs;
  return paginate(list, params);
}

export async function getWorkerOwnedJob(jobId: string): Promise<WorkerOwnedJobDetail> {
  await demoDelay();
  const job = state.ownedJobs.find((j) => j.jobId === jobId);
  if (!job) throw new Error("Job not found");
  return { ...job, description: "Demo worker-owned job." };
}

export async function patchWorkerOwnedJob(jobId: string, body: UpdateWorkerJobBody): Promise<WorkerOwnedJobDetail> {
  await demoDelay(80);
  const job = state.ownedJobs.find((j) => j.jobId === jobId);
  if (!job) throw new Error("Job not found");
  if (typeof body.title === "string") job.title = body.title;
  return getWorkerOwnedJob(jobId);
}

export async function patchWorkerOwnedJobStatus(jobId: string, status: string): Promise<WorkerOwnedJobDetail> {
  await demoDelay(60);
  const job = state.ownedJobs.find((j) => j.jobId === jobId);
  if (!job) throw new Error("Job not found");
  job.status = status;
  return getWorkerOwnedJob(jobId);
}

export async function publishWorkerPostedJob(
  jobId: string,
  body?: UpdateWorkerJobBody,
): Promise<CreateWorkerJobResponse> {
  await demoDelay(120);
  if (body && Object.keys(body).length > 0) {
    await patchWorkerOwnedJob(jobId, body);
  }
  const job = state.ownedJobs.find((j) => j.jobId === jobId);
  if (!job) throw new Error("Job not found");
  job.status = "under_review";
  return {
    jobId,
    status: "under_review",
    message: "Job submitted for review. Joballa admin will review before it goes live.",
  };
}

export async function deleteWorkerOwnedJob(jobId: string): Promise<void> {
  await demoDelay(60);
  state.ownedJobs = state.ownedJobs.filter((j) => j.jobId !== jobId);
}

export async function getWorkerIncomingApplications(params?: {
  status?: string;
  keyword?: string;
  jobId?: string;
  page?: number;
  limit?: number;
}): Promise<Paginated<WorkerIncomingApplicationListItem>> {
  await demoDelay();
  let list = [...state.incomingApplications];
  if (params?.status) list = list.filter((a) => String(a.status).toLowerCase() === params.status?.toLowerCase());
  if (params?.jobId) list = list.filter((a) => a.jobId === params.jobId);
  if (params?.keyword) {
    const q = params.keyword.toLowerCase();
    list = list.filter((a) => String(a.applicantName ?? "").toLowerCase().includes(q));
  }
  return paginate(list, params);
}

export async function getWorkerIncomingApplication(applicationId: string): Promise<WorkerIncomingApplicationDetail> {
  await demoDelay();
  const app = state.incomingApplications.find((a) => (a.applicationId ?? a.id) === applicationId);
  if (!app) throw new Error("Application not found");
  return {
    ...app,
    profileSnapshot:
      app.profileSnapshot && typeof app.profileSnapshot === "object"
        ? (app.profileSnapshot as Record<string, unknown>)
        : {},
  };
}

export async function getEarningsTransaction(transactionId: string): Promise<EarningTransaction> {
  await demoDelay();
  const tx = state.transactions.find((t) => t.id === transactionId);
  if (!tx) throw new Error("Transaction not found");
  return tx;
}

export async function getWorkerNotifications(params?: {
  filter?: string;
  page?: number;
  limit?: number;
}): Promise<Paginated<WorkerNotificationItem>> {
  await demoDelay();
  const filter = params?.filter ?? "all";
  const items = WORKER_NOTIFICATIONS.filter((n) => filter === "all" || n.filter === filter).map((n) => ({
    id: n.id,
    type: n.kind,
    title: n.actor ?? "Joballa",
    body: n.text,
    read: n.read,
    createdAt: new Date().toISOString(),
    deepLink: n.href ?? null,
  }));
  return paginate(items, params);
}

export async function getWorkerNotificationsUnreadCount(): Promise<WorkerNotificationUnreadCount> {
  await demoDelay(40);
  const count = WORKER_NOTIFICATIONS.filter((n) => !n.read).length;
  return { count };
}

export async function patchWorkerNotificationsReadAll(): Promise<{ ok: boolean }> {
  await demoDelay(40);
  for (const n of WORKER_NOTIFICATIONS) n.read = true;
  return { ok: true };
}

export async function patchWorkerNotificationRead(notificationId: string): Promise<WorkerNotificationItem> {
  await demoDelay(40);
  const n = WORKER_NOTIFICATIONS.find((x) => x.id === notificationId);
  if (!n) throw new Error("Notification not found");
  n.read = true;
  return {
    id: n.id,
    type: n.kind,
    title: n.actor ?? "Joballa",
    body: n.text,
    read: true,
    deepLink: n.href ?? null,
  };
}

export async function getWorkerNotificationSettings(): Promise<WorkerNotificationSettings> {
  await demoDelay(40);
  return { ...state.notificationSettings };
}

export async function patchWorkerNotificationSettings(
  body: WorkerNotificationSettings,
): Promise<WorkerNotificationSettings> {
  await demoDelay(40);
  state.notificationSettings = { ...state.notificationSettings, ...body };
  return { ...state.notificationSettings };
}
