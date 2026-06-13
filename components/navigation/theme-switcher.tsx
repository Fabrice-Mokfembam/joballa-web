"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Palette } from "lucide-react";
import { useTranslations } from "next-intl";
import { useJoballaTheme } from "@/components/providers/joballa-theme-provider";
import type { JoballaThemeChoice } from "@/lib/theme/joballa-theme";
import { cn } from "@/lib/utils";

const THEME_OPTIONS: JoballaThemeChoice[] = ["system", "light", "dark"];

type Props = {
  className?: string;
};

export function ThemeSwitcher({ className }: Props) {
  const t = useTranslations("worker.settings.appearance.options");
  const { theme, setTheme } = useJoballaTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

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

  return (
    <div ref={rootRef} className={cn("relative isolate shrink-0", className)}>
      <button
        type="button"
        className={cn(
          "inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-[color:var(--auth-border)] bg-[color:var(--auth-surface)] px-4 text-sm font-remixa font-medium leading-none text-[color:var(--auth-fg)] shadow-[var(--auth-shadow-button)] outline-none transition",
          "hover:bg-[color:var(--auth-outline-hover)] focus-visible:ring-2 focus-visible:ring-[color:var(--auth-focus-ring)]",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        id={`${menuId}-trigger`}
        onClick={() => setOpen((value) => !value)}
      >
        <Palette className="size-[18px] shrink-0 opacity-90" aria-hidden strokeWidth={1.7} />
        <span className="whitespace-nowrap">{t(theme)}</span>
        <ChevronDown
          className={cn("size-3.5 shrink-0 opacity-75 transition-transform", open && "rotate-180")}
          aria-hidden
          strokeWidth={2}
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-labelledby={`${menuId}-trigger`}
          className="absolute top-full right-0 z-[100] mt-1.5 min-w-full overflow-hidden rounded-[14px] border border-[color:var(--auth-border)] bg-[color:var(--auth-surface)] p-1 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
        >
          {THEME_OPTIONS.map((option) => {
            const active = theme === option;
            return (
              <button
                key={option}
                type="button"
                role="menuitem"
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left text-sm font-remixa transition outline-none focus-visible:ring-2 focus-visible:ring-inset",
                  active
                    ? "bg-[color:var(--auth-outline-hover)] font-semibold text-[color:var(--auth-primary)] focus-visible:ring-[color:var(--auth-focus-ring)]"
                    : "text-[color:var(--auth-fg-muted)] hover:bg-[color:var(--auth-outline-hover)] hover:text-[color:var(--auth-fg)] focus-visible:ring-[color:var(--auth-focus-ring)]",
                )}
                onClick={() => {
                  setTheme(option);
                  setOpen(false);
                }}
              >
                <span className="flex size-4 shrink-0 items-center justify-center" aria-hidden>
                  {active ? <Check className="text-[color:var(--auth-primary)]" aria-hidden strokeWidth={2} /> : null}
                </span>
                <span className="flex-1 whitespace-nowrap">{t(option)}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
