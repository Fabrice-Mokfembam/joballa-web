"use client";

import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

type ProfileSectionEmptyProps = {
  message: string;
  actionLabel: string;
  actionHref: string;
  className?: string;
};

/** Empty profile section with a Verify-KYC-style action button. */
export function ProfileSectionEmpty({ message, actionLabel, actionHref, className }: ProfileSectionEmptyProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm text-[var(--joballa-fg-subtle)]">{message}</p>
      <Link
        href={actionHref}
        className="inline-flex min-h-8 items-center justify-center gap-1 rounded-[10px] border border-dashed border-[var(--joballa-primary)] bg-transparent px-3 text-xs font-semibold text-[var(--joballa-primary)] outline-none ring-[var(--joballa-primary)] transition hover:bg-[var(--joballa-jade-3)] focus-visible:ring-2"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
