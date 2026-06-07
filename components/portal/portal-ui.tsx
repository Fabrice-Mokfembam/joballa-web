import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

/** Standard portal page wrapper (matches worker dashboard / find jobs). */
export const portalPageShellClass =
  "flex w-full min-w-0 flex-1 flex-col gap-4 bg-[var(--joballa-page-tint)] sm:gap-5 md:gap-6 lg:min-h-0 lg:flex-1";

/** Stat card grid — 2 cols on mobile, 4 on xl (worker dashboard pattern). */
export const portalStatGridClass = "grid gap-2.5 min-[420px]:grid-cols-2 sm:gap-3 xl:grid-cols-4";

export const portalSearchFormClass =
  "flex h-11 w-full min-w-0 flex-1 overflow-hidden rounded-[14px] border border-[var(--joballa-control-border)] bg-[var(--joballa-control-bg)]";

export const portalIconButtonClass =
  "rounded-lg p-2 text-[var(--joballa-nav-fg-muted)] transition hover:bg-[var(--joballa-nav-hover)] hover:text-[var(--joballa-nav-fg)]";

export const portalProfileSummaryClass =
  "flex cursor-pointer list-none items-center gap-1.5 rounded-lg py-1 pl-0.5 pr-0.5 outline-none ring-[var(--joballa-primary)] transition hover:bg-[var(--joballa-nav-hover)] focus-visible:ring-2 sm:gap-2 sm:py-1.5 sm:pl-1 [&::-webkit-details-marker]:hidden";

export function portalNavLinkClass(active: boolean) {
  return cn(
    "transition-colors",
    active
      ? "font-semibold text-[var(--joballa-primary)]"
      : "text-[var(--joballa-nav-fg-muted)] hover:bg-[var(--joballa-nav-hover)] hover:text-[var(--joballa-nav-fg)]",
  );
}

export const portalSegmentGroupClass =
  "flex items-center rounded-[12px] border border-[var(--joballa-control-border)] bg-[var(--joballa-control-bg)] p-1 shadow-[var(--joballa-shadow-card)]";

export function portalSegmentButtonClass(active: boolean) {
  return cn(
    "inline-flex size-8 items-center justify-center rounded-[8px] transition",
    active
      ? "bg-[var(--joballa-tag-bg)] text-[var(--joballa-fg)]"
      : "text-[var(--joballa-muted)] hover:text-[var(--joballa-fg)]",
  );
}

export function portalTabPillClass(active: boolean) {
  return cn(
    "rounded-full px-3 py-2 text-sm font-semibold transition",
    active
      ? "bg-[var(--joballa-tag-bg)] text-[var(--joballa-fg)]"
      : "text-[var(--joballa-muted)] hover:text-[var(--joballa-fg)]",
  );
}

export const portalFilterButtonClass =
  "inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-[var(--joballa-border-strong)] bg-[var(--joballa-card)] px-3 text-sm font-medium text-[var(--joballa-fg)] shadow-[var(--joballa-shadow-card)] outline-none ring-[var(--joballa-primary)] transition hover:border-[color-mix(in_srgb,var(--joballa-primary)_35%,var(--joballa-border))] focus-visible:ring-2 sm:px-4";

export const portalEmptyPanelClass =
  "rounded-[14px] border border-dashed border-[var(--joballa-empty-border)] bg-[var(--joballa-empty-bg)] px-6 py-12 text-center shadow-[var(--joballa-shadow-card)]";

export function PortalEmptyState({
  title,
  description,
  icon: Icon = Inbox,
  className,
}: {
  title?: string;
  description: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div className={cn(portalEmptyPanelClass, className)}>
      <div className="mx-auto flex max-w-md flex-col items-center gap-3">
        <span
          className="flex size-11 items-center justify-center rounded-xl border border-[var(--joballa-border)] bg-[var(--joballa-tag-bg)] text-[var(--joballa-muted)]"
          aria-hidden
        >
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
        {title ? <p className="text-base font-semibold tracking-tight text-[var(--joballa-fg)]">{title}</p> : null}
        <p className="text-sm leading-6 text-[var(--joballa-muted)]">{description}</p>
      </div>
    </div>
  );
}

export const portalDataTableClass =
  "overflow-x-auto rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] shadow-[var(--joballa-shadow-card)]";

export function portalCardClass({
  interactive = false,
  className,
}: {
  interactive?: boolean;
  className?: string;
} = {}) {
  return cn(
    "rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] shadow-[var(--joballa-shadow-card)]",
    interactive &&
      "transition-[border-color,background-color,box-shadow] hover:border-[color-mix(in_srgb,var(--joballa-primary)_35%,var(--joballa-border))] hover:bg-[var(--joballa-row-hover)]",
    className,
  );
}

export const portalInputClass =
  "h-11 w-full rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-input-bg)] px-4 text-sm text-[var(--joballa-fg)] outline-none ring-[var(--joballa-primary)] placeholder:text-[var(--joballa-muted)] transition focus-visible:ring-2";

export const portalTextareaClass =
  "min-h-[120px] w-full rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-input-bg)] px-4 py-3 text-sm leading-6 text-[var(--joballa-fg)] outline-none ring-[var(--joballa-primary)] placeholder:text-[var(--joballa-muted)] transition focus-visible:ring-2";

export const portalOutlineButtonClass =
  "inline-flex h-10 items-center justify-center rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] px-4 text-sm font-medium text-[var(--joballa-fg)] shadow-[var(--joballa-shadow-card)] transition hover:border-[color-mix(in_srgb,var(--joballa-primary)_35%,var(--joballa-border))] hover:bg-[var(--joballa-row-hover)] sm:h-11";

/** Detail / split-panel sections (Applicants, Workforce, etc.) — follows light/dark tokens. */
export const portalDetailSectionClass =
  "rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-4 shadow-[var(--joballa-shadow-card)] sm:p-5";

export const portalDetailSectionMutedClass =
  "rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-pill-bg)] p-4 shadow-[var(--joballa-shadow-card)]";

export const portalSectionLabelClass =
  "text-xs font-bold uppercase tracking-wide text-[var(--joballa-muted)]";

export const portalAvatarPlaceholderClass =
  "flex shrink-0 items-center justify-center rounded-full bg-[var(--joballa-avatar-bg)] font-bold text-[var(--joballa-on-primary)]";

export const portalIconButtonMutedClass =
  "flex items-center justify-center rounded-xl bg-[var(--joballa-tag-bg)] text-[var(--joballa-muted)] transition hover:bg-[var(--joballa-row-hover)] hover:text-[var(--joballa-fg)]";

export const portalStatusActiveBadgeClass =
  "inline-flex rounded-full bg-[var(--joballa-jade-3)] px-2.5 py-0.5 text-xs font-semibold capitalize text-[var(--joballa-primary)]";

export const portalStatusInactiveBadgeClass =
  "inline-flex rounded-full bg-[var(--joballa-tag-bg)] px-2.5 py-0.5 text-xs font-semibold capitalize text-[var(--joballa-muted)]";

/** Compact employer list/table view (Jobs, Applicants, Dashboard). */
export const portalListTableClass = "w-full text-left text-xs leading-5";
export const portalListTableHeadRowClass =
  "border-b border-[var(--joballa-border)] text-[10px] font-semibold uppercase tracking-wide text-[var(--joballa-muted)]";
export const portalListTableThClass = "px-3 py-2 sm:px-4";
export const portalListTableTdClass = "px-3 py-2 sm:px-4";
export const portalListTableBodyRowClass =
  "border-b border-[var(--joballa-border)] last:border-0 transition hover:bg-[var(--joballa-row-hover)]";

export function PortalCard({
  children,
  className,
  interactive,
  ...props
}: ComponentProps<"div"> & { interactive?: boolean }) {
  return (
    <div className={portalCardClass({ interactive, className })} {...props}>
      {children}
    </div>
  );
}

export function PortalStatCard({
  label,
  value,
  hint,
  hintTone = "neutral",
  className,
  variant = "default",
}: {
  label: string;
  value: string;
  hint: string;
  hintTone?: "neutral" | "positive" | "negative";
  className?: string;
  variant?: "default" | "workforce";
}) {
  const isWorkforce = variant === "workforce";

  return (
    <article
      className={portalCardClass({
        className: cn(isWorkforce ? "gap-[13px] p-[14px]" : "px-4 py-3.5 sm:px-5 sm:py-4", className),
        interactive: true,
      })}
    >
      <p
        className={cn(
          "text-xs uppercase tracking-[0.02em] text-[var(--joballa-muted)]",
          isWorkforce ? "font-bold" : "font-semibold",
        )}
      >
        {label}
      </p>
      <div className={cn("flex items-end justify-between gap-1", isWorkforce ? "w-full" : "mt-2 gap-3")}>
        <p
          className={cn(
            "font-semibold leading-none tracking-[-0.05em] text-[var(--joballa-fg)]",
            isWorkforce ? "text-[3rem] leading-[3rem]" : "text-[1.7rem] sm:text-[1.9rem]",
          )}
        >
          {value}
        </p>
        <p
          className={cn(
            "text-xs font-semibold",
            isWorkforce ? "pb-1 text-right" : "pb-1 font-medium sm:text-sm",
            hintTone === "positive"
              ? "text-[var(--joballa-primary)]"
              : hintTone === "negative"
                ? "text-[var(--joballa-danger-fg)]"
                : "text-[var(--joballa-muted)]",
          )}
        >
          {hint}
        </p>
      </div>
    </article>
  );
}

export function PortalCardLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cn(portalCardClass({ interactive: true }), "block", className)}>
      {children}
    </Link>
  );
}

export function PortalSectionCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={portalCardClass({ className: cn("p-5 sm:p-6", className) })}>
      <div className="max-w-3xl">
        <h2 className="text-lg font-semibold text-[var(--joballa-fg)]">{title}</h2>
        {description ? <p className="mt-1.5 text-sm leading-6 text-[var(--joballa-muted)]">{description}</p> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
