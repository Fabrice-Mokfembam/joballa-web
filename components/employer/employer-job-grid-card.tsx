"use client";

import type { EmployerJobCardModel } from "@/lib/employer-job-card";
import { useRouter } from "@/lib/i18n/navigation";
import { JobPostingCard } from "@/components/job-posting/job-posting-card";

type Props = {
  job: EmployerJobCardModel;
  postedLabel: string;
  applicantsLabel: string;
  isActive?: boolean;
  splitPane?: boolean;
  onSelectJob?: (jobId: string) => void;
  viewApplicantsLabel?: string;
};

export function EmployerJobGridCard({
  job,
  postedLabel,
  applicantsLabel,
  isActive,
  splitPane,
  onSelectJob,
  viewApplicantsLabel = "View applicants",
}: Props) {
  const router = useRouter();
  const parts = job.subtitle.split(/\s*•\s*/).map((s) => s.trim());
  const schedule = parts[0] ?? job.subtitle;
  const location = parts.slice(1).join(" • ");

  return (
    <JobPostingCard
      className={
        isActive ? "border-2 border-[var(--joballa-primary)] shadow-[0_0_0_1px_var(--joballa-primary)]" : undefined
      }
      title={job.title}
      scheduleLabel={schedule}
      locationLabel={location}
      pillTags={[job.status.replace("_", " "), job.pay]}
      companyName={job.company}
      companyLogoUrl={job.companyLogoUrl}
      companyInitial={job.companyInitial}
      companyAvatarClassName={job.companyColor}
      postedLabel={postedLabel}
      matchTextOverride={applicantsLabel}
      showBookmark={false}
      applyLabel={viewApplicantsLabel}
      onCardClick={() => {
        if (splitPane && onSelectJob) {
          onSelectJob(job.jobId);
          return;
        }
        void router.push(`/employer/jobs?job=${encodeURIComponent(job.jobId)}`);
      }}
      onApplyClick={() => {
        void router.push(`/employer/applicants?jobId=${encodeURIComponent(job.jobId)}`);
      }}
      moreMenuAriaLabel="Job actions"
    />
  );
}
