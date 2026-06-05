"use client";

import type { EmployerWorkforceStatus } from "@/features/employer/types/employer-portal";
import { cn } from "@/lib/utils";

export function EmployerWorkforceStatusBadge({
  status,
  label,
}: {
  status: EmployerWorkforceStatus | string;
  label: string;
}) {
  const isActive = status === "active";
  const tone = isActive
    ? "border-[var(--joballa-jade-4)] bg-[var(--joballa-jade-3)] text-[var(--joballa-primary)]"
    : "border-[var(--joballa-danger-border)] bg-[var(--joballa-danger-soft)] text-[var(--joballa-danger-fg)]";

  return (
    <span
      className={cn(
        "inline-flex w-full shrink-0 items-center justify-center rounded-full border px-2 py-0.5 text-xs font-semibold capitalize",
        tone,
      )}
    >
      {label}
    </span>
  );
}
