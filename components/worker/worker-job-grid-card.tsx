"use client";

import type { WorkerJobCard } from "@/lib/worker-job-data";
import { useRouter } from "@/lib/i18n/navigation";
import { WorkerJobPostingCard } from "@/components/job-posting/worker-job-posting-card";
import type { JobPostingCardMenuItem } from "@/components/job-posting/job-posting-card";

type Props = {
  job: WorkerJobCard;
  topLine: string;
  matchLabel?: string;
  bookmarkLabel: string;
  bookmarkFilled?: boolean;
  moreMenuAriaLabel?: string;
  applyLabel?: string;
  showApply?: boolean;
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
  moreMenuAriaLabel = "Job actions",
  applyLabel = "Apply",
  showApply = true,
  splitPane,
  isActive,
  onSelectJob,
  onApplyInPane,
  menuItems,
}: Props) {
  const router = useRouter();

  return (
    <WorkerJobPostingCard
      className={isActive ? "border-2 border-[var(--joballa-primary)] shadow-[0_0_0_1px_var(--joballa-primary)]" : undefined}
      job={job}
      postedLabel={topLine}
      matchTextOverride={matchLabel}
      bookmarkLabel={bookmarkLabel}
      bookmarkFilled={bookmarkFilled}
      applyLabel={applyLabel}
      showApply={showApply}
      menuItems={menuItems}
      moreMenuAriaLabel={moreMenuAriaLabel}
      titleHref={null}
      applyHref={null}
      onCardClick={() => {
        if (splitPane && onSelectJob) {
          onSelectJob(job.slug);
          return;
        }
        void router.push(`/worker/jobs/${job.slug}`);
      }}
      onApplyClick={() => {
        if (splitPane && onApplyInPane) {
          onApplyInPane(job.slug);
          return;
        }
        void router.push(`/worker/jobs/${job.slug}?apply=1`);
      }}
    />
  );
}
