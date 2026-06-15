"use client";

import { useTranslations } from "next-intl";
import type { EmployerJobCardModel } from "@/lib/employer-job-card";
import { employerJobStatusKey } from "@/features/employer/lib/employer-job-status";
import { useRouter } from "@/lib/i18n/navigation";
import { JobPostingCard } from "@/components/job-posting/job-posting-card";
import { jobStatusPillClass } from "@/lib/job-status-pill";

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
  viewApplicantsLabel,
}: Props) {
  const t = useTranslations("employer.jobsPage");
  const tc = useTranslations("common.aria");
  const router = useRouter();
  const resolvedViewApplicantsLabel = viewApplicantsLabel ?? t("viewApplicants");
  const locationLine = job.location || job.subtitle;

  return (
    <JobPostingCard
      className={
        isActive ? "border-2 border-[var(--joballa-primary)] shadow-[0_0_0_1px_var(--joballa-primary)]" : undefined
      }
      title={job.title}
      scheduleLabel=""
      locationLabel={locationLine}
      pillTags={[job.pay, job.employmentType].filter(Boolean)}
      statusPill={{
        label: t(`status.${employerJobStatusKey(job.status)}`),
        className: jobStatusPillClass(job.status),
      }}
      companyName={job.company}
      posterRoleLabel={t("posterRole.employer")}
      companyLogoUrl={job.companyLogoUrl}
      companyInitial={job.companyInitial}
      companyAvatarClassName={job.companyColor}
      postedLabel={postedLabel}
      matchTextOverride={applicantsLabel}
      showBookmark={false}
      applyLabel={resolvedViewApplicantsLabel}
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
      moreMenuAriaLabel={tc("jobActions")}
    />
  );
}
