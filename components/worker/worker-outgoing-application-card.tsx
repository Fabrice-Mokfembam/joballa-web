"use client";

import Image from "next/image";
import type { WorkerApplicationRow } from "@/lib/worker-applications-data";
import { cn } from "@/lib/utils";

/** Figma `ApplicationCard` (node 91:4696) — worker outgoing application preview. */
export type WorkerOutgoingApplicationCardProps = {
  app: WorkerApplicationRow;
  statusLabel: string;
  appliedLabel: string;
  className?: string;
  isActive?: boolean;
};

function statusBadgeClass(status: WorkerApplicationRow["status"]) {
  switch (status) {
    case "shortlisted":
      return "border border-[var(--joballa-jade-4)] bg-[var(--joballa-jade-3)] text-[var(--joballa-primary)]";
    case "pending":
      return "border border-[var(--joballa-pill-border)] bg-[var(--joballa-pill-bg)] text-[var(--joballa-muted)]";
    case "rejected":
      return "border border-[var(--joballa-danger-border)] bg-[var(--joballa-danger-soft)] text-[var(--joballa-danger-fg)]";
    default:
      return "border border-[var(--joballa-pill-border)] bg-[var(--joballa-pill-bg)] text-[var(--joballa-muted)]";
  }
}

function CompanyMark({ app }: { app: WorkerApplicationRow }) {
  if (app.companyLogoUrl) {
    return (
      <Image
        src={app.companyLogoUrl}
        alt=""
        width={24}
        height={24}
        unoptimized={app.companyLogoUrl.startsWith("http")}
        className="size-6 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-black text-[10px] font-bold text-white">
      {app.companyInitial || "J"}
    </span>
  );
}

export function WorkerOutgoingApplicationCard({
  app,
  statusLabel,
  appliedLabel,
  className,
  isActive,
}: WorkerOutgoingApplicationCardProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-2 rounded-[14px] border border-[var(--joballa-pill-border)] bg-[var(--joballa-card)] p-[14px] shadow-[var(--joballa-shadow-card)]",
        isActive && "border-2 border-[var(--joballa-jade-8)] bg-[var(--joballa-row-selected)] shadow-none",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3.5">
        <h2 className="min-w-0 text-lg font-semibold leading-7 text-[var(--joballa-fg)]">{app.jobTitle}</h2>
        <span
          className={cn(
            "shrink-0 rounded-[26px] px-2 py-0.5 text-xs font-semibold leading-4",
            statusBadgeClass(app.status),
          )}
        >
          {statusLabel}
        </span>
      </div>
      <div className="flex h-7 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <CompanyMark app={app} />
          <span className="truncate text-sm font-semibold leading-5 text-[var(--joballa-muted)]">{app.company}</span>
        </div>
        <span className="shrink-0 text-xs font-normal leading-4 text-[var(--joballa-muted)]">{appliedLabel}</span>
      </div>
    </div>
  );
}
