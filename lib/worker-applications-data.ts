import { workerJobBySlug } from "@/lib/worker-job-data";

export type WorkerApplicationStatus = "shortlisted" | "pending" | "rejected";

export type WorkerApplicationRow = {
  slug: string;
  jobTitle: string;
  company: string;
  companyInitial: string;
  companyColor: string;
  companyLogoUrl?: string | null;
  status: WorkerApplicationStatus;
  /** Shown in "You applied {time} ago" */
  appliedTime: string;
  /** i18n key under `worker.applications.timeline.*` — overrides applied line when set */
  timelineNoteKey?: "interview" | "offerDue";
  pay: string;
  payUsd?: string;
  jobType: string;
  location: string;
  matchPct: number | null;
  /** Optional link to `WORKER_JOB_CARDS` for detail subtitle / fallbacks */
  linkedJobSlug?: string;
  /** Detail left column — job facts */
  detailJobType?: string;
  detailLocation?: string;
  detailStart?: string;
  detailDuration?: string;
  detailApplicantsSoFar?: string;
};

export const WORKER_APPLICATIONS: WorkerApplicationRow[] = [
  {
    slug: "admin-assistant-yde",
    jobTitle: "Admin Assistant",
    company: "TechCo Cameroun",
    companyInitial: "T",
    companyColor: "bg-teal-600",
    status: "shortlisted",
    appliedTime: "5d",
    pay: "45,000 XAF/mo",
    jobType: "Part-time",
    location: "Yaoundé",
    matchPct: 45,
    linkedJobSlug: "admin-assistant-yde",
    detailJobType: "Part-time",
    detailLocation: "Onsite, Yaoundé",
    detailStart: "As soon as possible",
    detailDuration: "12 months",
    detailApplicantsSoFar: "24",
  },
  {
    slug: "home-tutor-math-english",
    jobTitle: "Home Tutor- Math & English",
    company: "joballa Education",
    companyInitial: "J",
    companyColor: "bg-[var(--joballa-primary)]",
    status: "pending",
    appliedTime: "1w",
    pay: "35,000 XAF/mo",
    jobType: "Part-time",
    location: "Buea",
    matchPct: 70,
    linkedJobSlug: "home-tutor-math-english",
    detailJobType: "Contract",
    detailLocation: "Onsite, Douala, Akwa",
    detailStart: "As soon as possible",
    detailDuration: "9 months",
    detailApplicantsSoFar: "7",
  },
  {
    slug: "virtual-assistant-tecco",
    jobTitle: "Virtual Assistant",
    company: "TechCo Cameroun",
    companyInitial: "T",
    companyColor: "bg-teal-600",
    status: "rejected",
    appliedTime: "2w",
    pay: "180,000 XAF/mo",
    jobType: "Contract",
    location: "Remote",
    matchPct: 50,
    detailJobType: "Contract",
    detailLocation: "Remote",
    detailStart: "Flexible",
    detailDuration: "6 months",
    detailApplicantsSoFar: "18",
  },
  {
    slug: "admin-assistant-pending-2",
    jobTitle: "Admin Assistant",
    company: "TechCo Cameroun",
    companyInitial: "T",
    companyColor: "bg-teal-600",
    status: "pending",
    appliedTime: "2w",
    pay: "50,000 XAF/mo",
    jobType: "Part-time",
    location: "Douala",
    matchPct: 42,
    detailJobType: "Part-time",
    detailLocation: "Onsite, Douala",
    detailStart: "Next month",
    detailDuration: "12 months",
    detailApplicantsSoFar: "31",
  },
  {
    slug: "project-manager-brightfuture",
    jobTitle: "Project Manager",
    company: "BrightFuture Inc.",
    companyInitial: "B",
    companyColor: "bg-sky-600",
    status: "pending",
    appliedTime: "3d",
    timelineNoteKey: "interview",
    pay: "450,000 XAF/mo",
    payUsd: "$120k/yr",
    jobType: "Full-time",
    location: "Douala",
    matchPct: 88,
    detailJobType: "Full-time",
    detailLocation: "Hybrid, Douala",
    detailStart: "01 Jun 2026",
    detailDuration: "Permanent",
    detailApplicantsSoFar: "12",
  },
  {
    slug: "ux-designer-creativelab",
    jobTitle: "UX Designer",
    company: "CreativeLab Studios",
    companyInitial: "C",
    companyColor: "bg-violet-600",
    status: "rejected",
    appliedTime: "1w",
    timelineNoteKey: "offerDue",
    pay: "280,000 XAF/mo",
    jobType: "Contract",
    location: "Remote",
    matchPct: 62,
    detailJobType: "Contract",
    detailLocation: "Remote",
    detailStart: "Rolling",
    detailDuration: "4 months",
    detailApplicantsSoFar: "45",
  },
];

export function getApplicationBySlug(slug: string) {
  return WORKER_APPLICATIONS.find((a) => a.slug === slug);
}

export function applicationCounts() {
  const all = WORKER_APPLICATIONS.length;
  const shortlisted = WORKER_APPLICATIONS.filter((a) => a.status === "shortlisted").length;
  const pending = WORKER_APPLICATIONS.filter((a) => a.status === "pending").length;
  const rejected = WORKER_APPLICATIONS.filter((a) => a.status === "rejected").length;
  return { all, shortlisted, pending, rejected };
}

export function enrichApplication(row: WorkerApplicationRow) {
  const job = row.linkedJobSlug ? workerJobBySlug(row.linkedJobSlug) : undefined;
  return { row, job };
}
