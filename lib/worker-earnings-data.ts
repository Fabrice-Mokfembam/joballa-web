export type EarningTransactionStatus = "paid" | "pending" | "overdue";

export type EarningTransaction = {
  id: string;
  dateLabel: string;
  employer: string;
  employerInitial: string;
  employerColor: string;
  jobTitle: string;
  amountPrimary: string;
  amountSecondary?: string;
  status: EarningTransactionStatus;
  initiatedAt?: string | null;
  completedAt?: string | null;
  paymentPlatform?: string;
  paymentMethod?: string;
  reference?: string;
  jobId?: string | null;
  applicationId?: string | null;
};
