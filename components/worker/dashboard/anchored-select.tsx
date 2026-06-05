"use client";

import { useEffect, useId, useRef, useState } from "react";
import { IconChevronDown } from "@/components/worker/icons";
import { cn } from "@/lib/utils";

export type AnchoredSelectOption = { value: string; label: string };

type Props = {
  value: string;
  options: readonly AnchoredSelectOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
  align?: "start" | "end";
};

export function AnchoredSelect({ value, options, onChange, ariaLabel, className, align = "end" }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = options.find((o) => o.value === value) ?? options[0];

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
    <div ref={rootRef} className={cn("relative isolate", className)}>
      <button
        type="button"
        className={cn(
          "inline-flex h-10 min-w-[9.5rem] max-w-full items-center justify-between gap-2 rounded-[14px] border-0 bg-transparent px-0 text-left text-sm font-semibold text-[var(--joballa-fg)] shadow-none outline-none transition hover:text-[var(--joballa-primary)] focus-visible:ring-2 focus-visible:ring-[var(--joballa-primary)]/35",
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="min-w-0 truncate">{current?.label}</span>
        <IconChevronDown className={cn("size-3.5 shrink-0 text-[var(--joballa-muted)] transition", open && "rotate-180")} />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          className={cn(
            "absolute top-full z-[80] mt-1.5 min-w-full overflow-hidden rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-dropdown-bg)] py-1 shadow-[0_8px_30px_rgba(0,0,0,0.08)]",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          {options.map((opt) => {
            const selected = opt.value === value;
            return (
              <li key={opt.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={cn(
                    "flex w-full items-center px-3 py-2.5 text-left text-sm font-medium transition",
                    selected
                      ? "bg-[var(--joballa-row-hover)] font-semibold text-[var(--joballa-primary)]"
                      : "text-[var(--joballa-fg)] hover:bg-[var(--joballa-row-hover)]",
                  )}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
