"use client";

import type { ReactNode } from "react";
import { IconChevronDown } from "@/components/worker/icons";
import { cn } from "@/lib/utils";

export type JobFilterOption = { value: string; label: string };

type Tone = "default" | "toolbar";

export function WorkerJobFilterDropdown({
  label,
  valueLabel,
  options,
  icon,
  open,
  onToggle,
  onPick,
  tone = "default",
}: {
  label: string;
  valueLabel: string;
  options: readonly JobFilterOption[];
  icon: ReactNode;
  open: boolean;
  onToggle: () => void;
  onPick: (value: string) => void;
  /** `toolbar`: Figma saved-jobs row — white pill, 44px, xs type. */
  tone?: Tone;
}) {
  const triggerTone =
    tone === "toolbar"
      ? "h-11 min-h-[44px] gap-2 rounded-[14px] border border-[#e5e5e5] bg-white px-3 text-xs font-medium text-[#737373] shadow-none"
      : "h-10 gap-2 rounded-[10px] border border-[var(--joballa-border)] bg-[var(--joballa-input-bg)] px-3 text-sm font-medium text-[var(--joballa-fg)]";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={cn("flex shrink-0 items-center outline-none ring-[var(--joballa-primary)] focus-visible:ring-2", triggerTone)}
      >
        <span className={tone === "toolbar" ? "text-[#737373]" : "text-[var(--joballa-muted)]"}>{icon}</span>
        <span className="max-w-[120px] truncate sm:max-w-[160px]">{valueLabel || label}</span>
        <IconChevronDown className={cn("size-4 shrink-0", tone === "toolbar" ? "text-[#737373]" : "text-[var(--joballa-muted)]")} />
      </button>
      {open ? (
        <>
          <button type="button" className="fixed inset-0 z-10 cursor-default bg-transparent" aria-hidden onClick={onToggle} />
          <ul className="absolute left-0 z-20 mt-1 max-h-56 min-w-[180px] overflow-auto rounded-lg border border-[var(--joballa-border)] bg-[var(--joballa-dropdown-bg)] py-1 text-sm shadow-md">
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left hover:bg-[var(--joballa-row-hover)]"
                  onClick={() => {
                    onPick(opt.value);
                    onToggle();
                  }}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
