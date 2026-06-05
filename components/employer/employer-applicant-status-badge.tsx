"use client";

import type { EmployerApplicantStatus } from "@/features/employer/types/employer-portal";
import { cn } from "@/lib/utils";

export function EmployerApplicantStatusBadge({
  status,
  label,
}: {
  status: EmployerApplicantStatus | string;
  label: string;
}) {
  const tone =
    status === "shortlisted"
      ? "bg-[var(--joballa-jade-3)] text-[var(--joballa-primary)]"
      : status === "rejected"
        ? "bg-[var(--joballa-danger-bg)] text-[var(--joballa-danger-fg)]"
        : status === "hired"
          ? "bg-[var(--joballa-jade-3)] text-[var(--joballa-primary)]"
          : "bg-[var(--joballa-tag-bg)] text-[var(--joballa-muted)]";

  return (
    <span className={cn("inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize", tone)}>
      {label}
    </span>
  );
}
