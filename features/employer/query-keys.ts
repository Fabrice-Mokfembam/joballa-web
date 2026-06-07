import type { EmployerApplicantStatus } from "@/features/employer/types/employer-portal";

const root = ["employer-portal"] as const;

export const employerKeys = {
  all: root,
  me: () => [...root, "me"] as const,
  dashboard: () => [...root, "dashboard"] as const,
  jobs: (params?: { status?: string; page?: number; limit?: number }) =>
    [...root, "jobs", params ?? {}] as const,
  job: (jobId: string) => [...root, "jobs", jobId] as const,
  applicantFilters: () => [...root, "applicants", "filters"] as const,
  applicants: (params?: Record<string, unknown>) => [...root, "applicants", params ?? {}] as const,
  applicant: (applicationId: string) => [...root, "applicants", applicationId] as const,
  applicantShare: (applicationId: string) => [...root, "applicants", applicationId, "share"] as const,
  workforce: (params?: { status?: string; page?: number; limit?: number }) =>
    [...root, "workforce", params ?? {}] as const,
  workforceWorker: (workerId: string) => [...root, "workforce", workerId] as const,
  payments: (params?: { month?: number; year?: number }) => [...root, "payments", params ?? {}] as const,
  paymentWorkers: (params?: { month?: number; year?: number }) =>
    [...root, "payments", "workers", params ?? {}] as const,
  paymentHistory: (params?: Record<string, unknown>) => [...root, "payments", "history", params ?? {}] as const,
  payment: (paymentId: string) => [...root, "payments", paymentId] as const,
  paymentStatement: (params: { from: string; to: string }) =>
    [...root, "payments", "statement", params] as const,
  company: () => [...root, "company"] as const,
  departments: (params?: { isActive?: boolean; category?: string }) =>
    [...root, "departments", params ?? {}] as const,
  notifications: (params?: { filter?: string; page?: number; limit?: number }) =>
    [...root, "notifications", params ?? {}] as const,
  notificationSettings: () => [...root, "settings", "notifications"] as const,
};

export type ApplicantsListParams = {
  search?: string;
  jobId?: string;
  status?: EmployerApplicantStatus | "";
  sort?: string;
  page?: number;
  limit?: number;
  view?: "list" | "grid";
};
