"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { JobPostingCard } from "@/components/job-posting/job-posting-card";
import { portalPageShellClass } from "@/components/portal/portal-ui";
import { useWorkerOwnedJobs } from "@/features/worker/hooks";
import { WorkerApplicationsPageSkeleton } from "@/components/worker/worker-loading-skeletons";

function formatPosted(iso?: string): string {
  if (!iso) return "";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days < 1) return "today";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export function WorkerMyJobsView() {
  const t = useTranslations("worker.myJobs");
  const jobsQuery = useWorkerOwnedJobs({ page: 1, limit: 50 });
  const jobs = useMemo(() => jobsQuery.data?.items ?? [], [jobsQuery.data?.items]);

  if (jobsQuery.isLoading) return <WorkerApplicationsPageSkeleton />;

  return (
    <div className={portalPageShellClass}>
      <div>
        <div>
          <h1 className="text-lg font-semibold text-[var(--joballa-fg)] sm:text-xl">{t("title")}</h1>
          <p className="mt-1 text-sm text-[var(--joballa-muted)]">{t("description")}</p>
        </div>
      </div>

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
              pillTags={[job.status, job.salary ?? ""].filter(Boolean)}
              companyName={t("title")}
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

      <Link href="/worker/jobs/new" className="inline-flex text-sm font-semibold text-[var(--joballa-primary)] hover:underline">
        {t("postJob")}
      </Link>
    </div>
  );
}
