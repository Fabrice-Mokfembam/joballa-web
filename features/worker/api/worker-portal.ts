/**
 * Worker portal API — live backend or in-memory demo fixtures (`NEXT_PUBLIC_USE_DEMO_DATA`).
 */
import * as demo from "@/lib/demo-data/worker-demo-api";
import { withDemo } from "@/lib/demo-data/with-demo";
import * as live from "@/features/worker/api/worker-portal.live";

export const getWorkerMe = () => withDemo(() => live.getWorkerMe(), () => demo.getWorkerMe());
export const getWorkerDashboard = () => withDemo(() => live.getWorkerDashboard(), () => demo.getWorkerDashboard());
export const getWorkerFullProfile = () => withDemo(() => live.getWorkerFullProfile(), () => demo.getWorkerFullProfile());
export const getWorkerPublicProfile = (workerId: string) =>
  withDemo(() => live.getWorkerPublicProfile(workerId), () => demo.getWorkerPublicProfile(workerId));
export const putWorkerProfile = (body: Parameters<typeof live.putWorkerProfile>[0]) =>
  withDemo(() => live.putWorkerProfile(body), () => demo.putWorkerProfile(body));
export const patchWorkerPersonalInfo = (body: Parameters<typeof live.patchWorkerPersonalInfo>[0]) =>
  withDemo(() => live.patchWorkerPersonalInfo(body), () => demo.patchWorkerPersonalInfo(body));
export const patchWorkerProfessionalSummary = (body: Parameters<typeof live.patchWorkerProfessionalSummary>[0]) =>
  withDemo(() => live.patchWorkerProfessionalSummary(body), () => demo.patchWorkerProfessionalSummary(body));
export const patchWorkerSkills = (body: Parameters<typeof live.patchWorkerSkills>[0]) =>
  withDemo(() => live.patchWorkerSkills(body), () => demo.patchWorkerSkills(body));
export const postWorkerAvatar = (file: File) => withDemo(() => live.postWorkerAvatar(file), () => demo.postWorkerAvatar(file));
export const postWorkerCv = (file: File) => withDemo(() => live.postWorkerCv(file), () => demo.postWorkerCv(file));
export const getWorkerCvExportStatus = () =>
  withDemo(() => live.getWorkerCvExportStatus(), () => demo.getWorkerCvExportStatus());
export const getWorkerCvExport = () => withDemo(() => live.getWorkerCvExport(), () => demo.getWorkerCvExport());
export const postWorkerCvExport = () => withDemo(() => live.postWorkerCvExport(), () => demo.postWorkerCvExport());
export const postWorkerWorkHistory = (body: Parameters<typeof live.postWorkerWorkHistory>[0]) =>
  withDemo(() => live.postWorkerWorkHistory(body), () => demo.postWorkerWorkHistory(body));
export const patchWorkerWorkHistory = (
  workId: string,
  body: Parameters<typeof live.patchWorkerWorkHistory>[1],
) => withDemo(() => live.patchWorkerWorkHistory(workId, body), () => demo.patchWorkerWorkHistory(workId, body));
export const deleteWorkerWorkHistory = (workId: string) =>
  withDemo(() => live.deleteWorkerWorkHistory(workId), () => demo.deleteWorkerWorkHistory(workId));
export const postWorkerEducation = (body: Parameters<typeof live.postWorkerEducation>[0]) =>
  withDemo(() => live.postWorkerEducation(body), () => demo.postWorkerEducation(body));
export const patchWorkerEducation = (
  educationId: string,
  body: Parameters<typeof live.patchWorkerEducation>[1],
) => withDemo(() => live.patchWorkerEducation(educationId, body), () => demo.patchWorkerEducation(educationId, body));
export const deleteWorkerEducation = (educationId: string) =>
  withDemo(() => live.deleteWorkerEducation(educationId), () => demo.deleteWorkerEducation(educationId));
export const postWorkerCertification = (body: Parameters<typeof live.postWorkerCertification>[0]) =>
  withDemo(() => live.postWorkerCertification(body), () => demo.postWorkerCertification(body));
export const patchWorkerCertification = (
  certId: string,
  body: Parameters<typeof live.patchWorkerCertification>[1],
) => withDemo(() => live.patchWorkerCertification(certId, body), () => demo.patchWorkerCertification(certId, body));
export const deleteWorkerCertification = (certId: string) =>
  withDemo(() => live.deleteWorkerCertification(certId), () => demo.deleteWorkerCertification(certId));
export const postWorkerDocument = (file: File, type: string) =>
  withDemo(() => live.postWorkerDocument(file, type), () => demo.postWorkerDocument(file, type));
export const getWorkerDocuments = () => withDemo(() => live.getWorkerDocuments(), () => demo.getWorkerDocuments());
export const deleteWorkerDocument = (documentId: string) =>
  withDemo(() => live.deleteWorkerDocument(documentId), () => demo.deleteWorkerDocument(documentId));
export const postWorkerKyc = (body: Parameters<typeof live.postWorkerKyc>[0]) =>
  withDemo(() => live.postWorkerKyc(body), () => demo.postWorkerKyc(body));
export const getWorkerKyc = () => withDemo(() => live.getWorkerKyc(), () => demo.getWorkerKyc());
export const patchWorkerPaymentDetails = (body: Parameters<typeof live.patchWorkerPaymentDetails>[0]) =>
  withDemo(() => live.patchWorkerPaymentDetails(body), () => demo.patchWorkerPaymentDetails(body));
export const getWorkerPaymentAccounts = () =>
  withDemo(() => live.getWorkerPaymentAccounts(), () => demo.getWorkerPaymentAccounts());
export const postWorkerPaymentAccount = (body: Parameters<typeof live.postWorkerPaymentAccount>[0]) =>
  withDemo(() => live.postWorkerPaymentAccount(body), () => demo.postWorkerPaymentAccount(body));
export const patchWorkerPaymentAccount = (
  accountId: string,
  body: Parameters<typeof live.patchWorkerPaymentAccount>[1],
) => withDemo(() => live.patchWorkerPaymentAccount(accountId, body), () => demo.patchWorkerPaymentAccount(accountId, body));
export const deleteWorkerPaymentAccount = (accountId: string) =>
  withDemo(() => live.deleteWorkerPaymentAccount(accountId), () => demo.deleteWorkerPaymentAccount(accountId));
export const uploadVerificationDoc = (file: File) =>
  withDemo(() => live.uploadVerificationDoc(file), () => demo.uploadVerificationDoc(file));
export const createWorkerJob = (body: Parameters<typeof live.createWorkerJob>[0]) =>
  withDemo(() => live.createWorkerJob(body), () => demo.createWorkerJob(body));
export const getWorkerOwnedJobs = (params?: Parameters<typeof live.getWorkerOwnedJobs>[0]) =>
  withDemo(() => live.getWorkerOwnedJobs(params), () => demo.getWorkerOwnedJobs(params));
export const getWorkerOwnedJob = (jobId: string) =>
  withDemo(() => live.getWorkerOwnedJob(jobId), () => demo.getWorkerOwnedJob(jobId));
export const patchWorkerOwnedJob = (jobId: string, body: Parameters<typeof live.patchWorkerOwnedJob>[1]) =>
  withDemo(() => live.patchWorkerOwnedJob(jobId, body), () => demo.patchWorkerOwnedJob(jobId, body));
export const patchWorkerOwnedJobStatus = (jobId: string, status: string) =>
  withDemo(() => live.patchWorkerOwnedJobStatus(jobId, status), () => demo.patchWorkerOwnedJobStatus(jobId, status));
export const deleteWorkerOwnedJob = (jobId: string) =>
  withDemo(() => live.deleteWorkerOwnedJob(jobId), () => demo.deleteWorkerOwnedJob(jobId));
export const getWorkerIncomingApplications = (params?: Parameters<typeof live.getWorkerIncomingApplications>[0]) =>
  withDemo(() => live.getWorkerIncomingApplications(params), () => demo.getWorkerIncomingApplications(params));
export const getWorkerIncomingApplication = (applicationId: string) =>
  withDemo(
    () => live.getWorkerIncomingApplication(applicationId),
    () => demo.getWorkerIncomingApplication(applicationId),
  );
export const searchWorkerJobs = (params?: Parameters<typeof live.searchWorkerJobs>[0]) =>
  withDemo(() => live.searchWorkerJobs(params), () => demo.searchWorkerJobs(params));
export const getWorkerJob = (jobId: string) => withDemo(() => live.getWorkerJob(jobId), () => demo.getWorkerJob(jobId));
export const saveWorkerJob = (jobId: string) => withDemo(() => live.saveWorkerJob(jobId), () => demo.saveWorkerJob(jobId));
export const unsaveWorkerJob = (jobId: string) =>
  withDemo(() => live.unsaveWorkerJob(jobId), () => demo.unsaveWorkerJob(jobId));
export const hideWorkerJob = (jobId: string) => withDemo(() => live.hideWorkerJob(jobId), () => demo.hideWorkerJob(jobId));
export const unhideWorkerJob = (jobId: string) =>
  withDemo(() => live.unhideWorkerJob(jobId), () => demo.unhideWorkerJob(jobId));
export const reportWorkerJob = (jobId: string, body: Parameters<typeof live.reportWorkerJob>[1]) =>
  withDemo(() => live.reportWorkerJob(jobId, body), () => demo.reportWorkerJob(jobId, body));
export const getWorkerJobShareLink = (jobId: string) =>
  withDemo(() => live.getWorkerJobShareLink(jobId), () => demo.getWorkerJobShareLink(jobId));
export const customizeJobApplicationProfile = (
  jobId: string,
  body: Parameters<typeof live.customizeJobApplicationProfile>[1],
) =>
  withDemo(
    () => live.customizeJobApplicationProfile(jobId, body),
    () => demo.customizeJobApplicationProfile(jobId, body),
  );
export const applyToWorkerJob = (jobId: string, body?: Parameters<typeof live.applyToWorkerJob>[1]) =>
  withDemo(() => live.applyToWorkerJob(jobId, body), () => demo.applyToWorkerJob(jobId, body));
export const getWorkerApplications = (params?: Parameters<typeof live.getWorkerApplications>[0]) =>
  withDemo(() => live.getWorkerApplications(params), () => demo.getWorkerApplications(params));
export const getWorkerApplication = (applicationId: string) =>
  withDemo(() => live.getWorkerApplication(applicationId), () => demo.getWorkerApplication(applicationId));
export const archiveWorkerApplication = (applicationId: string) =>
  withDemo(() => live.archiveWorkerApplication(applicationId), () => demo.archiveWorkerApplication(applicationId));
export const getSavedJobs = (params?: Parameters<typeof live.getSavedJobs>[0]) =>
  withDemo(() => live.getSavedJobs(params), () => demo.getSavedJobs(params));
export const deleteSavedJob = (jobId: string) =>
  withDemo(() => live.deleteSavedJob(jobId), () => demo.deleteSavedJob(jobId));
export const bulkDeleteSavedJobs = (body: Parameters<typeof live.bulkDeleteSavedJobs>[0]) =>
  withDemo(() => live.bulkDeleteSavedJobs(body), () => demo.bulkDeleteSavedJobs(body));
export const getEarningsSummary = () => withDemo(() => live.getEarningsSummary(), () => demo.getEarningsSummary());
export const getEarningsTransactions = (params?: Parameters<typeof live.getEarningsTransactions>[0]) =>
  withDemo(() => live.getEarningsTransactions(params), () => demo.getEarningsTransactions(params));
export const getEarningsTransaction = (transactionId: string) =>
  withDemo(() => live.getEarningsTransaction(transactionId), () => demo.getEarningsTransaction(transactionId));
export const getEarningsStatement = (params: Parameters<typeof live.getEarningsStatement>[0]) =>
  withDemo(() => live.getEarningsStatement(params), () => demo.getEarningsStatement(params));
export const getWorkerEngagements = (params?: Parameters<typeof live.getWorkerEngagements>[0]) =>
  withDemo(() => live.getWorkerEngagements(params), () => demo.getWorkerEngagements(params));
export const getWorkerEngagement = (engagementId: string) =>
  withDemo(() => live.getWorkerEngagement(engagementId), () => demo.getWorkerEngagement(engagementId));
export const getWorkerNotifications = (params?: Parameters<typeof live.getWorkerNotifications>[0]) =>
  withDemo(() => live.getWorkerNotifications(params), () => demo.getWorkerNotifications(params));
export const getWorkerNotificationSettings = () =>
  withDemo(() => live.getWorkerNotificationSettings(), () => demo.getWorkerNotificationSettings());
export const patchWorkerNotificationRead = (notificationId: string) =>
  withDemo(
    () => live.patchWorkerNotificationRead(notificationId),
    () => demo.patchWorkerNotificationRead(notificationId),
  );
export const patchWorkerNotificationSettings = (body: Parameters<typeof live.patchWorkerNotificationSettings>[0]) =>
  withDemo(
    () => live.patchWorkerNotificationSettings(body),
    () => demo.patchWorkerNotificationSettings(body),
  );
