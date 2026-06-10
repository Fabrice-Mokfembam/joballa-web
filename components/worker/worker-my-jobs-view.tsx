"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { JobPostingCard } from "@/components/job-posting/job-posting-card";
import { portalPageShellClass } from "@/components/portal/portal-ui";
import { buttonClassName } from "@/components/ui/button";
import { IconPlus } from "@/components/worker/icons";
import { useWorkerMe, useWorkerOwnedJobs } from "@/features/worker/hooks";
import { profileInitials } from "@/features/worker/lib/profile-display";
import { WorkerApplicationsPageSkeleton } from "@/components/worker/worker-loading-skeletons";
import { cn } from "@/lib/utils";

function formatPosted(iso?: string): string {
  if (!iso) return "";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days < 1) return "today";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

const JOB_STATUS_KEYS = ["draft", "under_review", "live", "paused", "closed"] as const;

function formatJobStatus(status: string, t: ReturnType<typeof useTranslations>): string {
  const key = status.toLowerCase();
  if ((JOB_STATUS_KEYS as readonly string[]).includes(key)) {
    return t(`status.${key as (typeof JOB_STATUS_KEYS)[number]}`);
  }
  return status.replace(/_/g, " ");
}

export function WorkerMyJobsView() {
  const t = useTranslations("worker.myJobs");
  const meQuery = useWorkerMe();
  const jobsQuery = useWorkerOwnedJobs({ page: 1, limit: 50 });
  const jobs = useMemo(() => jobsQuery.data?.items ?? [], [jobsQuery.data?.items]);
  const wp = meQuery.data?.workerProfile;
  const posterName =
    wp?.fullName?.trim() || meQuery.data?.email || t("title");
  const posterAvatarUrl = wp?.avatarUrl ?? null;
  const posterInitial = profileInitials(posterName);

  if (jobsQuery.isLoading) return <WorkerApplicationsPageSkeleton />;

  return (
    <div className={portalPageShellClass}>
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h1 className="min-w-0 text-lg font-semibold text-[var(--joballa-fg)] sm:text-xl">{t("title")}</h1>
          <Link
            href="/worker/jobs/new"
            className={cn(buttonClassName("primary"), "inline-flex shrink-0 gap-2 text-sm")}
          >
            <IconPlus className="size-4" />
            {t("postJob")}
          </Link>
        </div>
        <p className="text-sm text-[var(--joballa-muted)]">{t("description")}</p>
      </header>

      {jobs.length === 0 ? (
        <p className="rounded-[14px] border border-[var(--joballa-border)] bg-white px-6 py-10 text-center text-sm text-[var(--joballa-muted)]">
          {t("empty")}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobPostingCard
              key={job.jobId}
              postedLabel={formatPosted(job.postedAt)}
              title={job.title}
              scheduleLabel={job.jobType ?? ""}
              locationLabel={job.location ?? ""}
              pillTags={[formatJobStatus(String(job.status ?? ""), t), job.salary ?? ""].filter(Boolean)}
              companyName={posterName}
              companyLogoUrl={posterAvatarUrl}
              companyInitial={posterAvatarUrl ? undefined : posterInitial}
              companyAvatarClassName="bg-[var(--joballa-primary)]"
              bookmarkLabel={t("bookmark")}
              applyLabel={t("manage")}
              showApply={false}
              moreMenuAriaLabel={t("menu")}
              titleHref={`/worker/my-jobs?job=${encodeURIComponent(job.jobId)}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
