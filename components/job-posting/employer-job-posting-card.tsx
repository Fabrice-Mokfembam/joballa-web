"use client";

import type { WorkerJobCard } from "@/lib/worker-job-data";
import { JobPostingCard, type JobPostingCardMenuItem } from "@/components/job-posting/job-posting-card";
import { splitJobSubtitle } from "@/components/job-posting/worker-job-posting-card";

type Props = {
  job: WorkerJobCard;
  postedLabel: string;
  manageHref: string;
  manageLabel: string;
  moreMenuAriaLabel: string;
  menuItems?: JobPostingCardMenuItem[];
  className?: string;
};

/** Same Figma job card layout for employer surfaces (no match % / bookmark by default). */
export function EmployerJobPostingCard({
  job,
  postedLabel,
  manageHref,
  manageLabel,
  moreMenuAriaLabel,
  menuItems,
  className,
}: Props) {
  const { schedule, location } = splitJobSubtitle(job.subtitle);
  return (
    <JobPostingCard
      className={className}
      postedLabel={postedLabel}
      matchPercent={null}
      title={job.title}
      scheduleLabel={schedule}
      locationLabel={location}
      pillTags={[job.seniority, job.pay]}
      companyName={job.company}
      companyLogoUrl={job.companyLogoUrl}
      companyInitial={job.companyInitial}
      companyAvatarClassName={job.companyColor}
      showBookmark={false}
      bookmarkLabel=""
      applyLabel={manageLabel}
      applyHref={manageHref}
      titleHref={manageHref}
      menuItems={menuItems}
      moreMenuAriaLabel={moreMenuAriaLabel}
    />
  );
}
