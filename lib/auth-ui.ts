import { cn } from "@/lib/utils";

/** Figma auth inputs: 48px height, 12px radius — colors from `app/globals.css` (--auth-*). */
export const authInputClassName = cn(
  "h-12 w-full rounded-xl border px-3 text-sm outline-none transition",
  "border-[color:var(--auth-border)] bg-[color:var(--auth-surface)] text-[color:var(--auth-fg)]",
  "placeholder:text-[color:var(--auth-placeholder-fg)]",
  "shadow-[var(--auth-shadow-input)]",
  "focus:border-[color:var(--auth-focus-border)] focus:ring-2 focus:ring-[color:var(--auth-focus-ring)]",
);

export const authInputErrorClassName = cn(
  "border-[color:var(--auth-danger-border)] bg-[color:var(--auth-danger-surface)] text-[color:var(--auth-danger-fg-input)]",
  "placeholder:text-[color:var(--auth-danger-fg-input)]",
  "focus:border-[color:var(--auth-danger-fg-input)] focus:ring-[color:var(--auth-danger-border)]",
);

export const authLabelClassName =
  "px-1 text-xs font-medium leading-4 text-[color:var(--auth-fg-muted)]";

/** Page title — scales with viewport; left on mobile, centered from `lg`. */
export const authTitleClassName = cn(
  "font-bold leading-tight tracking-tight",
  "text-[clamp(1.75rem,4.5vw+0.75rem,3rem)]",
  "text-left lg:text-center",
);

/** Intro / description under the title. */
export const authLeadClassName = cn(
  "text-base font-medium leading-6 text-[color:var(--auth-fg-muted)]",
  "text-left lg:text-center",
);

/** Secondary body copy (legal, footer links). */
export const authFooterTextClassName = cn(
  "text-sm leading-5 text-[color:var(--auth-fg-subtle)]",
  "text-left lg:text-center",
);

export const authPrimaryButtonClassName = cn(
  "inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-xl px-3 text-sm font-medium shadow-[var(--auth-shadow-button)]",
  "bg-[color:var(--auth-primary)] text-[color:var(--auth-on-primary)]",
  "transition hover:opacity-[0.96] focus:outline-none focus:ring-2 focus:ring-[color:var(--auth-focus-ring-button)] disabled:opacity-50",
);

export const authOutlineButtonClassName = cn(
  "inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 text-sm font-medium shadow-[var(--auth-shadow-button)]",
  "border-[color:var(--auth-border)] bg-[color:var(--auth-surface)] text-[color:var(--auth-fg)]",
  "transition hover:bg-[color:var(--auth-outline-hover)] focus:outline-none focus:ring-2 focus:ring-[color:var(--auth-border-strong)] disabled:opacity-50",
);

export const authLinkClassName =
  "font-medium text-[color:var(--auth-link)] underline underline-offset-2 decoration-from-font hover:opacity-90";

/** Inline auth links that should read as secondary body text (e.g. Forgot password?), not brand primary. */
export const authSecondaryLinkClassName =
  "font-medium text-[color:var(--auth-fg-muted)] underline underline-offset-2 decoration-from-font hover:opacity-90";

/** Inline form error — text only (no box). */
export const authBannerErrorClassName = cn(
  "px-1 text-sm font-medium leading-5 text-[color:var(--auth-danger-fg)]",
  "text-left lg:text-center",
);

export const authBannerSuccessClassName =
  "rounded-xl border border-[color:var(--auth-success-border)] bg-[color:var(--auth-success-surface)] px-3 py-2.5 text-sm text-[color:var(--auth-success-fg)]";
