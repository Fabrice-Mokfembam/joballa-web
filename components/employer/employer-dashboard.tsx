"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { EmployerAsyncState } from "@/components/employer/employer-async-state";
import { EmployerApplicantListCard, applicantId } from "@/components/employer/employer-applicant-list-card";
import { formatStatHint, formatStatValue } from "@/features/employer/lib/applicant-helpers";
import { formatAppliedAgo } from "@/features/employer/lib/applicant-profile";
import { useEmployerApplicants, useEmployerDashboard } from "@/features/employer/hooks";
import { IconGrid, IconList } from "@/components/worker/icons";
import {
  PortalCardLink,
  portalPageShellClass,
  portalSegmentButtonClass,
  portalSegmentGroupClass,
  PortalStatCard,
  portalStatGridClass,
} from "@/components/portal/portal-ui";
import { cn } from "@/lib/utils";

const APPLICANT_PREVIEW_LIMIT = 3;
const JOB_STATUS_LIMIT = 6;

export function EmployerDashboard() {
  const t = useTranslations("employer.dashboardPage");
  const dashboard = useEmployerDashboard();
  const applicantsPreview = useEmployerApplicants({
    search: "",
    jobId: "",
    status: "",
    sort: "recent",
    page: 1,
    limit: APPLICANT_PREVIEW_LIMIT,
    view: "grid",
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const applicants = applicantsPreview.data?.items ?? [];
  const liveJobs = (dashboard.data?.liveJobs ?? []).slice(0, JOB_STATUS_LIMIT);

  const applicantCards = useMemo(
    () =>
      applicants.map((applicant) => {
        const id = applicantId(applicant);
        const appliedTime = applicant.appliedAt ? formatAppliedAgo(applicant.appliedAt) : "—";
        return (
          <EmployerApplicantListCard
            key={id}
            applicant={applicant}
            appliedLabel={t("applicants.appliedAgo", { time: appliedTime })}
            href={`/employer/applicants/${encodeURIComponent(id)}`}
            moreAriaLabel={t("applicants.moreActions")}
          />
        );
      }),
    [applicants, t],
  );

  return (
    <div className={cn(portalPageShellClass, "gap-8")}>
      <EmployerAsyncState
        isLoading={dashboard.isLoading}
        isError={dashboard.isError}
        error={dashboard.error}
        onRetry={() => void dashboard.refetch()}
      >
        <div className={portalStatGridClass}>
          <PortalStatCard
            label={t("stats.activeJobs.label")}
            value={formatStatValue(dashboard.data?.activeJobs)}
            hint={formatStatHint(dashboard.data?.activeJobs) || t("stats.activeJobs.hint")}
          />
          <PortalStatCard
            label={t("stats.totalApplicants.label")}
            value={formatStatValue(dashboard.data?.totalApplicants)}
            hint={formatStatHint(dashboard.data?.totalApplicants) || t("stats.totalApplicants.hint")}
            hintTone="positive"
          />
          <PortalStatCard
            label={t("stats.hiredWorkers.label")}
            value={formatStatValue(dashboard.data?.hiredWorkers)}
            hint={formatStatHint(dashboard.data?.hiredWorkers) || t("stats.hiredWorkers.hint")}
            hintTone="negative"
          />
          <PortalStatCard
            label={t("stats.totalPayroll.label")}
            value={formatStatValue(dashboard.data?.totalPayroll)}
            hint={formatStatHint(dashboard.data?.totalPayroll) || t("stats.totalPayroll.hint")}
            hintTone="positive"
          />
        </div>
      </EmployerAsyncState>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <h2 className="text-lg font-semibold tracking-[-0.03em] text-[var(--joballa-fg)] sm:text-xl">
              {t("applicants.title")}
            </h2>
            <Link
              href="/employer/applicants"
              className="text-sm font-semibold text-[var(--joballa-muted)] underline underline-offset-4 transition hover:text-[var(--joballa-fg)]"
            >
              {t("applicants.seeAll")}
            </Link>
          </div>
          <div className={portalSegmentGroupClass}>
            <button
              type="button"
              aria-label={t("applicants.viewGrid")}
              aria-pressed={viewMode === "grid"}
              onClick={() => setViewMode("grid")}
              className={portalSegmentButtonClass(viewMode === "grid")}
            >
              <IconGrid className="size-4" />
            </button>
            <button
              type="button"
              aria-label={t("applicants.viewList")}
              aria-pressed={viewMode === "list"}
              onClick={() => setViewMode("list")}
              className={portalSegmentButtonClass(viewMode === "list")}
            >
              <IconList className="size-4" />
            </button>
          </div>
        </div>

        <EmployerAsyncState
          isLoading={applicantsPreview.isLoading}
          isError={applicantsPreview.isError}
          error={applicantsPreview.error}
          onRetry={() => void applicantsPreview.refetch()}
        >
          {applicants.length === 0 ? (
            <p className="text-sm text-[var(--joballa-muted)]">{t("applicants.empty")}</p>
          ) : viewMode === "list" ? (
            <div className="space-y-3">{applicantCards}</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{applicantCards}</div>
          )}
        </EmployerAsyncState>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-[-0.03em] text-[var(--joballa-fg)] sm:text-xl">
          {t("jobStatus.title")}
        </h2>
        <EmployerAsyncState
          isLoading={dashboard.isLoading}
          isError={dashboard.isError}
          error={dashboard.error}
          onRetry={() => void dashboard.refetch()}
        >
          {liveJobs.length === 0 ? (
            <p className="text-sm text-[var(--joballa-muted)]">{t("jobStatus.empty")}</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {liveJobs.map((job) => {
                const postedTime = job.postedAt ? formatAppliedAgo(job.postedAt) : "—";
                return (
                  <PortalCardLink
                    key={job.jobId}
                    href={`/employer/jobs?job=${encodeURIComponent(String(job.jobId))}`}
                    className="p-4 sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="min-w-0 truncate text-[1.35rem] font-semibold leading-tight tracking-[-0.04em] text-[var(--joballa-fg)] sm:text-[1.4rem]">
                        {job.title}
                      </h3>
                      <span className="inline-flex shrink-0 items-center rounded-full bg-[var(--joballa-jade-3)] px-2.5 py-1 text-xs font-semibold text-[var(--joballa-primary)]">
                        {t("jobStatus.live")}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm font-medium text-[var(--joballa-muted)]">
                      {[job.location, job.jobType, job.salary].filter(Boolean).join(" · ")}
                    </p>
                    <div className="mt-5 flex flex-col gap-2 text-sm text-[var(--joballa-muted)] sm:flex-row sm:items-center sm:justify-between">
                      <span>
                        {t("jobStatus.applicantsCount", { count: job.applicantsCount ?? 0 })} ·{" "}
                        {t("jobStatus.shortlistedCount", { count: job.shortlistedCount ?? 0 })}
                      </span>
                      <span>{t("jobStatus.posted", { time: postedTime })}</span>
                    </div>
                  </PortalCardLink>
                );
              })}
            </div>
          )}
        </EmployerAsyncState>
      </section>
    </div>
  );
}
