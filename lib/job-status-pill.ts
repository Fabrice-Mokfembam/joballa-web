import { cn } from "@/lib/utils";

export function jobStatusPillClass(status: string): string {
  const normalized = status.trim().toLowerCase().replace(/\s+/g, "_");
  return cn(
    "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold leading-4",
    (normalized === "draft" || normalized === "pending_review") &&
      "bg-[var(--joballa-tag-bg)] text-[var(--joballa-muted)]",
    (normalized === "under_review" || normalized === "pending") &&
      "bg-[var(--joballa-highlight-bg)] text-[var(--joballa-highlight-fg)]",
    (normalized === "live" || normalized === "active") &&
      "bg-[var(--joballa-jade-3)] text-[var(--joballa-primary)]",
    (normalized === "paused" || normalized === "suspended") &&
      "bg-[var(--joballa-danger-bg)] text-[var(--joballa-danger-fg)]",
    normalized === "closed" && "bg-[var(--joballa-tag-bg)] text-[var(--joballa-fg-subtle)]",
  );
}
