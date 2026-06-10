"use client";

import { IconPencil } from "@/components/worker/icons";
import { cn } from "@/lib/utils";

type ProfileRecordCardProps = {
  title: string;
  subtitle?: string;
  meta?: string;
  badge?: string;
  editLabel: string;
  removeLabel: string;
  onEdit: () => void;
  onRemove: () => void;
  className?: string;
};

/** Profile entry card (work, education, certifications). */
export function ProfileRecordCard({
  title,
  subtitle,
  meta,
  badge,
  editLabel,
  removeLabel,
  onEdit,
  onRemove,
  className,
}: ProfileRecordCardProps) {
  return (
    <div className={cn("mb-4 rounded-[12px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-4", className)}>
      <div className="flex flex-col gap-3 min-[480px]:flex-row min-[480px]:items-start min-[480px]:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-bold leading-6 text-[var(--joballa-primary)]">{title}</p>
            {badge ? (
              <span className="inline-flex rounded-full bg-[var(--joballa-jade-3)] px-2 py-0.5 text-[10px] font-semibold text-[var(--joballa-primary)]">
                {badge}
              </span>
            ) : null}
          </div>
          {subtitle ? <p className="mt-1 text-sm text-[var(--joballa-muted)]">{subtitle}</p> : null}
          {meta ? <p className="mt-1.5 text-xs text-[var(--joballa-muted)]">{meta}</p> : null}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-8 items-center gap-1.5 rounded-[10px] bg-transparent px-2 text-xs font-semibold text-[var(--joballa-label-fg)] transition hover:bg-[var(--joballa-row-hover)]"
          >
            <IconPencil className="size-3.5" />
            {editLabel}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex h-8 items-center gap-1.5 rounded-[10px] bg-transparent px-2 text-xs font-semibold text-[var(--joballa-danger-fg)] transition hover:bg-[var(--joballa-danger-bg)]"
          >
            {removeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
