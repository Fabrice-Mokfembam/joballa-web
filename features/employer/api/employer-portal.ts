/**
 * Employer portal API — live backend or in-memory demo fixtures (`NEXT_PUBLIC_USE_DEMO_DATA`).
 */
import * as demo from "@/lib/demo-data/employer-demo-api";
import { withDemo } from "@/lib/demo-data/with-demo";
import * as live from "@/features/employer/api/employer-portal.live";

export const getEmployerMe = () => withDemo(() => live.getEmployerMe(), () => demo.getEmployerMe());
export const getEmployerDashboard = () =>
  withDemo(() => live.getEmployerDashboard(), () => demo.getEmployerDashboard());
export const createEmployerJob = (body: Parameters<typeof live.createEmployerJob>[0]) =>
  withDemo(() => live.createEmployerJob(body), () => demo.createEmployerJob(body));
export const getEmployerJobs = (params?: Parameters<typeof live.getEmployerJobs>[0]) =>
  withDemo(() => live.getEmployerJobs(params), () => demo.getEmployerJobs(params));
export const getEmployerJob = (jobId: string) =>
  withDemo(() => live.getEmployerJob(jobId), () => demo.getEmployerJob(jobId));
export const patchEmployerJob = (jobId: string, body: Parameters<typeof live.patchEmployerJob>[1]) =>
  withDemo(() => live.patchEmployerJob(jobId, body), () => demo.patchEmployerJob(jobId, body));
export const patchEmployerJobStatus = (jobId: string, status: string) =>
  withDemo(() => live.patchEmployerJobStatus(jobId, status), () => demo.patchEmployerJobStatus(jobId, status));
export const saveEmployerJobDraft = (jobId: string, body: Parameters<typeof live.saveEmployerJobDraft>[1]) =>
  withDemo(() => live.saveEmployerJobDraft(jobId, body), () => demo.saveEmployerJobDraft(jobId, body));
export const deleteEmployerJob = (jobId: string) =>
  withDemo(() => live.deleteEmployerJob(jobId), () => demo.deleteEmployerJob(jobId));
export const getEmployerApplicantFilters = () =>
  withDemo(() => live.getEmployerApplicantFilters(), () => demo.getEmployerApplicantFilters());
export const getEmployerApplicants = (params?: Parameters<typeof live.getEmployerApplicants>[0]) =>
  withDemo(() => live.getEmployerApplicants(params), () => demo.getEmployerApplicants(params));
export const getEmployerApplicant = (applicationId: string) =>
  withDemo(() => live.getEmployerApplicant(applicationId), () => demo.getEmployerApplicant(applicationId));
export const patchEmployerApplicantStatus = (
  applicationId: string,
  status: Parameters<typeof live.patchEmployerApplicantStatus>[1],
) =>
  withDemo(
    () => live.patchEmployerApplicantStatus(applicationId, status),
    () => demo.patchEmployerApplicantStatus(applicationId, status),
  );
export const patchEmployerApplicantNotes = (
  applicationId: string,
  body: Parameters<typeof live.patchEmployerApplicantNotes>[1],
) =>
  withDemo(
    () => live.patchEmployerApplicantNotes(applicationId, body),
    () => demo.patchEmployerApplicantNotes(applicationId, body),
  );
export const getEmployerApplicantShare = (applicationId: string) =>
  withDemo(() => live.getEmployerApplicantShare(applicationId), () => demo.getEmployerApplicantShare(applicationId));
export const getEmployerWorkforce = (params?: Parameters<typeof live.getEmployerWorkforce>[0]) =>
  withDemo(() => live.getEmployerWorkforce(params), () => demo.getEmployerWorkforce(params));
export const getEmployerWorkforceWorker = (workerId: string) =>
  withDemo(() => live.getEmployerWorkforceWorker(workerId), () => demo.getEmployerWorkforceWorker(workerId));
export const patchEmployerWorkforceStatus = (
  workerId: string,
  body: Parameters<typeof live.patchEmployerWorkforceStatus>[1],
) =>
  withDemo(() => live.patchEmployerWorkforceStatus(workerId, body), () => demo.patchEmployerWorkforceStatus(workerId, body));
export const getEmployerPaymentsSummary = (params?: Parameters<typeof live.getEmployerPaymentsSummary>[0]) =>
  withDemo(() => live.getEmployerPaymentsSummary(params), () => demo.getEmployerPaymentsSummary(params));
export const getEmployerPaymentWorkers = (params?: Parameters<typeof live.getEmployerPaymentWorkers>[0]) =>
  withDemo(() => live.getEmployerPaymentWorkers(params), () => demo.getEmployerPaymentWorkers(params));
export const payEmployerWorker = (body: Parameters<typeof live.payEmployerWorker>[0]) =>
  withDemo(() => live.payEmployerWorker(body), () => demo.payEmployerWorker(body));
export const getEmployerPaymentHistory = (params?: Parameters<typeof live.getEmployerPaymentHistory>[0]) =>
  withDemo(() => live.getEmployerPaymentHistory(params), () => demo.getEmployerPaymentHistory(params));
export const getEmployerPayment = (paymentId: string) =>
  withDemo(() => live.getEmployerPayment(paymentId), () => demo.getEmployerPayment(paymentId));
export const getEmployerPaymentStatement = (params: Parameters<typeof live.getEmployerPaymentStatement>[0]) =>
  withDemo(() => live.getEmployerPaymentStatement(params), () => demo.getEmployerPaymentStatement(params));
export const getEmployerCompany = () => withDemo(() => live.getEmployerCompany(), () => demo.getEmployerCompany());
export const patchEmployerCompany = (body: Parameters<typeof live.patchEmployerCompany>[0]) =>
  withDemo(() => live.patchEmployerCompany(body), () => demo.patchEmployerCompany(body));
export const uploadEmployerCompanyLogo = (file: File) =>
  withDemo(() => live.uploadEmployerCompanyLogo(file), () => demo.uploadEmployerCompanyLogo(file));
export const uploadEmployerCompanyDocument = (file: File, documentName?: string) =>
  withDemo(
    () => live.uploadEmployerCompanyDocument(file, documentName),
    () => demo.uploadEmployerCompanyDocument(file, documentName),
  );
export const deleteEmployerCompanyDocument = (documentId: string) =>
  withDemo(() => live.deleteEmployerCompanyDocument(documentId), () => demo.deleteEmployerCompanyDocument(documentId));
export const getEmployerNotifications = (params?: Parameters<typeof live.getEmployerNotifications>[0]) =>
  withDemo(() => live.getEmployerNotifications(params), () => demo.getEmployerNotifications(params));
export const getEmployerNotificationSettings = () =>
  withDemo(() => live.getEmployerNotificationSettings(), () => demo.getEmployerNotificationSettings());
export const patchEmployerNotificationRead = (notificationId: string) =>
  withDemo(
    () => live.patchEmployerNotificationRead(notificationId),
    () => demo.patchEmployerNotificationRead(notificationId),
  );
export const patchEmployerNotificationSettings = (body: Parameters<typeof live.patchEmployerNotificationSettings>[0]) =>
  withDemo(
    () => live.patchEmployerNotificationSettings(body),
    () => demo.patchEmployerNotificationSettings(body),
  );
export const getEmployerInformalRequests = (params?: Parameters<typeof live.getEmployerInformalRequests>[0]) =>
  withDemo(() => live.getEmployerInformalRequests(params), () => demo.getEmployerInformalRequests(params));
export const createEmployerInformalRequest = (body: Parameters<typeof live.createEmployerInformalRequest>[0]) =>
  withDemo(() => live.createEmployerInformalRequest(body), () => demo.createEmployerInformalRequest(body));
