"use client";

import type { ReactNode } from "react";
import { LocaleSwitcher } from "@/components/navigation/locale-switcher";
import { IconSearch } from "@/components/worker/icons";
import { cn } from "@/lib/utils";

type Props = {
  title: ReactNode;
  searchPlaceholder?: string;
  showSearch?: boolean;
  rightExtra?: ReactNode;
  className?: string;
  /** When true, title is not forced to display-2xl (e.g. breadcrumbs + subline). */
  bareTitle?: boolean;
};

export function WorkerPortalHeader({
  title,
  searchPlaceholder,
  showSearch,
  rightExtra,
  className,
  bareTitle,
}: Props) {
  return (
    <header
      className={cn(
        "flex min-h-14 shrink-0 items-center justify-between gap-2 border-b border-[var(--joballa-border)] bg-[var(--joballa-header)] px-4 py-2.5 sm:min-h-16 sm:gap-3 sm:py-3 md:min-h-20 md:gap-4 md:px-8",
        className,
      )}
    >
      <div
        className={cn(
          "min-w-0",
          bareTitle ? "" : "text-lg font-extrabold leading-7 tracking-normal text-[var(--joballa-fg)] sm:text-xl sm:leading-8 md:text-2xl",
        )}
      >
        {title}
      </div>
      <div className="flex flex-1 items-center justify-end gap-3">
        {showSearch && searchPlaceholder ? (
          <label className="relative hidden max-w-md flex-1 md:block">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--joballa-muted)]">
              <IconSearch className="size-4" />
            </span>
            <input
              type="search"
              placeholder={searchPlaceholder}
              className="h-9 w-full rounded-[10px] border border-[var(--joballa-border)] bg-[var(--joballa-input-bg)] py-2 pl-9 pr-3 text-xs text-[var(--joballa-fg)] outline-none ring-[var(--joballa-primary)] placeholder:text-[var(--joballa-muted)] focus:ring-2 sm:h-10 sm:text-sm"
            />
          </label>
        ) : null}
        {rightExtra}
        <LocaleSwitcher variant="dark" align="end" />
      </div>
    </header>
  );
}
