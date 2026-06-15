import type { JobPosterType } from "@/features/worker/lib/job-poster";

export type WorkerJobCard = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  /** Department label shown on the job card chip. */
  department: string;
  /** Employment type label (e.g. Full Time). */
  employmentType: string;
  /** City / town shown beside work mode on the card. */
  cityLabel: string;
  /** Onsite, remote, hybrid, etc. */
  workModeLabel: string;
  seniority: string;
  pay: string;
  posted: string;
  match?: number;
  company: string;
  companyInitial: string;
  companyColor: string;
  companyLogoUrl?: string | null;
  posterType?: JobPosterType | null;
  isSaved?: boolean;
  hasApplied?: boolean;
  /** True when the signed-in worker posted this job. */
  isOwnJob?: boolean;
};
