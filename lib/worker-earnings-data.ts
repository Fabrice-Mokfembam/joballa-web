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

export const EARNING_TRANSACTIONS: EarningTransaction[] = [
  {
    id: "1",
    dateLabel: "12 May 2026",
    employer: "TechCo Cameroun",
    employerInitial: "T",
    employerColor: "bg-teal-600",
    jobTitle: "Software Engineer",
    amountPrimary: "320,000 XAF",
    amountSecondary: "$520 USD",
    status: "paid",
  },
  {
    id: "2",
    dateLabel: "02 May 2026",
    employer: "joballa Education",
    employerInitial: "J",
    employerColor: "bg-[var(--joballa-primary)]",
    jobTitle: "Marketing Specialist",
    amountPrimary: "120,000 XAF",
    status: "overdue",
  },
  {
    id: "3",
    dateLabel: "28 Apr 2026",
    employer: "Creative Hub CM",
    employerInitial: "C",
    employerColor: "bg-violet-600",
    jobTitle: "Graphic Designer",
    amountPrimary: "85,000 XAF",
    status: "paid",
  },
  {
    id: "4",
    dateLabel: "15 Apr 2026",
    employer: "PortServe CM",
    employerInitial: "P",
    employerColor: "bg-amber-600",
    jobTitle: "Logistics Coordinator",
    amountPrimary: "95,000 XAF",
    status: "pending",
  },
  {
    id: "5",
    dateLabel: "08 Apr 2026",
    employer: "Bright Events",
    employerInitial: "B",
    employerColor: "bg-rose-600",
    jobTitle: "Events Host",
    amountPrimary: "24,000 XAF",
    status: "overdue",
  },
];
