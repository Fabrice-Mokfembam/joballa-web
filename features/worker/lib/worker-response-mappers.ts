import { normalizeWorkerJobListItem } from "@/features/worker/lib/normalize-worker-job";
import type {
  EarningTransaction,
  EarningsSummary,
  WorkerApplicationDetail,
  WorkerApplicationListItem,
  WorkerEngagementDetail,
  WorkerEngagementListItem,
  WorkerIncomingApplicationDetail,
  WorkerIncomingApplicationListItem,
  WorkerNotificationItem,
} from "@/features/worker/types/worker-portal";

type ApiRecord = Record<string, unknown>;

function record(value: unknown): ApiRecord {
  return value && typeof value === "object" ? (value as ApiRecord) : {};
}

function optionalString(value: unknown): string | undefined {
  return value == null ? undefined : String(value);
}

export function normalizeWorkerApplication(raw: unknown): WorkerApplicationListItem {
  const data = record(raw);
  const job = data.job && typeof data.job === "object"
    ? normalizeWorkerJobListItem(data.job as Parameters<typeof normalizeWorkerJobListItem>[0])
    : undefined;
  return {
    ...data,
    id: String(data.id ?? data.applicationId ?? ""),
    status: String(data.status ?? "submitted"),
    jobId: optionalString(data.jobId ?? job?.id),
    job,
    jobTitle: optionalString(data.jobTitle ?? job?.title),
    companyName: optionalString(data.companyName ?? job?.companyName),
    appliedAt: optionalString(data.appliedAt ?? data.submittedAt ?? data.createdAt),
    createdAt: optionalString(data.createdAt ?? data.submittedAt),
  };
}

export function normalizeWorkerApplicationDetail(raw: unknown): WorkerApplicationDetail {
  return normalizeWorkerApplication(raw) as WorkerApplicationDetail;
}

export function normalizeWorkerIncomingApplication(raw: unknown): WorkerIncomingApplicationListItem {
  const data = record(raw);
  return {
    ...data,
    applicationId: optionalString(data.applicationId ?? data.id),
    id: optionalString(data.id ?? data.applicationId),
    applicantName: optionalString(data.applicantName ?? data.workerName),
    applicantAvatarUrl:
      data.applicantAvatarUrl == null ? null : String(data.applicantAvatarUrl),
    workerId: optionalString(data.workerId),
    jobTitle: optionalString(data.jobTitle),
    jobId: optionalString(data.jobId),
    status: optionalString(data.status),
    matchPercent: typeof data.matchPercent === "number" ? data.matchPercent : undefined,
    appliedAt: optionalString(data.appliedAt ?? data.createdAt),
  };
}

export function normalizeWorkerIncomingApplicationDetail(raw: unknown): WorkerIncomingApplicationDetail {
  return normalizeWorkerIncomingApplication(raw) as WorkerIncomingApplicationDetail;
}

export function normalizeWorkerEngagement(raw: unknown): WorkerEngagementListItem {
  const data = record(raw);
  const employerName = String(data.payerName ?? data.employerName ?? "");
  const job =
    data.job && typeof data.job === "object"
      ? normalizeWorkerJobListItem(data.job as Parameters<typeof normalizeWorkerJobListItem>[0])
      : data.jobId || data.jobTitle
        ? normalizeWorkerJobListItem({
            id: String(data.jobId ?? ""),
            title: String(data.jobTitle ?? ""),
            ownerName: employerName,
            payRate: data.payRate as number | string | null | undefined,
            currency: optionalString(data.payCurrency),
            payStructure: optionalString(data.payStructure),
          })
        : undefined;
  const rawEmployer = record(data.employer);
  const employer =
    Object.keys(rawEmployer).length > 0 || employerName
      ? {
          ...rawEmployer,
          companyName: String(rawEmployer.companyName ?? employerName),
          name: String(rawEmployer.name ?? employerName),
        }
      : undefined;
  return {
    ...data,
    id: String(data.id ?? data.engagementId ?? ""),
    engagementId: optionalString(data.engagementId ?? data.id),
    status: String(data.status ?? ""),
    startedAt: optionalString(data.startedAt ?? data.startDate),
    job,
    employer,
  };
}

export function normalizeWorkerEngagementDetail(raw: unknown): WorkerEngagementDetail {
  const data = record(raw);
  return {
    ...normalizeWorkerEngagement(data),
    payments: Array.isArray(data.payments) ? data.payments.map(normalizeEarningTransaction) : [],
  } as WorkerEngagementDetail;
}

export function normalizeEarningTransaction(raw: unknown): EarningTransaction {
  const data = record(raw);
  return {
    ...data,
    id: String(data.id ?? data.transactionId ?? ""),
    amount: (data.amount ?? data.total) as number | string | undefined,
    currency: String(data.currency ?? "XAF"),
    status: String(data.status ?? "pending"),
    initiatedAt: optionalString(data.initiatedAt ?? data.createdAt),
    completedAt: data.completedAt == null ? null : String(data.completedAt),
    engagementId: data.engagementId == null ? null : String(data.engagementId),
    employerName: optionalString(data.employerName ?? data.payerName),
    jobTitle: optionalString(data.jobTitle),
  };
}

export function normalizeEarningsSummary(raw: unknown): EarningsSummary {
  const data = record(raw);
  return {
    totalEarned: Number(data.totalEarned ?? data.total ?? data.completed ?? 0) || 0,
    totalPayments: Number(data.totalPayments ?? data.paymentCount ?? 0) || 0,
    pendingAmount: Number(data.pendingAmount ?? data.pending ?? 0) || 0,
    thisMonthTotal: Number(data.thisMonthTotal ?? data.monthTotal ?? 0) || 0,
    currency: String(data.currency ?? "XAF"),
  };
}

export function normalizeWorkerNotification(raw: unknown): WorkerNotificationItem {
  const data = record(raw);
  return {
    ...data,
    id: String(data.id ?? ""),
    type: optionalString(data.type),
    title: optionalString(data.title),
    body: optionalString(data.body),
    read: typeof data.read === "boolean" ? data.read : Boolean(data.isRead),
    createdAt: optionalString(data.createdAt),
    deepLink: data.deepLink == null ? null : String(data.deepLink),
  };
}
