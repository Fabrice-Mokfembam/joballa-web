import { create } from "zustand";
import type { ApplicantsListParams } from "@/features/employer/query-keys";

const now = new Date();

const defaultApplicants: ApplicantsListParams = {
  search: "",
  jobId: "",
  status: "",
  sort: "recent",
  page: 1,
  limit: 12,
  view: "list",
};

type EmployerPortalStore = {
  applicants: ApplicantsListParams;
  jobsStatus: string;
  jobsPage: number;
  workforceStatus: "all" | "active" | "terminated";
  workforcePage: number;
  paymentsMonth: number;
  paymentsYear: number;
  paymentHistorySearch: string;
  paymentHistoryPage: number;
  setApplicants: (partial: Partial<ApplicantsListParams>) => void;
  resetApplicants: () => void;
  setJobsStatus: (status: string) => void;
  setJobsPage: (page: number) => void;
  setWorkforceStatus: (status: "all" | "active" | "terminated") => void;
  setWorkforcePage: (page: number) => void;
  setPaymentsPeriod: (month: number, year: number) => void;
  setPaymentHistorySearch: (search: string) => void;
  setPaymentHistoryPage: (page: number) => void;
};

export const useEmployerPortalStore = create<EmployerPortalStore>((set) => ({
  applicants: defaultApplicants,
  jobsStatus: "",
  jobsPage: 1,
  workforceStatus: "all",
  workforcePage: 1,
  paymentsMonth: now.getMonth() + 1,
  paymentsYear: now.getFullYear(),
  paymentHistorySearch: "",
  paymentHistoryPage: 1,
  setApplicants: (partial) =>
    set((s) => ({
      applicants: { ...s.applicants, ...partial, page: partial.page ?? (partial.search !== undefined || partial.jobId !== undefined || partial.status !== undefined ? 1 : s.applicants.page) },
    })),
  resetApplicants: () => set({ applicants: defaultApplicants }),
  setJobsStatus: (jobsStatus) => set({ jobsStatus, jobsPage: 1 }),
  setJobsPage: (jobsPage) => set({ jobsPage }),
  setWorkforceStatus: (workforceStatus) => set({ workforceStatus, workforcePage: 1 }),
  setWorkforcePage: (workforcePage) => set({ workforcePage }),
  setPaymentsPeriod: (paymentsMonth, paymentsYear) => set({ paymentsMonth, paymentsYear }),
  setPaymentHistorySearch: (paymentHistorySearch) => set({ paymentHistorySearch, paymentHistoryPage: 1 }),
  setPaymentHistoryPage: (paymentHistoryPage) => set({ paymentHistoryPage }),
}));
