export type WorkerJobCard = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  /** Department label shown on the job card chip. */
  department: string;
  /** Employment type label (e.g. Full Time). */
  employmentType: string;
  seniority: string;
  pay: string;
  posted: string;
  match?: number;
  company: string;
  companyInitial: string;
  companyColor: string;
  companyLogoUrl?: string | null;
  isSaved?: boolean;
  hasApplied?: boolean;
};
