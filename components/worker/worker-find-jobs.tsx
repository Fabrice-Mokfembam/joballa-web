"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/lib/i18n/navigation";
import {
  CAMEROON_CITIES_BY_REGION,
  CAMEROON_REGION_IDS,
  DEFAULT_CAMEROON_REGION,
  getCitiesForRegion,
  type CameroonRegionId,
} from "@/lib/cameroon-region-cities";
import {
  useHideWorkerJob,
  useReportWorkerJob,
  useWorkerApplications,
  useWorkerDepartmentOptions,
  useWorkerJob,
  useWorkerJobSearch,
} from "@/features/worker/hooks";
import { buildJobSearchParams, jobMatchesPayFilter } from "@/features/worker/lib/job-search-params";
import { workerApplicationRowsFromApi } from "@/features/worker/lib/application-mappers";
import { workerJobCardFromApi, workerJobCardsFromApi } from "@/features/worker/lib/job-mappers";
import { canShowWorkerJobApply } from "@/features/worker/lib/job-apply-eligibility";
import { matchesWorkerJobId } from "@/features/worker/lib/job-list-cache";
import type { WorkerJobCard } from "@/lib/worker-job-data";
import { JoballaApiError } from "@/lib/joballa/request";
import { WorkerJobGridCard } from "@/components/worker/worker-job-grid-card";
import type { JobPostingCardMenuItem } from "@/components/job-posting/job-posting-card";
import { WorkerJobFilterDropdown } from "@/components/worker/worker-job-filter-dropdown";
import { WorkerJobDetailView } from "@/components/worker/worker-job-detail-view";
import {
  IconBriefcase,
  IconBuilding,
  IconFilter,
  IconGrid,
  IconList,
  IconMap,
  IconPin,
  IconSearch,
  IconWallet,
} from "@/components/worker/icons";
import { useMediaQuery } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";
import { WorkerFindJobsPageSkeleton, WorkerJobDetailPanelSkeleton } from "@/components/worker/worker-loading-skeletons";
import {
  PortalEmptyState,
  portalFilterButtonClass,
  portalSearchFormClass,
  portalSegmentButtonClass,
  portalSegmentGroupClass,
} from "@/components/portal/portal-ui";

const CITY_ALL = "__ALL__";
const REGION_ALL = "__ALL__";
const FILTER_ALL = "__ALL__";

function jobMatchesQuery(job: WorkerJobCard, needle: string) {
  if (!needle) return true;
  const n = needle.toLowerCase();
  return (
    job.title.toLowerCase().includes(n) ||
    job.company.toLowerCase().includes(n) ||
    job.subtitle.toLowerCase().includes(n) ||
    job.department.toLowerCase().includes(n) ||
    job.employmentType.toLowerCase().includes(n) ||
    job.seniority.toLowerCase().includes(n) ||
    job.pay.toLowerCase().includes(n)
  );
}

function FindJobsFallback() {
  return <WorkerFindJobsPageSkeleton />;
}

function WorkerFindJobsViewInner({ searchMode = false }: { searchMode?: boolean }) {
  const t = useTranslations("worker.findJobsPage");
  const tJobDetail = useTranslations("worker.jobDetail");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isLg = useMediaQuery("(min-width: 1024px)");
  const jobParam = searchParams.get("job");
  const queryParam = searchParams.get("q") ?? "";

  const [grid, setGrid] = useState(true);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [q, setQ] = useState(() => queryParam);
  const [regionId, setRegionId] = useState<CameroonRegionId | typeof REGION_ALL>(REGION_ALL);
  const [city, setCity] = useState(CITY_ALL);

  const typeOptions = useMemo(() => (t.raw("typeOptions") as string[]) ?? [], [t]);
  const { departments: departmentCatalog } = useWorkerDepartmentOptions();
  const deptOptions = useMemo(
    () => departmentCatalog.map((dept) => dept.name).filter(Boolean) as string[],
    [departmentCatalog],
  );
  const payOptions = useMemo(() => (t.raw("payOptions") as string[]) ?? [], [t]);

  const [type, setType] = useState(FILTER_ALL);
  const [pay, setPay] = useState(FILTER_ALL);
  const [dept, setDept] = useState(FILTER_ALL);

  const regionSelectOptions = useMemo(
    () =>
      [{ value: REGION_ALL, label: t("regionAll") }].concat(CAMEROON_REGION_IDS.map((id) => ({
        value: id,
        label: t(`regions.${id}` as "regions.littoral"),
      }))),
    [t],
  );

  const citySelectOptions = useMemo(() => {
    const cities =
      regionId === REGION_ALL
        ? Array.from(new Set(Object.values(CAMEROON_CITIES_BY_REGION).flat())).sort()
        : getCitiesForRegion(regionId);
    return [{ value: CITY_ALL, label: t("cityAll") }, ...cities.map((c) => ({ value: c, label: c }))];
  }, [regionId, t]);

  const typeSelectOptions = useMemo(() => [{ value: FILTER_ALL, label: t("typeAll") }, ...typeOptions.map((x) => ({ value: x, label: x }))], [t, typeOptions]);
  const paySelectOptions = useMemo(() => [{ value: FILTER_ALL, label: t("payAll") }, ...payOptions.map((x) => ({ value: x, label: x }))], [payOptions, t]);
  const deptSelectOptions = useMemo(() => [{ value: FILTER_ALL, label: t("deptAll") }, ...deptOptions.map((x) => ({ value: x, label: x }))], [deptOptions, t]);

  const cityLabel = city === CITY_ALL ? t("cityAll") : city;
  const regionLabel = regionId === REGION_ALL ? t("regionAll") : t(`regions.${regionId}` as "regions.littoral");
  const typeLabel = type === FILTER_ALL ? t("typeAll") : type;
  const payLabel = pay === FILTER_ALL ? t("payAll") : pay;
  const deptLabel = dept === FILTER_ALL ? t("deptAll") : dept;

  const apiSearchParams = useMemo(
    () =>
      buildJobSearchParams({
        keyword: searchMode ? queryParam : undefined,
        city: city === CITY_ALL ? undefined : city,
        jobTypeLabel: type === FILTER_ALL ? undefined : type,
        payLabel: pay === FILTER_ALL ? undefined : pay,
        category: dept === FILTER_ALL ? undefined : dept,
        departments: departmentCatalog,
      }),
    [city, departmentCatalog, dept, pay, queryParam, searchMode, type],
  );

  const jobsQuery = useWorkerJobSearch(apiSearchParams);
  const appsQuery = useWorkerApplications({ limit: 100 });
  const hideJob = useHideWorkerJob();
  const reportJob = useReportWorkerJob();

  const filteredJobs = useMemo(() => {
    let items = jobsQuery.data?.items ?? [];
    if (regionId !== REGION_ALL && city === CITY_ALL) {
      const regionCities = new Set(getCitiesForRegion(regionId));
      items = items.filter((job) => job.city && regionCities.has(job.city));
    }
    if (pay !== FILTER_ALL) {
      items = items.filter((job) =>
        jobMatchesPayFilter(job as Record<string, unknown> & { payRate?: number | string | null }, pay),
      );
    }
    const cards = workerJobCardsFromApi(items);
    const needle = searchMode ? "" : q.trim().toLowerCase();
    if (!needle) return cards;
    return cards.filter((job) => jobMatchesQuery(job, needle));
  }, [city, jobsQuery.data?.items, pay, q, regionId, searchMode]);

  const appliedJobIds = useMemo(
    () =>
      new Set(
        workerApplicationRowsFromApi(appsQuery.data?.items ?? [])
          .map((app) => app.linkedJobSlug)
          .filter(Boolean),
      ),
    [appsQuery.data?.items],
  );

  const isJobApplied = useCallback(
    (job: WorkerJobCard) => appliedJobIds.has(job.slug) || appliedJobIds.has(job.id) || !!job.hasApplied,
    [appliedJobIds],
  );

  const canApplyToJob = useCallback(
    (job: WorkerJobCard) => canShowWorkerJobApply(job, isJobApplied(job)),
    [isJobApplied],
  );

  const panelJobRaw = useMemo(() => {
    if (!jobParam) return null;
    const items = jobsQuery.data?.items ?? [];
    return items.find((job) => job.slug === jobParam || job.id === jobParam) ?? null;
  }, [jobParam, jobsQuery.data?.items]);

  const selectedJob = useMemo(() => {
    if (!panelJobRaw) return null;
    return workerJobCardFromApi(panelJobRaw);
  }, [panelJobRaw]);
  const useSplit = isLg === true;

  const selectJob = useCallback(
    (slug: string) => {
      router.replace(`${pathname}?job=${encodeURIComponent(slug)}`);
    },
    [pathname, router],
  );

  const selectJobAndApply = useCallback(
    (slug: string) => {
      router.replace(`${pathname}?job=${encodeURIComponent(slug)}&apply=1`);
    },
    [pathname, router],
  );

  const closePanel = useCallback(() => {
    router.replace(pathname);
  }, [pathname, router]);

  const submitSearch = useCallback(() => {
    const term = q.trim();
    if (!term) {
      router.push("/worker/jobs");
      return;
    }
    router.push(`/worker/jobs/search?q=${encodeURIComponent(term)}`);
  }, [q, router]);

  const showPanel = useSplit && !!jobParam;
  const panelDetailQuery = useWorkerJob(showPanel ? (jobParam ?? "") : "");

  const panelDetailMatches = useMemo(
    () => matchesWorkerJobId(panelDetailQuery.data, jobParam ?? ""),
    [panelDetailQuery.data, jobParam],
  );
  const panelDetail = panelDetailMatches ? panelDetailQuery.data : undefined;
  const panelDetailLoading =
    !selectedJob ||
    !panelDetailMatches ||
    (panelDetailQuery.isFetching && !panelDetailQuery.isFetched);

  const jobMenuItems = useCallback(
    (job: WorkerJobCard): JobPostingCardMenuItem[] => [
      {
        label: t("menu.share"),
        onSelect: () => {
          if (typeof window === "undefined" || !navigator.clipboard) return;
          void navigator.clipboard.writeText(`${window.location.origin}/worker/jobs/${job.slug}`);
        },
      },
      {
        label: t("menu.report"),
        onSelect: () =>
          reportJob.mutate({
            jobId: job.slug,
            body: { reason: "OTHER", description: "Reported from worker portal" },
          }),
        destructive: true,
      },
      {
        label: t("menu.hide"),
        onSelect: () => hideJob.mutate(job.slug),
        destructive: true,
      },
    ],
    [hideJob, reportJob, t],
  );

  useEffect(() => {
    if (isLg !== true || !jobParam || jobsQuery.isLoading) return;
    if (jobsQuery.isError || (!jobsQuery.isLoading && !panelJobRaw)) {
      router.replace(pathname);
    }
  }, [isLg, jobParam, panelJobRaw, jobsQuery.isError, jobsQuery.isLoading, pathname, router]);

  useEffect(() => {
    if (isLg === null || isLg) return;
    if (!jobParam) return;
    const apply = searchParams.get("apply") === "1";
    router.replace(`/worker/jobs/${jobParam}${apply ? "?apply=1" : ""}`);
  }, [isLg, jobParam, router, searchParams]);

  useEffect(() => {
    setQ(queryParam);
  }, [queryParam]);

  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-1 flex-col gap-3 bg-[var(--joballa-page-tint)] max-[599px]:-mx-2 max-[599px]:w-[calc(100%+1rem)] min-[600px]:mx-0 min-[600px]:w-full sm:gap-5 md:gap-6 lg:min-h-0 lg:flex-1",
        showPanel && "lg:h-[calc(100dvh-7rem)] lg:overflow-hidden",
      )}
    >
      <h1 className="sr-only">{searchMode ? t("resultsTitle") : t("title")}</h1>

      <div className="flex w-full flex-col gap-2 min-[600px]:gap-3">
        <div className="flex min-w-0 items-stretch gap-2">
          <form
            className={portalSearchFormClass}
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch();
            }}
          >
            <label className="flex min-w-0 flex-1 cursor-text items-stretch border-r border-[var(--joballa-control-border)]">
              <span className="sr-only">{t("searchPlaceholder")}</span>
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="min-w-0 flex-1 border-0 bg-transparent px-2.5 py-2 text-sm font-normal leading-6 text-[var(--joballa-fg)] outline-none ring-[var(--joballa-primary)] placeholder:text-[var(--joballa-muted)] focus-visible:ring-2 min-[600px]:px-3 min-[600px]:text-base"
              />
            </label>
            <button
              type="submit"
              className="flex w-16 shrink-0 items-center justify-center text-[var(--joballa-muted)] transition hover:text-[var(--joballa-fg)]"
              aria-label={t("submitSearch")}
            >
              <IconSearch className="size-4" />
            </button>
          </form>
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            className={portalFilterButtonClass}
            aria-expanded={filtersOpen}
            aria-label={t("filtersButton")}
          >
            <IconFilter className="size-4" />
            <span className="hidden min-[600px]:inline">{t("filtersButton")}</span>
          </button>
        </div>

        {filtersOpen ? (
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 lg:justify-start">
            <WorkerJobFilterDropdown
              tone="toolbar"
              label={t("filters.region")}
              valueLabel={regionLabel}
              options={regionSelectOptions}
              icon={<IconMap className="size-4" />}
              open={openKey === "r"}
              onToggle={() => setOpenKey((k) => (k === "r" ? null : "r"))}
              onPick={(v) => {
                setRegionId(v as CameroonRegionId | typeof REGION_ALL);
                setCity(CITY_ALL);
              }}
            />
            <WorkerJobFilterDropdown
              tone="toolbar"
              label={t("filters.city")}
              valueLabel={cityLabel}
              options={citySelectOptions}
              icon={<IconPin className="size-4" />}
              open={openKey === "c"}
              onToggle={() => setOpenKey((k) => (k === "c" ? null : "c"))}
              onPick={setCity}
            />
            <WorkerJobFilterDropdown
              tone="toolbar"
              label={t("filters.type")}
              valueLabel={typeLabel}
              options={typeSelectOptions}
              icon={<IconBriefcase className="size-4" />}
              open={openKey === "ty"}
              onToggle={() => setOpenKey((k) => (k === "ty" ? null : "ty"))}
              onPick={setType}
            />
            <WorkerJobFilterDropdown
              tone="toolbar"
              label={t("filters.pay")}
              valueLabel={payLabel}
              options={paySelectOptions}
              icon={<IconWallet className="size-4" />}
              open={openKey === "p"}
              onToggle={() => setOpenKey((k) => (k === "p" ? null : "p"))}
              onPick={setPay}
            />
            <WorkerJobFilterDropdown
              tone="toolbar"
              label={t("filters.department")}
              valueLabel={deptLabel}
              options={deptSelectOptions}
              icon={<IconBuilding className="size-4" />}
              open={openKey === "d"}
              onToggle={() => setOpenKey((k) => (k === "d" ? null : "d"))}
              onPick={setDept}
            />
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          "flex min-h-0 w-full flex-1 flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6",
          showPanel && "lg:grid lg:h-[calc(100dvh-8.5rem)] lg:grid-cols-[minmax(340px,0.78fr)_minmax(0,1.22fr)] lg:items-start lg:gap-6 lg:overflow-hidden",
        )}
      >
        <div className="flex min-w-0 min-h-0 flex-1 flex-col gap-3 max-lg:max-w-full lg:min-h-0 lg:overflow-y-auto lg:pr-1">
          <div className="flex flex-wrap items-center justify-end gap-2 min-[600px]:gap-3">
            <div className={portalSegmentGroupClass}>
              <button
                type="button"
                className={portalSegmentButtonClass(grid)}
                aria-pressed={grid}
                aria-label={t("viewGrid")}
                onClick={() => setGrid(true)}
              >
                <IconGrid className="size-5" />
              </button>
              <button
                type="button"
                className={portalSegmentButtonClass(!grid)}
                aria-pressed={!grid}
                aria-label={t("viewList")}
                onClick={() => setGrid(false)}
              >
                <IconList className="size-5" />
              </button>
            </div>
          </div>

          <div className="min-h-[28rem] w-full">
          {jobsQuery.isLoading ? (
            <WorkerFindJobsPageSkeleton cards={6} grid={grid} />
          ) : jobsQuery.isError ? (
            <PortalEmptyState description={jobsQuery.error instanceof JoballaApiError ? jobsQuery.error.message : t("loadError")} />
          ) : filteredJobs.length === 0 ? (
            <PortalEmptyState title={t("emptySearchTitle")} description={t("emptySearch")} />
          ) : grid ? (
            <div
              className={cn(
                "grid gap-3 sm:grid-cols-2 sm:gap-4",
                showPanel ? "lg:grid-cols-1 xl:grid-cols-1" : "lg:grid-cols-3",
              )}
            >
              {filteredJobs.map((job) => (
                <WorkerJobGridCard
                  key={job.id}
                  job={job}
                  topLine={t("posted", { time: job.posted })}
                  matchLabel={job.match != null ? t("match", { pct: job.match }) : undefined}
                  bookmarkLabel={t("bookmark")}
                  bookmarkFilled={!!job.isSaved}
                  moreMenuAriaLabel={t("cardMenu")}
                  applyLabel={t("apply")}
                  showApply={canApplyToJob(job)}
                  appliedLabel={isJobApplied(job) ? tJobDetail("applied") : undefined}
                  menuItems={jobMenuItems(job)}
                  splitPane={useSplit}
                  isActive={useSplit && job.slug === jobParam}
                  onSelectJob={selectJob}
                  onApplyInPane={selectJobAndApply}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] shadow-[var(--joballa-shadow-card)]">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--joballa-border)] text-xs font-semibold text-[var(--joballa-muted)]">
                    <th className="px-4 py-3">{t("listColPosted")}</th>
                    <th className="px-4 py-3">{t("listColTitle")}</th>
                    <th className="px-4 py-3">{t("listColCompany")}</th>
                    <th className="px-4 py-3">{t("listColPay")}</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job) => (
                    <tr
                      key={job.id}
                      className="cursor-pointer border-b border-[var(--joballa-border)] last:border-0 hover:bg-[var(--joballa-row-hover)]"
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest("[data-card-stop]")) return;
                        if (useSplit) selectJob(job.slug);
                        else void router.push(`/worker/jobs/${job.slug}`);
                      }}
                    >
                      <td className="px-4 py-3 text-[var(--joballa-muted)]">{job.posted}</td>
                      <td className="px-4 py-3 font-semibold text-[var(--joballa-fg)]">{job.title}</td>
                      <td className="px-4 py-3 text-[var(--joballa-fg)]">{job.company}</td>
                      <td className="px-4 py-3 text-[var(--joballa-fg)]">{job.pay}</td>
                      <td className="px-4 py-3 text-right" data-card-stop>
                        {canApplyToJob(job) ? (
                          useSplit ? (
                            <button
                              type="button"
                              onClick={() => selectJobAndApply(job.slug)}
                              className="font-semibold text-[var(--joballa-primary)] hover:underline"
                            >
                              {t("apply")}
                            </button>
                          ) : (
                            <Link
                              href={`/worker/jobs/${job.slug}?apply=1`}
                              className="font-semibold text-[var(--joballa-primary)] hover:underline"
                            >
                              {t("apply")}
                            </Link>
                          )
                        ) : isJobApplied(job) ? (
                          <span className="text-sm font-semibold text-[var(--joballa-muted)]">{tJobDetail("applied")}</span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </div>

        {showPanel ? (
          <aside className="hidden w-full max-w-full self-start rounded-[22px] border border-[var(--joballa-border)] bg-[var(--joballa-page)] p-3 lg:flex lg:max-h-[calc(100dvh-8.5rem)] lg:flex-col lg:overflow-y-auto">
            {!selectedJob || panelDetailLoading ? (
              <WorkerJobDetailPanelSkeleton />
            ) : (
              <WorkerJobDetailView
                key={jobParam}
                job={selectedJob}
                jobId={jobParam!}
                isSaved={!!(panelDetail?.saved ?? panelDetail?.isSaved)}
                detail={panelDetail}
                variant="panel"
                onClosePanel={closePanel}
              />
            )}
          </aside>
        ) : null}
      </div>
    </div>
  );
}

export function WorkerFindJobsView({ searchMode = false }: { searchMode?: boolean }) {
  return (
    <Suspense fallback={<FindJobsFallback />}>
      <WorkerFindJobsViewInner searchMode={searchMode} />
    </Suspense>
  );
}
