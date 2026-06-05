"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { useWorkerEngagements } from "@/features/worker/hooks";
import { workerJobCardFromApi } from "@/features/worker/lib/job-mappers";
import { JoballaApiError } from "@/lib/joballa/request";
import { WorkerApplicationsPageSkeleton } from "@/components/worker/worker-loading-skeletons";
import { cn } from "@/lib/utils";

type TabKey = "all" | "ACTIVE" | "COMPLETED" | "TERMINATED";

export function WorkerEngagementsView() {
  const t = useTranslations("worker.engagements");
  const [tab, setTab] = useState<TabKey>("all");
  const query = useWorkerEngagements({
    limit: 50,
    status: tab === "all" ? undefined : tab,
  });

  const rows = useMemo(() => query.data?.items ?? [], [query.data?.items]);

  if (query.isLoading) {
    return <WorkerApplicationsPageSkeleton />;
  }

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-4 bg-[var(--joballa-page-tint)] sm:gap-5 md:gap-6">
      <header>
        <h1 className="text-2xl font-bold text-[var(--joballa-fg)]">{t("title")}</h1>
        <p className="mt-2 text-sm text-[var(--joballa-muted)]">{t("description")}</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {(["all", "ACTIVE", "COMPLETED", "TERMINATED"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition",
              tab === key
                ? "border-[var(--joballa-primary)] bg-[var(--joballa-primary)] text-white"
                : "border-[var(--joballa-border)] bg-[var(--joballa-card)] text-[var(--joballa-muted)]",
            )}
          >
            {t(`tabs.${key}`)}
          </button>
        ))}
      </div>

      {query.isError ? (
        <p className="rounded-[14px] border border-dashed border-[var(--joballa-empty-border)] bg-[var(--joballa-empty-bg)] px-6 py-10 text-center text-sm text-[var(--joballa-muted)]">
          {query.error instanceof JoballaApiError ? query.error.message : t("loadError")}
        </p>
      ) : rows.length === 0 ? (
        <p className="rounded-[14px] border border-dashed border-[var(--joballa-empty-border)] bg-[var(--joballa-empty-bg)] px-6 py-10 text-center text-sm text-[var(--joballa-muted)]">
          {t("empty")}
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((eng) => {
            const job = eng.job ? workerJobCardFromApi(eng.job) : null;
            const employer = eng.employer?.companyName ?? eng.employer?.name ?? job?.company ?? "";
            const title = job?.title ?? "";
            return (
              <li
                key={eng.id}
                className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-4 shadow-[var(--joballa-shadow-card)] sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    {title ? (
                      <p className="text-lg font-semibold text-[var(--joballa-fg)]">{title}</p>
                    ) : null}
                    {employer ? <p className="mt-1 text-sm text-[var(--joballa-muted)]">{employer}</p> : null}
                  </div>
                  <span className="rounded-full bg-[var(--joballa-tag-bg)] px-3 py-1 text-xs font-semibold text-[var(--joballa-tag-fg)]">
                    {String(eng.status)}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-4">
                  <Link
                    href={`/worker/engagements/${String(eng.engagementId ?? eng.id)}`}
                    className="text-sm font-semibold text-[var(--joballa-primary)] hover:underline"
                  >
                    {t("detail.view")}
                  </Link>
                  {job ? (
                    <Link
                      href={`/worker/jobs/${job.slug}`}
                      className="text-sm font-semibold text-[var(--joballa-muted)] hover:underline"
                    >
                      {t("viewJob")}
                    </Link>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
