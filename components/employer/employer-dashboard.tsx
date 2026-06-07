"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { EmployerAsyncState } from "@/components/employer/employer-async-state";
import { EmployerApplicantListCard, applicantId } from "@/components/employer/employer-applicant-list-card";
import { EmployerApplicantStatusBadge } from "@/components/employer/employer-applicant-status-badge";
import { formatStatHint, formatStatValue, applicantName, applicantRole } from "@/features/employer/lib/applicant-helpers";
import {
  applicantMatchText,
  applicantSkillsList,
  formatAppliedAgo,
} from "@/features/employer/lib/applicant-profile";
import { useEmployerApplicants, useEmployerDashboard } from "@/features/employer/hooks";
import type { EmployerApplicantListItem, EmployerApplicantStatus } from "@/features/employer/types/employer-portal";
import { IconGrid, IconList } from "@/components/worker/icons";
import {
  portalCardClass,
  PortalCardLink,
  portalListTableBodyRowClass,
  portalListTableClass,
  portalListTableHeadRowClass,
  portalListTableTdClass,
  portalListTableThClass,
  portalPageShellClass,
  portalSegmentButtonClass,
  portalSegmentGroupClass,
  PortalStatCard,
  portalStatGridClass,
} from "@/components/portal/portal-ui";
import { cn } from "@/lib/utils";

const APPLICANT_PREVIEW_LIMIT = 3;
const JOB_STATUS_LIMIT = 6;

function DashboardApplicantsTable({
  applicants,
  statusLabels,
  t,
}: {
  applicants: EmployerApplicantListItem[];
  statusLabels: Record<string, string>;
  t: ReturnType<typeof useTranslations<"employer.dashboardPage">>;
}) {
  const router = useRouter();

  return (
    <div className={cn(portalCardClass(), "overflow-x-auto")}>
      <table className={cn(portalListTableClass, "min-w-[960px]")}>
        <thead>
          <tr className={portalListTableHeadRowClass}>
            <th className={portalListTableThClass}>{t("applicants.table.applied")}</th>
            <th className={portalListTableThClass}>{t("applicants.table.applicant")}</th>
            <th className={portalListTableThClass}>{t("applicants.table.applyingFor")}</th>
            <th className={portalListTableThClass}>{t("applicants.table.topSkills")}</th>
            <th className={portalListTableThClass}>{t("applicants.table.jobType")}</th>
            <th className={portalListTableThClass}>{t("applicants.table.location")}</th>
            <th className={portalListTableThClass}>{t("applicants.table.match")}</th>
            <th className={portalListTableThClass}>{t("applicants.table.status")}</th>
            <th className={portalListTableThClass} />
          </tr>
        </thead>
        <tbody>
          {applicants.map((applicant) => {
            const id = applicantId(applicant);
            const status = (applicant.status as EmployerApplicantStatus) ?? "pending";
            const match = applicantMatchText(applicant);
            const matchValue = match?.replace(/\s*match/i, "").replace("%", "").trim() ?? "—";
            const skills = applicantSkillsList(applicant).slice(0, 2).join(", ");
            const applied = applicant.appliedAt ? formatAppliedAgo(applicant.appliedAt) : "—";

            return (
              <tr
                key={id}
                className={cn(portalListTableBodyRowClass, "cursor-pointer")}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest("[data-card-stop]")) return;
                  void router.push(`/employer/applicants/${encodeURIComponent(id)}`);
                }}
              >
                <td className={cn(portalListTableTdClass, "text-[var(--joballa-muted)]")}>
                  {t("applicants.table.appliedAgo", { time: applied })}
                </td>
                <td className={portalListTableTdClass}>
                  <span className="flex items-center gap-2 font-medium text-[var(--joballa-fg)]">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--joballa-primary)] text-[9px] font-bold text-[var(--joballa-on-primary)]">
                      {applicantName(applicant).charAt(0)}
                    </span>
                    {applicantName(applicant)}
                  </span>
                </td>
                <td className={cn(portalListTableTdClass, "text-[var(--joballa-muted)]")}>{applicantRole(applicant)}</td>
                <td className={cn(portalListTableTdClass, "max-w-[10rem] truncate text-[var(--joballa-muted)]")}>
                  {skills || "—"}
                </td>
                <td className={cn(portalListTableTdClass, "text-[var(--joballa-muted)]")}>
                  {String(applicant.jobType ?? "—")}
                </td>
                <td className={cn(portalListTableTdClass, "text-[var(--joballa-muted)]")}>
                  {String(applicant.location ?? "—")}
                </td>
                <td className={cn(portalListTableTdClass, "font-medium text-[var(--joballa-fg)]")}>{matchValue}</td>
                <td className={portalListTableTdClass}>
                  <EmployerApplicantStatusBadge status={status} label={statusLabels[status] ?? status} />
                </td>
                <td className={cn(portalListTableTdClass, "text-right")} data-card-stop>
                  <Link
                    href={`/employer/applicants/${encodeURIComponent(id)}`}
                    className="font-medium text-[var(--joballa-primary)] hover:underline"
                  >
                    {t("applicants.menu.open")}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

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
    view: "list",
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const applicants = applicantsPreview.data?.items ?? [];
  const liveJobs = (dashboard.data?.liveJobs ?? []).slice(0, JOB_STATUS_LIMIT);

  const statusLabels = useMemo(
    () => ({
      shortlisted: t("applicants.status.shortlisted"),
      rejected: t("applicants.status.rejected"),
      pending: t("applicants.status.pending"),
      hired: t("applicants.status.hired"),
      submitted: t("applicants.status.pending"),
    }),
    [t],
  );

  const applicantCards = useMemo(
    () =>
      applicants.map((applicant) => {
        const id = applicantId(applicant);
        const appliedTime = applicant.appliedAt ? formatAppliedAgo(applicant.appliedAt) : null;
        return (
          <EmployerApplicantListCard
            key={id}
            applicant={applicant}
            appliedLabel={
              appliedTime ? t("applicants.appliedAgo", { time: appliedTime }) : t("applicants.applied", { time: "—" })
            }
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
            <DashboardApplicantsTable applicants={applicants} statusLabels={statusLabels} t={t} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{applicantCards}</div>
          )}
        </EmployerAsyncState>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold tracking-[-0.03em] text-[var(--joballa-fg)] sm:text-lg">
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
                    className="p-3.5 sm:p-4"
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <h3 className="min-w-0 truncate text-sm font-semibold leading-snug tracking-[-0.02em] text-[var(--joballa-fg)] sm:text-[15px]">
                        {job.title}
                      </h3>
                      <span className="inline-flex shrink-0 items-center rounded-full bg-[var(--joballa-jade-3)] px-2 py-0.5 text-[11px] font-semibold text-[var(--joballa-primary)]">
                        {t("jobStatus.live")}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-[var(--joballa-muted)]">
                      {[job.location, job.jobType, job.salary].filter(Boolean).join(" · ")}
                    </p>
                    <div className="mt-3 flex flex-col gap-1.5 text-xs text-[var(--joballa-muted)] sm:flex-row sm:items-center sm:justify-between">
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
