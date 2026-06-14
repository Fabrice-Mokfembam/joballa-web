"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useWorkerJob } from "@/features/worker/hooks";
import { workerJobCardFromApi } from "@/features/worker/lib/job-mappers";
import { WorkerJobDetailLgRedirect } from "@/components/worker/worker-job-detail-lg-redirect";
import { WorkerJobDetailView } from "@/components/worker/worker-job-detail-view";
import { WorkerJobDetailPageSkeleton } from "@/components/worker/worker-loading-skeletons";
import { JoballaApiError } from "@/lib/joballa/request";
import { Link } from "@/lib/i18n/navigation";

export function WorkerJobDetailPage({ jobId }: { jobId: string }) {
  const t = useTranslations("worker.findJobsPage");
  const query = useWorkerJob(jobId);

  const job = useMemo(() => {
    if (!query.data) return null;
    return workerJobCardFromApi(query.data);
  }, [query.data]);

  if (query.isLoading && !query.data) {
    return <WorkerJobDetailPageSkeleton />;
  }

  if (query.isError || !job) {
    const message =
      query.error instanceof JoballaApiError ? query.error.message : t("loadError");
    return (
      <div className="flex min-h-[40vh] flex-1 flex-col items-center justify-center gap-4 bg-[var(--joballa-page-tint)] px-4 py-10 text-center">
        <p className="text-sm text-[var(--joballa-muted)]">{message}</p>
        <Link href="/worker/jobs" className="text-sm font-semibold text-[var(--joballa-primary)] hover:underline">
          {t("backToJobs")}
        </Link>
      </div>
    );
  }

  return (
    <>
      <WorkerJobDetailLgRedirect jobSlug={job.slug} />
      <WorkerJobDetailView
        job={job}
        jobId={jobId}
        isSaved={!!(query.data?.saved ?? query.data?.isSaved)}
        detail={query.data}
      />
    </>
  );
}
