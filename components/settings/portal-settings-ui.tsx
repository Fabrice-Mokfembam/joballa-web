"use client";

import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

export function SettingsIcon({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-12 shrink-0 items-center justify-center rounded-[8px] bg-[var(--joballa-jade-3)] text-[var(--joballa-primary)]">
      {children}
    </span>
  );
}

export function SettingsToggle({ enabled }: { enabled?: boolean }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition",
        enabled ? "bg-[var(--joballa-primary)]" : "bg-[var(--joballa-border)]",
      )}
      aria-hidden
    >
      <span
        className={cn(
          "absolute size-6 rounded-full bg-[var(--joballa-card)] shadow-[0_1px_2px_rgba(0,0,0,0.22)] transition",
          enabled ? "right-0.5" : "left-0.5",
        )}
      />
    </span>
  );
}

export function SettingsToggleRow({
  icon,
  title,
  description,
  enabled,
  onChange,
  disabled,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  enabled?: boolean;
  onChange?: (enabled: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid items-center gap-4 border-t border-[var(--joballa-border)] py-5 first:border-t-0 first:pt-0 last:pb-0",
        icon ? "grid-cols-[48px_minmax(0,1fr)_auto]" : "grid-cols-[minmax(0,1fr)_auto]",
      )}
    >
      {icon ? <SettingsIcon>{icon}</SettingsIcon> : null}
      <div className="min-w-0">
        <h3 className="text-sm font-bold leading-6 text-[var(--joballa-fg)]">{title}</h3>
        <p className="mt-0.5 text-sm leading-5 text-[var(--joballa-muted)]">{description}</p>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange?.(!enabled)}
        className="rounded-full outline-none ring-[var(--joballa-primary)] focus-visible:ring-2 disabled:opacity-60"
        aria-pressed={enabled}
      >
        <SettingsToggle enabled={enabled} />
      </button>
    </div>
  );
}

export function SettingsSectionHeader({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 grid grid-cols-[48px_minmax(0,1fr)] items-center gap-4">
      <SettingsIcon>{icon}</SettingsIcon>
      <div>
        <h2 className="text-lg font-bold leading-7 text-[var(--joballa-fg)]">{title}</h2>
        <p className="mt-1 text-sm leading-5 text-[var(--joballa-muted)]">{description}</p>
      </div>
    </div>
  );
}

export function SettingsSelectControl({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block min-w-0">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-[8px] border border-[var(--joballa-border)] bg-[var(--joballa-input-bg)] px-3 text-sm font-medium text-[var(--joballa-fg)] outline-none ring-[var(--joballa-primary)] transition focus-visible:ring-2"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SettingsActionLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon?: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "grid items-center gap-4 border-t border-[var(--joballa-border)] py-5 outline-none ring-[var(--joballa-primary)] transition first:border-t-0 first:pt-0 last:pb-0 hover:bg-[var(--joballa-row-hover)] focus-visible:ring-2",
        icon ? "grid-cols-[48px_minmax(0,1fr)_auto]" : "grid-cols-[minmax(0,1fr)_auto]",
      )}
    >
      {icon ? <SettingsIcon>{icon}</SettingsIcon> : null}
      <div className="min-w-0">
        <h3 className="text-sm font-bold leading-6 text-[var(--joballa-fg)]">{title}</h3>
        <p className="mt-0.5 text-sm leading-5 text-[var(--joballa-muted)]">{description}</p>
      </div>
      {icon ? <ChevronRight className="size-5 text-[var(--joballa-muted)]" aria-hidden strokeWidth={1.8} /> : null}
    </Link>
  );
}
