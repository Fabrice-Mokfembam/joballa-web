"use client";

import { cn } from "@/lib/utils";

type WorkerCategoryChipsProps = {
  slugs: readonly string[];
  selected: Set<string>;
  onToggle: (slug: string) => void;
  labelForSlug: (slug: string) => string;
};

export function WorkerCategoryChips({ slugs, selected, onToggle, labelForSlug }: WorkerCategoryChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {slugs.map((slug) => {
        const on = selected.has(slug);
        return (
          <button
            key={slug}
            type="button"
            onClick={() => onToggle(slug)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition",
              on
                ? "border-[color:var(--auth-primary)] bg-[color:var(--auth-pill-active-bg)] text-[color:var(--auth-pill-active-fg)]"
                : "border-[color:var(--auth-border)] bg-[color:var(--auth-page-bg)] text-[color:var(--auth-pill-inactive-fg)] hover:bg-[color:var(--auth-outline-hover)]",
            )}
          >
            {labelForSlug(slug)}
          </button>
        );
      })}
    </div>
  );
}
