"use client";

import { useTranslations } from "next-intl";
import type { WorkerJobCard } from "@/lib/worker-job-data";
import { JobPostingCard, type JobPostingCardMenuItem } from "@/components/job-posting/job-posting-card";

export function splitJobSubtitle(subtitle: string): { schedule: string; location: string } {
  const parts = subtitle.split(/\s*•\s*/).map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { schedule: parts[0]!, location: parts.slice(1).join(" • ") };
  }
  return { schedule: parts[0] ?? subtitle, location: "" };
}

type WorkerJobPostingCardProps = {
  job: WorkerJobCard;
  postedLabel: string;
  /** Translated match line (e.g. "75% match"). Preferred for grids that already call `t()`. */
  matchTextOverride?: string;
  matchLabel?: (pct: number) => string;
  bookmarkLabel?: string;
  bookmarkFilled?: boolean;
  onBookmarkClick?: () => void;
  applyLabel: string;
  showApply?: boolean;
  appliedLabel?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  /** `null` = no default job link. */
  titleHref?: string | null;
  applyHref?: string | null;
  onTitleClick?: () => void;
  onApplyClick?: () => void;
  /** Opens job in split pane or full detail (card chrome, excluding apply/bookmark/menu). */
  onCardClick?: () => void;
  menuItems?: JobPostingCardMenuItem[];
  moreMenuAriaLabel: string;
  className?: string;
};

/** Worker routes + copy wired to the shared {@link JobPostingCard} (Figma job card). */
export function WorkerJobPostingCard({
  job,
  postedLabel,
  matchTextOverride,
  matchLabel,
  bookmarkLabel,
  bookmarkFilled,
  onBookmarkClick,
  applyLabel,
  showApply = true,
  appliedLabel,
  actionLabel,
  onActionClick,
  titleHref: titleHrefProp,
  applyHref: applyHrefProp,
  onTitleClick,
  onApplyClick,
  onCardClick,
  menuItems,
  moreMenuAriaLabel,
  className,
}: WorkerJobPostingCardProps) {
  const t = useTranslations("worker.findJobsPage");
  const scheduleLabel = job.cityLabel || "";
  const locationLabel = job.workModeLabel || "";
  const titleHref =
    onCardClick != null
      ? undefined
      : titleHrefProp === null || (titleHrefProp === undefined && onTitleClick)
        ? undefined
        : titleHrefProp ?? `/worker/jobs/${job.slug}`;
  const applyHref =
    onApplyClick != null
      ? undefined
      : applyHrefProp === null
        ? undefined
        : applyHrefProp ?? `/worker/jobs/${job.slug}?apply=1`;
  const onTitleClickResolved = onCardClick != null ? undefined : onTitleClick;

  return (
    <JobPostingCard
      className={className}
      postedLabel={postedLabel}
      matchPercent={matchTextOverride ? null : (job.match ?? null)}
      matchLabel={matchLabel}
      matchTextOverride={matchTextOverride}
      title={job.title}
      scheduleLabel={scheduleLabel}
      locationLabel={locationLabel}
      pillTags={[job.pay, job.employmentType].filter(Boolean)}
      companyName={job.company}
      posterRoleLabel={job.posterType ? t(`posterRole.${job.posterType}`) : undefined}
      companyLogoUrl={job.companyLogoUrl}
      companyInitial={job.companyInitial}
      companyAvatarClassName={job.companyColor}
      bookmarkFilled={bookmarkFilled}
      bookmarkLabel={bookmarkLabel}
      onBookmarkClick={onBookmarkClick}
      applyLabel={applyLabel}
      showApply={showApply}
      appliedLabel={appliedLabel}
      actionLabel={actionLabel}
      onActionClick={onActionClick}
      applyHref={applyHref}
      onApplyClick={onApplyClick}
      menuItems={menuItems}
      moreMenuAriaLabel={moreMenuAriaLabel}
      titleHref={titleHref}
      onTitleClick={onTitleClickResolved}
      onCardClick={onCardClick}
    />
  );
}
