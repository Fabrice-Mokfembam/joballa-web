"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { useWorkerEngagement } from "@/features/worker/hooks";
import { workerJobCardFromApi } from "@/features/worker/lib/job-mappers";
import { WorkerApplicationsPageSkeleton } from "@/components/worker/worker-loading-skeletons";
import { IconChevronLeft } from "@/components/worker/icons";
import { JoballaApiError } from "@/lib/joballa/request";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function WorkerEngagementDetailPage({ engagementId }: { engagementId: string }) {
  const t = useTranslations("worker.engagements");
  const query = useWorkerEngagement(engagementId);

  const job = useMemo(() => {
    const raw = query.data?.job;
    return raw ? workerJobCardFromApi(raw) : null;
  }, [query.data?.job]);

  const employer =
    query.data?.employer?.companyName ??
    query.data?.employer?.name ??
    job?.company ??
    "";

  if (query.isLoading) return <WorkerApplicationsPageSkeleton />;

  if (query.isError || !query.data) {
    return (
      <div className="space-y-6">
        <Link
          href="/worker/engagements"
          className="inline-flex items-center gap-2 text-lg font-semibold text-[var(--joballa-muted)]"
        >
          <IconChevronLeft className="size-5" />
          {t("title")}
        </Link>
        <p className="rounded-[14px] border border-dashed border-[var(--joballa-empty-border)] bg-[var(--joballa-empty-bg)] px-6 py-10 text-center text-sm text-[var(--joballa-muted)]">
          {query.error instanceof JoballaApiError ? query.error.message : t("loadError")}
        </p>
      </div>
    );
  }

  const eng = query.data;
  const title = job?.title ?? String((eng as { jobTitle?: string }).jobTitle ?? "");

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-4 bg-[var(--joballa-page-tint)] sm:gap-5 md:gap-6">
      <Link
        href="/worker/engagements"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--joballa-muted)] hover:text-[var(--joballa-fg)]"
      >
        <IconChevronLeft className="size-5" />
        {t("title")}
      </Link>

      <header className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-5 shadow-[var(--joballa-shadow-card)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            {title ? <h1 className="text-2xl font-bold text-[var(--joballa-fg)]">{title}</h1> : null}
            {employer ? <p className="mt-1 text-sm text-[var(--joballa-muted)]">{employer}</p> : null}
          </div>
          <span className="rounded-full bg-[var(--joballa-tag-bg)] px-3 py-1 text-xs font-semibold text-[var(--joballa-tag-fg)]">
            {String(eng.status)}
          </span>
        </div>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-[var(--joballa-fg)]">{t("detail.started")}</dt>
            <dd className="text-[var(--joballa-muted)]">{formatDate(String(eng.startedAt ?? ""))}</dd>
          </div>
          {job ? (
            <div>
              <dt className="font-semibold text-[var(--joballa-fg)]">{t("viewJob")}</dt>
              <dd>
                <Link href={`/worker/jobs/${job.slug}`} className="font-semibold text-[var(--joballa-primary)] hover:underline">
                  {job.title}
                </Link>
              </dd>
            </div>
          ) : null}
        </dl>
      </header>
    </div>
  );
}
