import type { EarningsTransactionsParams, JobSearchParams } from "@/features/worker/types/worker-portal";

const root = ["worker-portal"] as const;

export const workerKeys = {
  all: root,
  me: () => [...root, "me"] as const,
  dashboard: () => [...root, "dashboard"] as const,
  profile: () => [...root, "profile"] as const,
  profilePublic: (workerId: string) => [...root, "profile", "public", workerId] as const,
  documents: () => [...root, "profile", "documents"] as const,
  kyc: () => [...root, "profile", "kyc"] as const,
  jobs: (params?: JobSearchParams) => [...root, "jobs", params ?? {}] as const,
  job: (jobId: string) => [...root, "jobs", jobId] as const,
  jobShare: (jobId: string) => [...root, "jobs", jobId, "share"] as const,
  applications: (params?: { status?: string; page?: number; limit?: number }) =>
    [...root, "applications", params ?? {}] as const,
  application: (applicationId: string) => [...root, "applications", applicationId] as const,
  savedJobs: (params?: JobSearchParams) => [...root, "saved-jobs", params ?? {}] as const,
  earningsSummary: () => [...root, "earnings", "summary"] as const,
  earningsTransactions: (params?: EarningsTransactionsParams) =>
    [...root, "earnings", "transactions", params ?? {}] as const,
  earningsTransaction: (transactionId: string) => [...root, "earnings", "transactions", transactionId] as const,
  earningsStatement: (params: { from: string; to: string }) =>
    [...root, "earnings", "statement", params] as const,
  engagements: (params?: { page?: number; limit?: number; status?: string }) =>
    [...root, "engagements", params ?? {}] as const,
  engagement: (engagementId: string) => [...root, "engagements", engagementId] as const,
  ownedJobs: (params?: { status?: string; page?: number; limit?: number }) =>
    [...root, "owned-jobs", params ?? {}] as const,
  ownedJob: (jobId: string) => [...root, "owned-jobs", jobId] as const,
  incomingApplications: (params?: Record<string, unknown>) =>
    [...root, "incoming-applications", params ?? {}] as const,
  incomingApplication: (applicationId: string) => [...root, "incoming-applications", applicationId] as const,
  paymentAccounts: () => [...root, "profile", "payment-accounts"] as const,
  notifications: (params?: { filter?: string; page?: number; limit?: number }) =>
    [...root, "notifications", params ?? {}] as const,
  notificationSettings: () => [...root, "settings", "notifications"] as const,
};
