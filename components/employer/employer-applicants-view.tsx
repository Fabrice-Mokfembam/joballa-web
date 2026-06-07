"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { EmployerAsyncState } from "@/components/employer/employer-async-state";
import { EmployerApplicantDetailPanel } from "@/components/employer/employer-applicant-detail-panel";
import { EmployerApplicantListCard, applicantId } from "@/components/employer/employer-applicant-list-card";
import { EmployerApplicantStatusBadge } from "@/components/employer/employer-applicant-status-badge";
import {
  applicantName,
  applicantRole,
  formatStatHint,
  formatStatValue,
} from "@/features/employer/lib/applicant-helpers";
import {
  applicantMatchText,
  applicantSkillsList,
  formatAppliedAgo,
} from "@/features/employer/lib/applicant-profile";
import {
  useEmployerApplicantFilters,
  useEmployerApplicants,
  useEmployerDashboard,
} from "@/features/employer/hooks";
import type { EmployerApplicantListItem, EmployerApplicantStatus } from "@/features/employer/types/employer-portal";
import { useEmployerPortalStore } from "@/lib/stores/employer-portal-store";
import { IconFilter, IconGrid, IconList, IconSearch } from "@/components/worker/icons";
import {
  portalCardClass,
  portalListTableBodyRowClass,
  portalListTableClass,
  portalListTableHeadRowClass,
  portalListTableTdClass,
  portalListTableThClass,
  portalInputClass,
  portalPageShellClass,
  portalSearchFormClass,
  portalSegmentButtonClass,
  portalSegmentGroupClass,
  PortalStatCard,
  portalStatGridClass,
  portalTabPillClass,
} from "@/components/portal/portal-ui";
import { useMediaQuery } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";

type StatusTab = "" | "shortlisted" | "pending" | "hired" | "rejected";

const STATUS_TABS: StatusTab[] = ["", "shortlisted", "pending", "hired", "rejected"];

function ApplicantsViewInner() {
  const t = useTranslations("employer.applicants");
  const td = useTranslations("employer.dashboardPage");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isLg = useMediaQuery("(min-width: 1024px)");
  const applicantParam = searchParams.get("applicant");
  const jobIdParam = searchParams.get("jobId");

  const filters = useEmployerPortalStore((s) => s.applicants);
  const setApplicants = useEmployerPortalStore((s) => s.setApplicants);
  const filterOptions = useEmployerApplicantFilters();
  const dashboard = useEmployerDashboard();
  const list = useEmployerApplicants(filters);

  const [searchDraft, setSearchDraft] = useState(filters.search);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (jobIdParam && jobIdParam !== filters.jobId) {
      setApplicants({ jobId: jobIdParam });
    }
  }, [filters.jobId, jobIdParam, setApplicants]);

  useEffect(() => {
    queueMicrotask(() => setSearchDraft(filters.search));
  }, [filters.search]);

  const baseCountParams = useMemo(
    () => ({
      search: filters.search || undefined,
      jobId: filters.jobId || undefined,
      page: 1,
      limit: 1,
      sort: filters.sort,
      view: filters.view,
    }),
    [filters.jobId, filters.search, filters.sort, filters.view],
  );

  const countAll = useEmployerApplicants({ ...baseCountParams, status: "" });
  const countShortlisted = useEmployerApplicants({ ...baseCountParams, status: "shortlisted" });
  const countPending = useEmployerApplicants({ ...baseCountParams, status: "pending" });
  const countHired = useEmployerApplicants({ ...baseCountParams, status: "hired" });
  const countRejected = useEmployerApplicants({ ...baseCountParams, status: "rejected" });

  const tabCounts: Record<StatusTab, number> = {
    "": countAll.data?.total ?? 0,
    shortlisted: countShortlisted.data?.total ?? 0,
    pending: countPending.data?.total ?? 0,
    hired: countHired.data?.total ?? 0,
    rejected: countRejected.data?.total ?? 0,
  };

  const items = list.data?.items ?? [];
  const selectedApplicant = useMemo(
    () => items.find((a) => applicantId(a) === applicantParam) ?? null,
    [applicantParam, items],
  );

  const useSplit = isLg === true;
  const showPanel = useSplit && applicantParam != null;
  const viewMode = filters.view === "list" ? "list" : "grid";

  const statusLabels = useMemo(
    () => ({
      shortlisted: t("status.shortlisted"),
      rejected: t("status.rejected"),
      pending: t("status.pending"),
      hired: t("status.hired"),
    }),
    [t],
  );

  const selectedJobTitle = useMemo(() => {
    if (!filters.jobId) return null;
    return (filterOptions.data?.jobTitles ?? []).find((j) => j.jobId === filters.jobId)?.title ?? null;
  }, [filterOptions.data?.jobTitles, filters.jobId]);

  const selectApplicant = useCallback(
    (id: string) => {
      const params = new URLSearchParams();
      if (filters.jobId) params.set("jobId", filters.jobId);
      params.set("applicant", id);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [filters.jobId, pathname, router],
  );

  const closePanel = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.jobId) params.set("jobId", filters.jobId);
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname);
  }, [filters.jobId, pathname, router]);

  const openApplicant = useCallback(
    (id: string) => {
      if (useSplit) {
        selectApplicant(id);
        return;
      }
      router.push(`/employer/applicants/${encodeURIComponent(id)}`);
    },
    [router, selectApplicant, useSplit],
  );

  useEffect(() => {
    if (isLg !== true || !applicantParam || list.isLoading) return;
    if (list.isSuccess && !selectedApplicant) {
      closePanel();
    }
  }, [applicantParam, closePanel, isLg, list.isLoading, list.isSuccess, selectedApplicant]);

  useEffect(() => {
    if (isLg === null || isLg) return;
    if (!applicantParam) return;
    router.replace(`/employer/applicants/${encodeURIComponent(applicantParam)}`);
  }, [applicantParam, isLg, router]);

  function submitSearch() {
    setApplicants({ search: (searchDraft ?? "").trim() });
  }

  function setStatusTab(status: StatusTab) {
    setApplicants({ status });
  }

  return (
    <div className={cn(portalPageShellClass, "gap-5")}>
      <header>
        <h1 className="text-2xl font-bold text-[var(--joballa-fg)]">{t("title")}</h1>
        <p className="mt-1 text-sm text-[var(--joballa-muted)]">{t("description")}</p>
      </header>

      <EmployerAsyncState
        isLoading={dashboard.isLoading}
        isError={dashboard.isError}
        error={dashboard.error}
        onRetry={() => void dashboard.refetch()}
      >
        <div className={portalStatGridClass}>
          <PortalStatCard
            label={td("stats.activeJobs.label")}
            value={formatStatValue(dashboard.data?.activeJobs)}
            hint={formatStatHint(dashboard.data?.activeJobs) || td("stats.activeJobs.hint")}
          />
          <PortalStatCard
            label={td("stats.totalApplicants.label")}
            value={formatStatValue(dashboard.data?.totalApplicants)}
            hint={formatStatHint(dashboard.data?.totalApplicants) || td("stats.totalApplicants.hint")}
            hintTone="positive"
          />
          <PortalStatCard
            label={td("stats.hiredWorkers.label")}
            value={formatStatValue(dashboard.data?.hiredWorkers)}
            hint={formatStatHint(dashboard.data?.hiredWorkers) || td("stats.hiredWorkers.hint")}
          />
          <PortalStatCard
            label={td("stats.totalPayroll.label")}
            value={formatStatValue(dashboard.data?.totalPayroll)}
            hint={formatStatHint(dashboard.data?.totalPayroll) || td("stats.totalPayroll.hint")}
            hintTone="positive"
          />
        </div>
      </EmployerAsyncState>

      <div className="flex w-full flex-col gap-2 min-[600px]:gap-3">
        <div className="flex min-w-0 items-stretch gap-2 min-[600px]:gap-3">
          <form
            className={portalSearchFormClass}
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch();
            }}
          >
            <label className="flex min-w-0 flex-1 cursor-text items-stretch border-r border-[var(--joballa-border)]">
              <span className="sr-only">{t("searchPlaceholder")}</span>
              <input
                type="search"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm text-[var(--joballa-fg)] outline-none ring-[var(--joballa-primary)] placeholder:text-[var(--joballa-muted)] focus-visible:ring-2"
              />
            </label>
            <button
              type="submit"
              className="flex w-14 shrink-0 items-center justify-center text-[var(--joballa-muted)]"
              aria-label={t("submitSearch")}
            >
              <IconSearch className="size-4" />
            </button>
          </form>
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-[var(--joballa-border)] bg-[var(--joballa-card)] px-3 text-sm font-medium text-[var(--joballa-fg)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:bg-[var(--joballa-row-hover)]"
            aria-expanded={filtersOpen}
          >
            <IconFilter className="size-4" />
            <span className="hidden min-[600px]:inline">{t("filtersButton")}</span>
          </button>
        </div>

        {filtersOpen ? (
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="applicant-job-filter">
              {t("jobFilter")}
            </label>
            <select
              id="applicant-job-filter"
              value={filters.jobId}
              onChange={(e) => setApplicants({ jobId: e.target.value })}
              disabled={filterOptions.isLoading}
              className={cn(portalInputClass, "h-10 min-w-[12rem]")}
            >
              <option value="">{t("allJobs")}</option>
              {(filterOptions.data?.jobTitles ?? []).map((j) => (
                <option key={j.jobId} value={j.jobId}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {selectedJobTitle ? (
          <p className="text-sm italic text-[var(--joballa-muted)]">{t("showingForJob", { job: selectedJobTitle })}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1">
          {STATUS_TABS.map((tab) => {
            const label =
              tab === ""
                ? t("tabs.all", { count: tabCounts[""] })
                : t(`tabs.${tab}`, { count: tabCounts[tab] });
            const active = filters.status === tab;
            return (
              <button
                key={tab || "all"}
                type="button"
                onClick={() => setStatusTab(tab)}
                className={portalTabPillClass(active)}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div className={portalSegmentGroupClass}>
          <button
            type="button"
            aria-label={t("viewGrid")}
            aria-pressed={viewMode === "grid"}
            onClick={() => setApplicants({ view: "grid" })}
            className={portalSegmentButtonClass(viewMode === "grid")}
          >
            <IconGrid className="size-4" />
          </button>
          <button
            type="button"
            aria-label={t("viewList")}
            aria-pressed={viewMode === "list"}
            onClick={() => setApplicants({ view: "list" })}
            className={portalSegmentButtonClass(viewMode === "list")}
          >
            <IconList className="size-4" />
          </button>
        </div>
      </div>

      <EmployerAsyncState
        isLoading={list.isLoading}
        isError={list.isError}
        error={list.error}
        onRetry={() => void list.refetch()}
      >
        <div
          className={cn(
            "flex min-h-0 w-full flex-1 flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6",
            showPanel &&
              "lg:grid lg:h-[calc(100dvh-8.5rem)] lg:grid-cols-[minmax(340px,0.78fr)_minmax(0,1.22fr)] lg:gap-6 lg:overflow-hidden",
          )}
        >
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 lg:overflow-y-auto lg:pr-1">
            {items.length === 0 ? (
              <p className={cn(portalCardClass(), "px-4 py-10 text-center text-sm text-[var(--joballa-muted)]")}>
                {t("empty")}
              </p>
            ) : viewMode === "grid" ? (
              <div
                className={cn(
                  "grid gap-3 sm:grid-cols-2 sm:gap-4",
                  showPanel ? "lg:grid-cols-1 xl:grid-cols-1" : "lg:grid-cols-2 xl:grid-cols-3",
                )}
              >
                {items.map((applicant) => {
                  const id = applicantId(applicant);
                  return (
                    <EmployerApplicantListCard
                      key={id}
                      applicant={applicant}
                      appliedLabel={t("applied", {
                        time: applicant.appliedAt ? formatAppliedAgo(applicant.appliedAt) : "—",
                      })}
                      isActive={showPanel && id === applicantParam}
                      onSelect={() => openApplicant(id)}
                      moreAriaLabel={t("moreActions")}
                    />
                  );
                })}
              </div>
            ) : (
              <ApplicantsTable
                applicants={items}
                activeApplicantId={showPanel ? applicantParam : null}
                statusLabels={statusLabels}
                useSplit={useSplit}
                onSelect={openApplicant}
                t={t}
              />
            )}
          </div>

          {showPanel && applicantParam ? (
            <aside className="hidden min-h-0 w-full lg:flex lg:max-h-[min(88vh,calc(100dvh-6.5rem))] lg:flex-col lg:overflow-hidden">
              <EmployerApplicantDetailPanel
                applicationId={applicantParam}
                variant="panel"
                onClose={closePanel}
              />
            </aside>
          ) : null}
        </div>
      </EmployerAsyncState>
    </div>
  );
}

function ApplicantsTable({
  applicants,
  activeApplicantId,
  statusLabels,
  useSplit,
  onSelect,
  t,
}: {
  applicants: EmployerApplicantListItem[];
  activeApplicantId: string | null;
  statusLabels: Record<string, string>;
  useSplit: boolean;
  onSelect: (id: string) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className={cn(portalCardClass(), "overflow-x-auto")}>
      <table className={cn(portalListTableClass, "min-w-[960px]")}>
        <thead>
          <tr className={portalListTableHeadRowClass}>
            <th className={portalListTableThClass}>{t("table.applied")}</th>
            <th className={portalListTableThClass}>{t("table.applicant")}</th>
            <th className={portalListTableThClass}>{t("table.applyingFor")}</th>
            <th className={portalListTableThClass}>{t("table.topSkills")}</th>
            <th className={portalListTableThClass}>{t("table.jobType")}</th>
            <th className={portalListTableThClass}>{t("table.location")}</th>
            <th className={portalListTableThClass}>{t("table.match")}</th>
            <th className={portalListTableThClass}>{t("table.status")}</th>
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
            const isActive = useSplit && id === activeApplicantId;

            return (
              <tr
                key={id}
                className={cn(
                  portalListTableBodyRowClass,
                  "cursor-pointer",
                  isActive && "bg-[var(--joballa-row-hover)]",
                )}
                onClick={() => onSelect(id)}
              >
                <td className={cn(portalListTableTdClass, "text-[var(--joballa-muted)]")}>
                  {t("table.appliedAgo", { time: applied })}
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function EmployerApplicantsView() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-[14px] bg-[var(--joballa-card)]" aria-busy />}>
      <ApplicantsViewInner />
    </Suspense>
  );
}
