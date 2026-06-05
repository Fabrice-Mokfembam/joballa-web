"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { routing } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** `inline`: text-style switch for the top bar. `pill` (default): bordered segment control. */
  variant?: "pill" | "inline";
};

export function WorkerLangToggle({ className, variant = "pill" }: Props) {
  const locale = useLocale();
  const pathname = usePathname();

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2.5", className)}>
        {routing.locales.map((loc) => {
          const active = locale === loc;
          const label = loc === "en" ? "ENG" : "FRE";
          return (
            <Link
              key={loc}
              href={pathname}
              locale={loc}
              className={cn(
                "text-sm font-semibold tracking-wide transition-colors",
                active
                  ? "text-[var(--joballa-primary)]"
                  : "font-medium text-[var(--joballa-muted)] hover:text-neutral-700",
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center rounded-[10px] border border-[var(--joballa-border)] p-1",
        className,
      )}
    >
      {routing.locales.map((loc) => {
        const active = locale === loc;
        const label = loc === "en" ? "ENG" : "FRE";
        return (
          <Link
            key={loc}
            href={pathname}
            locale={loc}
            className={cn(
              "rounded-md px-2 py-1 text-xs font-bold tracking-normal transition-colors",
              active
                ? "bg-[var(--joballa-primary)] text-[var(--joballa-on-primary)]"
                : "font-medium text-[var(--joballa-muted)] hover:text-[var(--joballa-fg)]",
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
