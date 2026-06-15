"use client";

import { useTranslations } from "next-intl";
import type { WorkerJobCard } from "@/lib/worker-job-data";
import { useRouter } from "@/lib/i18n/navigation";
import { WorkerJobPostingCard } from "@/components/job-posting/worker-job-posting-card";
import type { JobPostingCardMenuItem } from "@/components/job-posting/job-posting-card";
import { useSaveWorkerJob, useUnsaveWorkerJob } from "@/features/worker/hooks";
import { useCallback, useState } from "react";

type Props = {
  job: WorkerJobCard;
  topLine: string;
  matchLabel?: string;
  bookmarkLabel: string;
  bookmarkFilled?: boolean;
  moreMenuAriaLabel?: string;
  applyLabel?: string;
  showApply?: boolean;
  appliedLabel?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  /** Desktop split pane: card opens sidebar; apply opens in-pane flow. */
  splitPane?: boolean;
  isActive?: boolean;
  onSelectJob?: (slug: string) => void;
  onApplyInPane?: (slug: string) => void;
  menuItems?: JobPostingCardMenuItem[];
};

/** Worker job grid cell — Figma-aligned via shared {@link JobPostingCard}. */
export function WorkerJobGridCard({
  job,
  topLine,
  matchLabel,
  bookmarkLabel,
  bookmarkFilled,
  moreMenuAriaLabel,
  applyLabel,
  showApply = true,
  appliedLabel,
  actionLabel,
  onActionClick,
  splitPane,
  isActive,
  onSelectJob,
  onApplyInPane,
  menuItems,
}: Props) {
  const t = useTranslations("worker.findJobsPage");
  const tc = useTranslations("common.aria");
  const router = useRouter();
  const resolvedMoreMenuAriaLabel = moreMenuAriaLabel ?? tc("jobActions");
  const resolvedApplyLabel = applyLabel ?? t("apply");
  const saveJob = useSaveWorkerJob();
  const unsaveJob = useUnsaveWorkerJob();
  const [savedOverride, setSavedOverride] = useState<boolean | null>(null);
  const saved = savedOverride ?? !!(bookmarkFilled ?? job.isSaved);

  const toggleBookmark = useCallback(() => {
    const next = !saved;
    setSavedOverride(next);
    if (next) {
      saveJob.mutate(job.slug, { onError: () => setSavedOverride(null) });
    } else {
      unsaveJob.mutate(job.slug, { onError: () => setSavedOverride(null) });
    }
  }, [job.slug, saveJob, saved, unsaveJob]);

  return (
    <WorkerJobPostingCard
      className={isActive ? "border-2 border-[var(--joballa-primary)] shadow-[0_0_0_1px_var(--joballa-primary)]" : undefined}
      job={job}
      postedLabel={topLine}
      matchTextOverride={matchLabel}
      bookmarkLabel={bookmarkLabel}
      bookmarkFilled={saved}
      onBookmarkClick={toggleBookmark}
      applyLabel={resolvedApplyLabel}
      showApply={showApply}
      appliedLabel={appliedLabel}
      actionLabel={actionLabel}
      onActionClick={onActionClick}
      menuItems={menuItems}
      moreMenuAriaLabel={resolvedMoreMenuAriaLabel}
      titleHref={null}
      applyHref={null}
      onCardClick={() => {
        if (splitPane && onSelectJob) {
          onSelectJob(job.slug);
          return;
        }
        void router.push(`/worker/jobs/${job.slug}`);
      }}
      onApplyClick={
        showApply && !appliedLabel
          ? () => {
              if (splitPane && onApplyInPane) {
                onApplyInPane(job.slug);
                return;
              }
              void router.push(`/worker/jobs/${job.slug}?apply=1`);
            }
          : undefined
      }
    />
  );
}
