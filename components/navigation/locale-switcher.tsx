"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, ChevronDown, Globe2 } from "lucide-react";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { routing } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";

type Props = {
  variant?: "dark" | "light";
  /** Panel horizontal alignment under the trigger (`end` = align to trigger’s right edge). */
  align?: "start" | "end";
  className?: string;
};

export function LocaleSwitcher({ variant = "dark", align = "end", className }: Props) {
  const t = useTranslations("localeSwitcher");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const isLight = variant === "light";

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const triggerBase =
    "inline-flex h-11 shrink-0 items-center gap-4 rounded-full text-sm font-remixa font-medium leading-none outline-none transition focus-visible:ring-2";

  const triggerTone = isLight
    ? cn(
        "border border-[color:var(--auth-border)] bg-[color:var(--auth-surface)] px-4 text-[color:var(--auth-fg)] shadow-[var(--auth-shadow-button)]",
        "hover:bg-[color:var(--auth-outline-hover)] focus-visible:ring-[color:var(--auth-focus-ring)]",
      )
    : cn(
        "px-1 text-[var(--joballa-fg)]",
        "hover:opacity-90 focus-visible:ring-[var(--joballa-primary)]/35",
      );

  const panelTone = isLight
    ? "border-[color:var(--auth-border)] bg-[color:var(--auth-surface)] shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
    : "border-[var(--joballa-border)] bg-[var(--joballa-dropdown-bg)] shadow-[0_8px_30px_rgba(0,0,0,0.08)]";

  const itemRow =
    "flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left text-sm font-remixa transition outline-none focus-visible:ring-2 focus-visible:ring-inset";

  const itemIdle = isLight
    ? "text-[color:var(--auth-fg-muted)] hover:bg-[color:var(--auth-outline-hover)] hover:text-[color:var(--auth-fg)] focus-visible:ring-[color:var(--auth-focus-ring)]"
    : "text-[var(--joballa-muted)] hover:bg-[var(--joballa-row-hover)] hover:text-[var(--joballa-fg)] focus-visible:ring-[var(--joballa-primary)]/25";

  const itemActive = isLight
    ? "bg-[color:var(--auth-outline-hover)] font-semibold text-[color:var(--auth-primary)] focus-visible:ring-[color:var(--auth-focus-ring)]"
    : "bg-[var(--joballa-row-hover)] font-semibold text-[var(--joballa-primary)] focus-visible:ring-[var(--joballa-primary)]/25";

  const checkMuted = isLight ? "text-[color:var(--auth-primary)]" : "text-[var(--joballa-primary)]";

  return (
    <div ref={rootRef} className={cn("relative isolate", className)}>
      <button
        type="button"
        className={cn(triggerBase, triggerTone)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        id={`${menuId}-trigger`}
        onClick={() => setOpen((o) => !o)}
      >
        <Globe2 className="size-[18px] shrink-0 opacity-90" aria-hidden strokeWidth={1.7} />
        <span className="whitespace-nowrap" translate="no">
          {t(`localeNames.${locale}`)}
        </span>
        <ChevronDown
          className={cn("size-3.5 shrink-0 opacity-75 transition-transform", open && "rotate-180")}
          aria-hidden
          strokeWidth={2}
        />
        <span className="sr-only">{t("chooseLanguage")}</span>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-labelledby={`${menuId}-trigger`}
          className={cn(
            "absolute top-full z-[100] mt-1.5 min-w-full overflow-hidden rounded-[14px] border p-1",
            align === "end" ? "right-0" : "left-0",
            panelTone,
          )}
        >
          {routing.locales.map((nextLocale) => {
            const active = locale === nextLocale;
            return (
              <Link
                key={nextLocale}
                href={pathname}
                locale={nextLocale}
                role="menuitem"
                className={cn(itemRow, active ? itemActive : itemIdle)}
                onClick={() => setOpen(false)}
              >
                <span className="flex size-4 shrink-0 items-center justify-center" aria-hidden>
                  {active ? <Check className={checkMuted} aria-hidden strokeWidth={2} /> : null}
                </span>
                <span className="flex-1" translate="no">
                  {t(`localeNames.${nextLocale}`)}
                </span>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
