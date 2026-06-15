"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/lib/i18n/navigation";
import {
  CAMEROON_CITIES_BY_REGION,
  CAMEROON_REGION_IDS,
  DEFAULT_CAMEROON_REGION,
  getCitiesForRegion,
  type CameroonRegionId,
} from "@/lib/cameroon-region-cities";
import { useSavedJobs, useWorkerApplications, useWorkerDepartmentOptions } from "@/features/worker/hooks";
import { buildJobSearchParams, jobMatchesPayFilter } from "@/features/worker/lib/job-search-params";
import { workerApplicationRowsFromApi } from "@/features/worker/lib/application-mappers";
import { workerJobCardFromApi } from "@/features/worker/lib/job-mappers";
import { canShowWorkerJobApply } from "@/features/worker/lib/job-apply-eligibility";
import { JoballaApiError } from "@/lib/joballa/request";
import { WorkerFindJobsPageSkeleton } from "@/components/worker/worker-loading-skeletons";
import { WorkerJobGridCard } from "@/components/worker/worker-job-grid-card";
import { WorkerJobFilterDropdown } from "@/components/worker/worker-job-filter-dropdown";
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
import { cn } from "@/lib/utils";

const CITY_ALL = "__ALL__";
const REGION_ALL = "__ALL__";
const FILTER_ALL = "__ALL__";

export function WorkerSavedJobsView() {
  const router = useRouter();
  const t = useTranslations("worker.savedJobsPage");
  const tf = useTranslations("worker.findJobsPage");
  const tJobDetail = useTranslations("worker.jobDetail");
  const [grid, setGrid] = useState(true);
  const [q, setQ] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [regionId, setRegionId] = useState<CameroonRegionId | typeof REGION_ALL>(REGION_ALL);
  const [city, setCity] = useState(CITY_ALL);

  const typeOptions = useMemo(() => (tf.raw("typeOptions") as string[]) ?? [], [tf]);
  const { departments: departmentCatalog } = useWorkerDepartmentOptions();
  const deptOptions = useMemo(
    () => departmentCatalog.map((dept) => dept.name).filter(Boolean) as string[],
    [departmentCatalog],
  );
  const payOptions = useMemo(() => (tf.raw("payOptions") as string[]) ?? [], [tf]);

  const [type, setType] = useState(FILTER_ALL);
  const [pay, setPay] = useState(FILTER_ALL);
  const [dept, setDept] = useState(FILTER_ALL);

  const regionSelectOptions = useMemo(
    () =>
      [{ value: REGION_ALL, label: tf("regionAll") }].concat(CAMEROON_REGION_IDS.map((id) => ({
        value: id,
        label: tf(`regions.${id}` as "regions.littoral"),
      }))),
    [tf],
  );

  const citySelectOptions = useMemo(() => {
    const cities =
      regionId === REGION_ALL
        ? Array.from(new Set(Object.values(CAMEROON_CITIES_BY_REGION).flat())).sort()
        : getCitiesForRegion(regionId);
    return [{ value: CITY_ALL, label: tf("cityAll") }, ...cities.map((c) => ({ value: c, label: c }))];
  }, [regionId, tf]);

  const typeSelectOptions = useMemo(() => [{ value: FILTER_ALL, label: tf("typeAll") }, ...typeOptions.map((x) => ({ value: x, label: x }))], [tf, typeOptions]);
  const paySelectOptions = useMemo(() => [{ value: FILTER_ALL, label: tf("payAll") }, ...payOptions.map((x) => ({ value: x, label: x }))], [payOptions, tf]);
  const deptSelectOptions = useMemo(() => [{ value: FILTER_ALL, label: tf("deptAll") }, ...deptOptions.map((x) => ({ value: x, label: x }))], [deptOptions, tf]);

  const regionLabel = regionId === REGION_ALL ? tf("regionAll") : tf(`regions.${regionId}` as "regions.littoral");
  const typeLabel = type === FILTER_ALL ? tf("typeAll") : type;
  const payLabel = pay === FILTER_ALL ? tf("payAll") : pay;
  const deptLabel = dept === FILTER_ALL ? tf("deptAll") : dept;
  const savedSearchParams = useMemo(
    () =>
      buildJobSearchParams({
        city: city === CITY_ALL ? undefined : city,
        jobTypeLabel: type === FILTER_ALL ? undefined : type,
        payLabel: pay === FILTER_ALL ? undefined : pay,
        category: dept === FILTER_ALL ? undefined : dept,
        departments: departmentCatalog,
      }),
    [city, departmentCatalog, dept, pay, type],
  );

  const savedQuery = useSavedJobs(savedSearchParams);
  const appsQuery = useWorkerApplications({ limit: 100 });
  const [listNow] = useState(() => Date.now());

  const cityLabel = city === CITY_ALL ? tf("cityAll") : city;

  const rows = useMemo(() => {
    let items = savedQuery.data?.items ?? [];
    if (regionId !== REGION_ALL && city === CITY_ALL) {
      const regionCities = new Set(getCitiesForRegion(regionId));
      items = items.filter((item) => item.job?.city && regionCities.has(item.job.city));
    }
    if (pay !== FILTER_ALL) {
      items = items.filter(
        (item) =>
          item.job &&
          jobMatchesPayFilter(
            item.job as Record<string, unknown> & { payRate?: number | string | null },
            pay,
          ),
      );
    }
    const appliedJobIds = new Set(workerApplicationRowsFromApi(appsQuery.data?.items ?? []).map((app) => app.linkedJobSlug).filter(Boolean));
    return items.filter((item) => item.job).map((item) => {
      const job = workerJobCardFromApi(item.job);
      const savedAt = item.savedAt ? new Date(item.savedAt).getTime() : NaN;
      let time = "";
      if (!Number.isNaN(savedAt)) {
        const days = Math.floor((listNow - savedAt) / 86400000);
        time = days < 1 ? "1d" : days < 7 ? `${days}d` : `${Math.floor(days / 7)}w`;
      }
      return { slug: job.slug, kind: "posted" as const, time, job, applied: appliedJobIds.has(job.slug) };
    });
  }, [appsQuery.data?.items, city, listNow, pay, regionId, savedQuery.data?.items]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (r) =>
        r.job.title.toLowerCase().includes(needle) ||
        r.job.company.toLowerCase().includes(needle) ||
        r.job.subtitle.toLowerCase().includes(needle) ||
        r.job.department.toLowerCase().includes(needle) ||
        r.job.employmentType.toLowerCase().includes(needle) ||
        r.job.seniority.toLowerCase().includes(needle),
    );
  }, [rows, q]);

  const jobMenuItems = useCallback(
    (job: (typeof rows)[number]["job"]) => [
      {
        label: tf("menu.share"),
        onSelect: () => {
          if (typeof window === "undefined" || !navigator.clipboard) return;
          void navigator.clipboard.writeText(`${window.location.origin}/worker/jobs/${job.slug}`);
        },
      },
    ],
    [tf],
  );

  if (savedQuery.isLoading) {
    return <WorkerFindJobsPageSkeleton cards={4} />;
  }

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-3 bg-[var(--joballa-page-tint)] max-[599px]:-mx-2 max-[599px]:w-[calc(100%+1rem)] min-[600px]:mx-0 min-[600px]:w-full sm:gap-5 md:gap-6 lg:gap-[26px]">
      <h1 className="sr-only">{t("title")}</h1>

      <div className="flex w-full flex-col gap-2 min-[600px]:gap-3">
        <div className="flex min-w-0 items-stretch gap-2 min-[600px]:gap-3">
          <div className="flex h-11 w-full min-w-0 flex-1 overflow-hidden rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)]">
            <label className="flex min-w-0 flex-1 cursor-text items-stretch border-r border-[var(--joballa-border)]">
              <span className="sr-only">{t("searchPlaceholder")}</span>
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="min-w-0 flex-1 border-0 bg-transparent px-2.5 py-2 text-sm font-normal leading-6 text-[var(--joballa-fg)] outline-none ring-[var(--joballa-primary)] placeholder:text-[var(--joballa-muted)] focus-visible:ring-2 min-[600px]:px-3 min-[600px]:text-base"
              />
            </label>
            <div className="flex w-12 shrink-0 items-center justify-center text-[var(--joballa-muted)] min-[600px]:w-16" aria-hidden>
              <IconSearch className="size-4" />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            className="inline-flex h-11 w-fit shrink-0 items-center gap-2 rounded-full border border-[var(--joballa-border-strong)] bg-[var(--joballa-card)] px-3 text-sm font-medium text-[var(--joballa-fg)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none ring-[var(--joballa-primary)] transition hover:border-[var(--joballa-primary)] focus-visible:ring-2 min-[600px]:px-4"
            aria-expanded={filtersOpen}
            aria-label={tf("filtersButton")}
          >
            <IconFilter className="size-4" />
            <span className="hidden min-[600px]:inline">{tf("filtersButton")}</span>
          </button>
        </div>

        {filtersOpen ? (
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 lg:justify-start">
          <WorkerJobFilterDropdown
            tone="toolbar"
            label={tf("filters.region")}
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
            label={tf("filters.city")}
            valueLabel={cityLabel}
            options={citySelectOptions}
            icon={<IconPin className="size-4" />}
            open={openKey === "c"}
            onToggle={() => setOpenKey((k) => (k === "c" ? null : "c"))}
            onPick={setCity}
          />
          <WorkerJobFilterDropdown
            tone="toolbar"
            label={tf("filters.type")}
            valueLabel={typeLabel}
            options={typeSelectOptions}
            icon={<IconBriefcase className="size-4" />}
            open={openKey === "ty"}
            onToggle={() => setOpenKey((k) => (k === "ty" ? null : "ty"))}
            onPick={setType}
          />
          <WorkerJobFilterDropdown
            tone="toolbar"
            label={tf("filters.pay")}
            valueLabel={payLabel}
            options={paySelectOptions}
            icon={<IconWallet className="size-4" />}
            open={openKey === "p"}
            onToggle={() => setOpenKey((k) => (k === "p" ? null : "p"))}
            onPick={setPay}
          />
          <WorkerJobFilterDropdown
            tone="toolbar"
            label={tf("filters.department")}
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

      <div className="flex flex-wrap items-center justify-end gap-2 min-[600px]:gap-3">
        <div className="flex items-center rounded-[10px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-1 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <button
            type="button"
            className={cn("rounded-md p-0.5 text-[var(--joballa-muted)] transition-colors", grid && "bg-[var(--joballa-segment-active)] text-[var(--joballa-fg)]")}
            aria-pressed={grid}
            onClick={() => setGrid(true)}
          >
            <IconGrid className="size-5" />
          </button>
          <button
            type="button"
            className={cn("rounded-md p-0.5 text-[var(--joballa-muted)] transition-colors", !grid && "bg-[var(--joballa-segment-active)] text-[var(--joballa-fg)]")}
            aria-pressed={!grid}
            onClick={() => setGrid(false)}
          >
            <IconList className="size-5" />
          </button>
        </div>
      </div>

      {savedQuery.isError ? (
        <p className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] px-4 py-8 text-center text-sm text-[var(--joballa-muted)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] min-[600px]:px-6 min-[600px]:py-10">
          {savedQuery.error instanceof JoballaApiError ? savedQuery.error.message : t("loadError")}
        </p>
      ) : filtered.length === 0 ? (
        <p className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] px-4 py-8 text-center text-sm text-[var(--joballa-muted)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] min-[600px]:px-6 min-[600px]:py-10">
          {t("empty")}
        </p>
      ) : grid ? (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {filtered.map(({ job, time, applied }) => (
            <WorkerJobGridCard
              key={job.id}
              job={job}
              topLine={time ? tf("posted", { time }) : t("savedBookmark")}
              matchLabel={job.match != null ? tf("match", { pct: job.match }) : undefined}
              bookmarkLabel={t("savedBookmark")}
              bookmarkFilled
              moreMenuAriaLabel={t("cardMenu")}
              menuItems={jobMenuItems(job)}
              applyLabel={tf("apply")}
              showApply={canShowWorkerJobApply(job, applied)}
              appliedLabel={applied ? tJobDetail("applied") : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--joballa-border)] text-xs font-semibold text-[var(--joballa-muted)]">
                <th className="px-4 py-3">{t("listColStatus")}</th>
                <th className="px-4 py-3">{t("listColTitle")}</th>
                <th className="px-4 py-3">{t("listColCompany")}</th>
                <th className="px-4 py-3">{t("listColPay")}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ job, kind, time, applied }) => (
                <tr
                  key={job.id}
                  className="cursor-pointer border-b border-[var(--joballa-border)] last:border-0 hover:bg-[var(--joballa-row-hover)]"
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest("[data-card-stop]")) return;
                    void router.push(`/worker/jobs/${job.slug}`);
                  }}
                >
                  <td className="px-4 py-3 text-[var(--joballa-muted)]">
                    {time ? tf("posted", { time }) : t("savedBookmark")}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[var(--joballa-fg)]">{job.title}</td>
                  <td className="px-4 py-3 text-[var(--joballa-fg)]">{job.company}</td>
                  <td className="px-4 py-3 text-[var(--joballa-fg)]">{job.pay}</td>
                  <td className="px-4 py-3 text-right" data-card-stop>
                    {canShowWorkerJobApply(job, applied) ? (
                      <Link href={`/worker/jobs/${job.slug}?apply=1`} className="font-semibold text-[var(--joballa-primary)] hover:underline">
                        {tf("apply")}
                      </Link>
                    ) : applied ? (
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
  );
}
