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
  linkedJobSlug?: string;
  detailJobType?: string;
  detailLocation?: string;
  detailStart?: string;
  detailDuration?: string;
  detailApplicantsSoFar?: string;
};
