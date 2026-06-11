"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/lib/i18n/navigation";
import { EmployerAsyncState } from "@/components/employer/employer-async-state";
import { EmployerJobDetailPanel } from "@/components/employer/employer-job-detail-panel";
import { EmployerJobGridCard } from "@/components/employer/employer-job-grid-card";
import { useEmployerJobs, useEmployerMe } from "@/features/employer/hooks";
import type { EmployerJobListItem } from "@/features/employer/types/employer-portal";
import { employerJobById, employerJobToCard, type EmployerJobCardModel } from "@/lib/employer-job-card";
import { displayEmployerJobStatus, jobStatusMatchesFilter } from "@/features/employer/lib/employer-job-status";
import { employerJobId } from "@/features/employer/lib/normalize-employer-job";
import { IconFilter, IconGrid, IconList, IconSearch } from "@/components/worker/icons";
import {
  portalCardClass,
  portalListTableBodyRowClass,
  portalListTableClass,
  portalListTableHeadRowClass,
  portalListTableTdClass,
  portalListTableThClass,
  portalPageShellClass,
  portalSearchFormClass,
  portalSegmentButtonClass,
  portalSegmentGroupClass,
  portalTabPillClass,
} from "@/components/portal/portal-ui";
import { useMediaQuery } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";
import { buttonClassName } from "@/components/ui/button";

type StatusFilter = "" | "active" | "under_review" | "draft" | "paused" | "closed";

const STATUS_FILTERS: StatusFilter[] = ["", "active", "under_review", "draft", "paused"];

function jobMatchesSearch(job: EmployerJobCardModel, needle: string) {
  if (!needle) return true;
  const n = needle.toLowerCase();
  return (
    job.title.toLowerCase().includes(n) ||
    job.subtitle.toLowerCase().includes(n) ||
    job.pay.toLowerCase().includes(n) ||
    displayEmployerJobStatus(job.status).toLowerCase().includes(n)
  );
}

function statusMatchesFilter(status: string, filter: StatusFilter) {
  return jobStatusMatchesFilter(status, filter);
}

function EmployerJobsViewInner() {
  const t = useTranslations("employer.jobsPage");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isLg = useMediaQuery("(min-width: 1024px)");
  const jobParam = searchParams.get("job");
  const statusParam = searchParams.get("status");

  const [grid, setGrid] = useState(false);
  const [searchDraft, setSearchDraft] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeStatusFilter = useMemo((): StatusFilter => {
    if (
      statusParam === "active" ||
      statusParam === "under_review" ||
      statusParam === "draft" ||
      statusParam === "paused" ||
      statusParam === "closed"
    ) {
      return statusParam;
    }
    return statusFilter;
  }, [statusFilter, statusParam]);

  const filtersPanelOpen = filtersOpen || activeStatusFilter !== "";

  const me = useEmployerMe();
  const jobsQuery = useEmployerJobs({ page: 1, limit: 50 });
  const companyName = me.data?.company?.name ?? t("companyFallback");

  const cards = useMemo(() => {
    const items = jobsQuery.data?.items ?? [];
    return items.map((job) => employerJobToCard(job, companyName));
  }, [companyName, jobsQuery.data]);

  const filteredCards = useMemo(() => {
    const needle = searchDraft.trim().toLowerCase();
    return cards.filter(
      (job) => jobMatchesSearch(job, needle) && statusMatchesFilter(job.status, activeStatusFilter),
    );
  }, [activeStatusFilter, cards, searchDraft]);

  const selectedInList = useMemo(() => {
    if (!jobParam) return null;
    const items = jobsQuery.data?.items ?? [];
    return employerJobById(items, jobParam);
  }, [jobParam, jobsQuery.data]);

  const useSplit = isLg === true;
  const showPanel = useSplit && jobParam != null;

  const selectJob = useCallback(
    (jobId: string) => {
      router.replace(`${pathname}?job=${encodeURIComponent(jobId)}`);
    },
    [pathname, router],
  );

  const closePanel = useCallback(() => {
    router.replace(pathname);
  }, [pathname, router]);

  useEffect(() => {
    if (isLg !== true || !jobParam || jobsQuery.isLoading) return;
    if (jobsQuery.isSuccess && !selectedInList) {
      router.replace(pathname);
    }
  }, [isLg, jobParam, jobsQuery.isLoading, jobsQuery.isSuccess, pathname, router, selectedInList]);

  useEffect(() => {
    if (isLg === null || isLg) return;
    if (!jobParam) return;
    router.replace(`/employer/jobs/${encodeURIComponent(jobParam)}`);
  }, [isLg, jobParam, router]);

  return (
    <div
      className={cn(
        portalPageShellClass,
        "max-[599px]:-mx-2 max-[599px]:w-[calc(100%+1rem)] min-[600px]:mx-0 min-[600px]:w-full",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <header className="min-w-0">
          <h1 className="text-2xl font-bold text-[var(--joballa-fg)]">{t("title")}</h1>
          <p className="mt-1 text-sm text-[var(--joballa-muted)]">{t("description")}</p>
        </header>
        <Link href="/employer/jobs/new" className={cn(buttonClassName("primary"), "shrink-0 text-sm")}>
          {t("postJob")}
        </Link>
      </div>

      <div className="flex w-full flex-col gap-2 min-[600px]:gap-3">
        <div className="flex min-w-0 items-stretch gap-2 min-[600px]:gap-3">
          <form
            className={portalSearchFormClass}
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <label className="flex min-w-0 flex-1 cursor-text items-stretch border-r border-[var(--joballa-border)]">
              <span className="sr-only">{t("searchPlaceholder")}</span>
              <input
                type="search"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="min-w-0 flex-1 border-0 bg-transparent px-2.5 py-2 text-sm text-[var(--joballa-fg)] outline-none ring-[var(--joballa-primary)] placeholder:text-[var(--joballa-muted)] focus-visible:ring-2 min-[600px]:px-3"
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
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-[var(--joballa-border)] bg-[var(--joballa-card)] px-3 text-sm font-medium text-[var(--joballa-fg)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:bg-[var(--joballa-row-hover)] min-[600px]:px-4"
            aria-expanded={filtersPanelOpen}
          >
            <IconFilter className="size-4" />
            <span className="hidden min-[600px]:inline">{t("filtersButton")}</span>
          </button>
        </div>

        {filtersPanelOpen ? (
          <div className="flex flex-wrap gap-1">
            {STATUS_FILTERS.map((value) => {
              const label = value === "" ? t("filters.all") : t(`filters.${value}`);
              const active = activeStatusFilter === value;
              return (
                <button
                  key={value || "all"}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  className={portalTabPillClass(active)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <EmployerAsyncState
        isLoading={jobsQuery.isLoading}
        isError={jobsQuery.isError}
        error={jobsQuery.error}
        onRetry={() => void jobsQuery.refetch()}
      >
        <div
          className={cn(
            "flex min-h-0 w-full flex-1 flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6",
            showPanel && "lg:grid lg:grid-cols-[minmax(340px,0.78fr)_minmax(0,1.22fr)]",
          )}
        >
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 lg:overflow-y-auto">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <div className={portalSegmentGroupClass}>
                <button
                  type="button"
                  className={portalSegmentButtonClass(grid)}
                  aria-pressed={grid}
                  aria-label={t("viewGrid")}
                  onClick={() => setGrid(true)}
                >
                  <IconGrid className="size-4" />
                </button>
                <button
                  type="button"
                  className={portalSegmentButtonClass(!grid)}
                  aria-pressed={!grid}
                  aria-label={t("viewList")}
                  onClick={() => setGrid(false)}
                >
                  <IconList className="size-4" />
                </button>
              </div>
            </div>

            {cards.length === 0 ? (
              <div className={cn(portalCardClass(), "px-4 py-10 text-center sm:px-6")}>
                <p className="text-sm text-[var(--joballa-muted)]">{t("empty")}</p>
                <Link
                  href="/employer/jobs/new"
                  className={cn(buttonClassName("primary"), "mt-4 inline-flex text-sm")}
                >
                  {t("postJob")}
                </Link>
              </div>
            ) : filteredCards.length === 0 ? (
              <p className={cn(portalCardClass(), "px-4 py-10 text-center text-sm text-[var(--joballa-muted)]")}>
                {t("emptySearch")}
              </p>
            ) : grid ? (
              <div
                className={cn(
                  "grid gap-3 sm:grid-cols-2 sm:gap-4",
                  showPanel ? "lg:grid-cols-1" : "lg:grid-cols-2 xl:grid-cols-3",
                )}
              >
                {filteredCards.map((job) => (
                  <EmployerJobGridCard
                    key={job.jobId}
                    job={job}
                    postedLabel={t("posted", { time: job.posted })}
                    applicantsLabel={t("applicantsShort", {
                      count: job.applicantsCount,
                      shortlisted: job.shortlistedCount,
                    })}
                    viewApplicantsLabel={t("viewApplicants")}
                    splitPane={useSplit}
                    isActive={useSplit && job.jobId === jobParam}
                    onSelectJob={selectJob}
                  />
                ))}
              </div>
            ) : (
              <EmployerJobsListTable
                jobs={filteredCards}
                items={jobsQuery.data?.items ?? []}
                useSplit={useSplit}
                activeJobId={jobParam}
                onSelectJob={selectJob}
                t={t}
              />
            )}
          </div>

          {showPanel && jobParam ? (
            <aside className="hidden min-h-0 w-full lg:flex lg:max-h-[min(88vh,calc(100dvh-6.5rem))] lg:flex-col lg:overflow-hidden">
              <EmployerJobDetailPanel jobId={jobParam} onClose={closePanel} variant="panel" />
            </aside>
          ) : null}
        </div>
      </EmployerAsyncState>
    </div>
  );
}

function EmployerJobsListTable({
  jobs,
  items,
  useSplit,
  activeJobId,
  onSelectJob,
  t,
}: {
  jobs: EmployerJobCardModel[];
  items: EmployerJobListItem[];
  useSplit: boolean;
  activeJobId: string | null;
  onSelectJob: (id: string) => void;
  t: ReturnType<typeof useTranslations<"employer.jobsPage">>;
}) {
  const router = useRouter();

  return (
    <div className={cn(portalCardClass(), "overflow-x-auto")}>
      <table className={cn(portalListTableClass, "min-w-[640px]")}>
        <thead>
          <tr className={portalListTableHeadRowClass}>
            <th className={portalListTableThClass}>{t("listColPosted")}</th>
            <th className={portalListTableThClass}>{t("listColTitle")}</th>
            <th className={portalListTableThClass}>{t("listColStatus")}</th>
            <th className={portalListTableThClass}>{t("listColApplicants")}</th>
            <th className={portalListTableThClass}>{t("listColPay")}</th>
            <th className={portalListTableThClass} />
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => {
            const raw = items.find((j) => employerJobId(j) === job.jobId);
            const isActive = useSplit && job.jobId === activeJobId;
            return (
              <tr
                key={job.jobId}
                className={cn(
                  portalListTableBodyRowClass,
                  "cursor-pointer",
                  isActive && "bg-[var(--joballa-row-hover)]",
                )}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest("[data-card-stop]")) return;
                  if (useSplit) onSelectJob(job.jobId);
                  else void router.push(`/employer/jobs?job=${encodeURIComponent(job.jobId)}`);
                }}
              >
                <td className={cn(portalListTableTdClass, "text-[var(--joballa-muted)]")}>{job.posted}</td>
                <td className={cn(portalListTableTdClass, "font-medium text-[var(--joballa-fg)]")}>{job.title}</td>
                <td className={cn(portalListTableTdClass, "capitalize text-[var(--joballa-muted)]")}>
                  {displayEmployerJobStatus(job.status)}
                </td>
                <td className={cn(portalListTableTdClass, "text-[var(--joballa-muted)]")}>
                  {raw?.applicantsCount ?? job.applicantsCount}
                </td>
                <td className={cn(portalListTableTdClass, "text-[var(--joballa-fg)]")}>{job.pay}</td>
                <td className={cn(portalListTableTdClass, "text-right")} data-card-stop>
                  <Link
                    href={`/employer/applicants?jobId=${encodeURIComponent(job.jobId)}`}
                    className="font-medium text-[var(--joballa-primary)] hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t("viewApplicants")}
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

export function EmployerJobsView() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-[14px] bg-[var(--joballa-card)]" aria-busy />}>
      <EmployerJobsViewInner />
    </Suspense>
  );
}
