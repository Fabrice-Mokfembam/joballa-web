"use client";

import type { MouseEvent, ReactNode } from "react";
import { useState } from "react";
import { Link } from "@/lib/i18n/navigation";
import { JobCardAvatar } from "@/components/job-posting/job-card-avatar";
import { IconBookmark, IconBookmarkSolid, IconMoreHorizontal } from "@/components/worker/icons";
import { cn } from "@/lib/utils";

export type JobPostingCardMenuItem = {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
};

export type JobPostingCardProps = {
  className?: string;
  /** e.g. "2d ago" */
  postedLabel: string;
  /** When set, shows the yellow match pill. */
  matchPercent?: number | null;
  /** Used with `matchPercent` when no `matchTextOverride`. */
  matchLabel?: (pct: number) => string;
  /** Fully translated match line (e.g. "60% match") — wins over percent + `matchLabel`. */
  matchTextOverride?: string;
  title: string;
  /** First line under title: employment type (e.g. Full-time) */
  scheduleLabel: string;
  /** Location shown after the dot */
  locationLabel: string;
  /** Two chips (e.g. seniority + pay) */
  pillTags: readonly [string, string] | string[];
  companyName: string;
  /** Shown below `companyName` (e.g. Employer / Individual). */
  posterRoleLabel?: string;
  companyLogoUrl?: string | null;
  companyInitial?: string;
  companyAvatarClassName?: string;
  bookmarkFilled?: boolean;
  bookmarkLabel?: string;
  onBookmarkClick?: () => void;
  showBookmark?: boolean;
  applyLabel: string;
  applyHref?: string;
  onApplyClick?: () => void;
  showApply?: boolean;
  /** Muted pill in the apply slot when the worker already applied (mobile parity). */
  appliedLabel?: string;
  /** Primary footer action when apply is hidden (e.g. Publish on drafts). */
  actionLabel?: string;
  onActionClick?: () => void;
  /** Optional overflow menu (⋯) */
  menuItems?: JobPostingCardMenuItem[];
  /** Status pill shown beside the more menu (e.g. Draft, Live). */
  statusPill?: { label: string; className?: string };
  moreMenuAriaLabel: string;
  titleHref?: string;
  /** When set (and typically without `titleHref`), title opens via click instead of navigation. */
  onTitleClick?: () => void;
  /** Whole-card open action (e.g. job detail / split pane). Ignored on clicks inside `[data-card-stop]`. */
  onCardClick?: () => void;
};

function PillTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-[26px] border border-[var(--joballa-pill-border)] bg-[var(--joballa-pill-bg)] px-2 py-1.5 text-xs font-semibold leading-4 text-[var(--joballa-muted)]">
      {children}
    </span>
  );
}

function formatJobCardText(value: ReactNode): ReactNode {
  if (typeof value !== "string") return value;
  return value
    .replace(/\b\d{4,}\b/g, (match) => Number(match).toLocaleString())
    .replace(/\/monthly\b/gi, "/m")
    .replace(/\/month\b/gi, "/m")
    .replace(/\/mo\b/gi, "/m")
    .replace(/\/hourly\b/gi, "/h")
    .replace(/\/hour\b/gi, "/h")
    .replace(/\/hr\b/gi, "/h");
}

function isCardStopTarget(target: EventTarget | null) {
  const el = target instanceof Element ? target : target instanceof Text ? target.parentElement : null;
  return Boolean(el?.closest("[data-card-stop]"));
}

export function JobPostingCard({
  className,
  postedLabel,
  matchPercent,
  matchLabel = (pct) => `${pct}% match`,
  matchTextOverride,
  title,
  scheduleLabel,
  locationLabel,
  pillTags,
  companyName,
  posterRoleLabel,
  companyLogoUrl,
  companyInitial,
  companyAvatarClassName,
  bookmarkFilled,
  bookmarkLabel,
  onBookmarkClick,
  showBookmark = true,
  applyLabel,
  applyHref,
  onApplyClick,
  showApply = true,
  appliedLabel,
  actionLabel,
  onActionClick,
  menuItems,
  statusPill,
  moreMenuAriaLabel,
  titleHref,
  onTitleClick,
  onCardClick,
}: JobPostingCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pills = (pillTags.length >= 2 ? [pillTags[0], pillTags[1]] : [pillTags[0] ?? "", pillTags[1] ?? ""]).filter(
    (pill) => Boolean(pill && String(pill).trim()),
  );

  const titleContent = <h3 className="text-lg font-semibold leading-7 text-[var(--joballa-fg)]">{title}</h3>;

  function handleCardClick(e: MouseEvent<HTMLDivElement>) {
    if (!onCardClick) return;
    if (isCardStopTarget(e.target)) return;
    onCardClick();
  }

  const applyUsesHandler = Boolean(onApplyClick);
  const applyControl =
    showApply && !appliedLabel && (applyUsesHandler || applyHref) ? (
      applyUsesHandler ? (
        <button
          type="button"
          data-card-stop
          className="inline-flex h-8 items-center justify-center rounded-xl bg-[var(--joballa-primary)] px-3 text-sm font-medium leading-5 text-[var(--joballa-on-primary)] shadow-[var(--joballa-shadow-card)] transition hover:brightness-110"
          onClick={onApplyClick}
        >
          {applyLabel}
        </button>
      ) : (
        <Link
          data-card-stop
          href={applyHref!}
          className="inline-flex h-8 items-center justify-center rounded-xl bg-[var(--joballa-primary)] px-3 text-sm font-medium leading-5 text-[var(--joballa-on-primary)] shadow-[var(--joballa-shadow-card)] transition hover:brightness-110"
        >
          {applyLabel}
        </Link>
      )
    ) : appliedLabel ? (
      <span
        data-card-stop
        className="inline-flex h-8 items-center justify-center rounded-xl bg-[var(--joballa-tag-bg)] px-3 text-sm font-semibold leading-5 text-[var(--joballa-muted)]"
      >
        {appliedLabel}
      </span>
    ) : actionLabel && onActionClick ? (
      <button
        type="button"
        data-card-stop
        className="inline-flex h-8 items-center justify-center rounded-xl bg-[var(--joballa-primary)] px-3 text-sm font-medium leading-5 text-[var(--joballa-on-primary)] shadow-[var(--joballa-shadow-card)] transition hover:brightness-110"
        onClick={onActionClick}
      >
        {actionLabel}
      </button>
    ) : null;

  return (
    <div
      className={cn(
        "relative flex min-w-0 w-full max-w-full flex-col gap-6 rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-[14px] shadow-[var(--joballa-shadow-card)]",
        onCardClick && "cursor-pointer transition hover:border-[color-mix(in_srgb,var(--joballa-primary)_35%,var(--joballa-border))]",
        className,
      )}
      onClick={handleCardClick}
    >
      <div className="flex w-full shrink-0 items-center justify-between gap-2">
        <p className="text-xs font-medium leading-4 text-[var(--joballa-muted)]">{postedLabel}</p>
        <div className="flex shrink-0 items-center gap-3.5">
          <div className="flex min-w-0 flex-1 justify-end">
            {matchTextOverride || (matchPercent != null && matchPercent > 0) ? (
              <span className="inline-flex shrink-0 items-center justify-center rounded-[26px] bg-[var(--joballa-highlight-bg)] px-2 py-0.5 text-xs font-semibold leading-4 text-[var(--joballa-highlight-fg)]">
                {matchTextOverride ?? matchLabel(matchPercent!)}
              </span>
            ) : (
              <span className="min-w-[1px] shrink-0" />
            )}
          </div>
          {statusPill ? (
            <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold leading-4", statusPill.className)}>
              {statusPill.label}
            </span>
          ) : null}
          <div className="relative shrink-0" data-card-stop>
            <button
              type="button"
              className={cn(
                "rounded-md p-0.5 text-[var(--joballa-muted)] transition hover:bg-[var(--joballa-row-hover)] hover:text-[var(--joballa-fg)]",
                !menuItems?.length && "cursor-default opacity-50 hover:bg-transparent",
              )}
              aria-label={moreMenuAriaLabel}
              aria-expanded={menuOpen}
              disabled={!menuItems?.length}
              onClick={() => menuItems?.length && setMenuOpen((o) => !o)}
            >
              <IconMoreHorizontal className="size-6" />
            </button>
            {menuOpen && menuItems && menuItems.length > 0 ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10 cursor-default bg-transparent"
                  aria-hidden
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-lg border border-[var(--joballa-border)] bg-[var(--joballa-dropdown-bg)] py-1 text-sm shadow-[var(--joballa-shadow-elevated)]">
                  {menuItems.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      className={cn(
                        "block w-full px-3 py-2 text-left text-[var(--joballa-fg)] hover:bg-[var(--joballa-row-hover)]",
                        item.destructive && "text-[var(--joballa-danger-fg)] hover:bg-[var(--joballa-danger-bg)]",
                      )}
                      onClick={() => {
                        item.onSelect();
                        setMenuOpen(false);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        {onCardClick ? (
          titleContent
        ) : onTitleClick ? (
          <button
            type="button"
            onClick={onTitleClick}
            className="block w-full text-left outline-none ring-[var(--joballa-primary)] ring-offset-2 focus-visible:rounded-sm focus-visible:ring-2"
          >
            {titleContent}
          </button>
        ) : titleHref ? (
          <Link href={titleHref} className="block outline-none ring-[var(--joballa-primary)] ring-offset-2 focus-visible:rounded-sm focus-visible:ring-2">
            {titleContent}
          </Link>
        ) : (
          titleContent
        )}
        <div className="flex min-w-0 flex-wrap items-center gap-0 text-sm font-semibold leading-5 text-[var(--joballa-muted)]">
          <span className="shrink-0 whitespace-nowrap">{scheduleLabel}</span>
          {locationLabel ? (
            <>
              <span className="mx-0.5 inline-flex size-3 shrink-0 items-center justify-center text-[10px] opacity-70" aria-hidden>
                ·
              </span>
              <span className="min-w-0 truncate">{locationLabel}</span>
            </>
          ) : null}
        </div>
        {pills.length > 0 ? (
          <div className="flex flex-wrap gap-2.5 pt-0.5">
            {pills.map((pill) => (
              <PillTag key={String(pill)}>{formatJobCardText(pill)}</PillTag>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex w-full shrink-0 items-end justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <JobCardAvatar
            name={companyName}
            logoUrl={companyLogoUrl}
            initial={companyInitial}
            className={companyAvatarClassName}
          />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold leading-4 text-[var(--joballa-muted)]">{companyName}</p>
            {posterRoleLabel ? (
              <p className="truncate text-[10px] font-medium leading-4 text-[var(--joballa-fg-subtle)]">{posterRoleLabel}</p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {applyControl}
          {showBookmark ? (
            <button
              type="button"
              data-card-stop
              className={cn(
                "flex h-8 items-center justify-center rounded-xl bg-[var(--joballa-tag-bg)] px-3 text-[var(--joballa-muted)] transition hover:bg-[var(--joballa-row-hover)] hover:text-[var(--joballa-fg)]",
                bookmarkFilled && "text-[var(--joballa-fg)]",
              )}
              aria-label={bookmarkLabel ?? ""}
              onClick={onBookmarkClick}
            >
              {bookmarkFilled ? <IconBookmarkSolid className="size-4" /> : <IconBookmark className="size-4" />}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
