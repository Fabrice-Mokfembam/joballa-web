import type { EmployerJobListItem } from "@/features/employer/types/employer-portal";
import { employerJobId } from "@/features/employer/lib/normalize-employer-job";

/** Card shape shared with {@link JobPostingCard} for employer job lists. */
export type EmployerJobCardModel = {
  jobId: string;
  title: string;
  subtitle: string;
  pay: string;
  posted: string;
  status: string;
  applicantsCount: number;
  shortlistedCount: number;
  company: string;
  companyInitial: string;
  companyColor: string;
  companyLogoUrl?: string | null;
};

export function employerJobToCard(job: EmployerJobListItem, companyName = "Your company"): EmployerJobCardModel {
  const jobId = employerJobId(job);
  const location = job.location ?? "";
  const jobType = job.jobType ?? "";
  const subtitle = [jobType, location].filter(Boolean).join(" • ") || "—";
  const pay = job.salary ?? "—";

  return {
    jobId,
    title: job.title ?? "Untitled job",
    subtitle,
    pay: String(pay),
    posted: job.postedAt ? formatPostedAgo(job.postedAt) : "—",
    status: String(job.status ?? "draft"),
    applicantsCount: job.applicantsCount ?? 0,
    shortlistedCount: job.shortlistedCount ?? 0,
    company: companyName,
    companyInitial: companyName.charAt(0).toUpperCase() || "J",
    companyColor: "bg-[var(--joballa-primary)]",
  };
}

function formatPostedAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return "Today";
  if (days === 1) return "1d";
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;
  const months = Math.floor(days / 30);
  return `${months}mo`;
}

export function employerJobById(jobs: EmployerJobListItem[], jobId: string): EmployerJobListItem | null {
  return jobs.find((j) => employerJobId(j) === jobId) ?? null;
}
