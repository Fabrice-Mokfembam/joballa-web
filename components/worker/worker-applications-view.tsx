"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useArchiveWorkerApplication, useWorkerApplications, useWorkerIncomingApplications } from "@/features/worker/hooks";
import type { WorkerIncomingApplicationListItem } from "@/features/worker/types/worker-portal";
import { workerApplicationRowsFromApi } from "@/features/worker/lib/application-mappers";
import { applicantMatchText, formatAppliedAgo } from "@/features/employer/lib/applicant-profile";
import { workerIncomingToApplicantListItem } from "@/features/worker/lib/incoming-applicant-mappers";
import { useConfirmAction } from "@/lib/hooks/use-confirm-action";
import type { WorkerApplicationRow, WorkerApplicationStatus } from "@/lib/worker-applications-data";
import { JoballaApiError } from "@/lib/joballa/request";
import { WorkerApplicationsPageSkeleton } from "@/components/worker/worker-loading-skeletons";
import { WorkerOutgoingApplicationCard } from "@/components/worker/worker-outgoing-application-card";
import {
  WorkerIncomingApplicantListCard,
  workerIncomingApplicationId,
} from "@/components/worker/worker-incoming-applicant-list-card";
import { WorkerIncomingApplicantDetailPanel } from "@/components/worker/worker-incoming-applicant-detail-panel";
import {
  portalPageShellClass,
  portalSegmentButtonClass,
  portalSegmentGroupClass,
} from "@/components/portal/portal-ui";
import { IconGrid, IconList, IconSearch } from "@/components/worker/icons";
import { useMediaQuery } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";

type TabKey = "all" | WorkerApplicationStatus;
type ContextMenuState = { slug: string; x: number; y: number } | null;
type ApplicationMode = "outgoing" | "incoming";

function mapIncomingStatus(status?: string): WorkerApplicationStatus {
  const normalized = String(status ?? "").toLowerCase();
  if (normalized === "shortlisted" || normalized === "hired") return "shortlisted";
  if (normalized === "rejected") return "rejected";
  return "pending";
}

function statusBadgeClass(status: WorkerApplicationStatus) {
  switch (status) {
    case "shortlisted":
      return "border border-[var(--joballa-jade-4)] bg-[var(--joballa-jade-3)] text-[var(--joballa-primary)]";
    case "pending":
      return "border border-[var(--joballa-pill-border)] bg-[var(--joballa-pill-bg)] text-[var(--joballa-muted)]";
    case "rejected":
      return "border border-[var(--joballa-danger-border)] bg-[var(--joballa-danger-soft)] text-[var(--joballa-danger-fg)]";
    default:
      return "border border-[var(--joballa-pill-border)] bg-[var(--joballa-pill-bg)] text-[var(--joballa-muted)]";
  }
}

function outgoingHref(slug: string) {
  return `/worker/applications/${slug}`;
}

function footerLine(app: WorkerApplicationRow, t: ReturnType<typeof useTranslations>) {
  if (app.timelineNoteKey === "interview") return t("timeline.interview");
  if (app.timelineNoteKey === "offerDue") return t("timeline.offerDue");
  return t("applied", { time: app.appliedTime });
}

function filterIncomingItems(
  items: WorkerIncomingApplicationListItem[],
  tab: TabKey,
  submittedQuery: string,
): WorkerIncomingApplicationListItem[] {
  let rows = items;
  if (tab !== "all") {
    rows = rows.filter((item) => mapIncomingStatus(String(item.status ?? "")) === tab);
  }
  if (submittedQuery) {
    rows = rows.filter((item) => {
      const applicant = String(item.applicantName ?? "").toLowerCase();
      const jobTitle = String(item.jobTitle ?? "").toLowerCase();
      return applicant.includes(submittedQuery) || jobTitle.includes(submittedQuery);
    });
  }
  return rows;
}

function WorkerApplicationsViewInner({ searchMode = false }: { searchMode?: boolean }) {
  const t = useTranslations("worker.applications");
  const tc = useTranslations("common.confirm");
  const { requestConfirm, dialogProps } = useConfirmAction();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLg = useMediaQuery("(min-width: 1024px)");
  const queryParam = searchParams.get("q") ?? "";
  const modeParam = searchParams.get("mode");
  const applicationIdParam = searchParams.get("applicationId");
  const mode: ApplicationMode = modeParam === "incoming" ? "incoming" : "outgoing";
  const [q, setQ] = useState(() => queryParam);
  const [tab, setTab] = useState<TabKey>("all");
  const [grid, setGrid] = useState(true);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

  const appsQuery = useWorkerApplications({ page: 1, limit: 50 });
  const incomingQuery = useWorkerIncomingApplications({
    page: 1,
    limit: 50,
    enabled: mode === "incoming",
  });
  const archiveApp = useArchiveWorkerApplication();

  const outgoingRows = useMemo(
    () => workerApplicationRowsFromApi(appsQuery.data?.items ?? []),
    [appsQuery.data?.items],
  );
  const incomingItems = useMemo(() => incomingQuery.data?.items ?? [], [incomingQuery.data?.items]);

  const outgoingCounts = useMemo(
    () => ({
      all: outgoingRows.length,
      shortlisted: outgoingRows.filter((a) => a.status === "shortlisted").length,
      pending: outgoingRows.filter((a) => a.status === "pending").length,
      rejected: outgoingRows.filter((a) => a.status === "rejected").length,
    }),
    [outgoingRows],
  );

  const incomingCounts = useMemo(
    () => ({
      all: incomingItems.length,
      shortlisted: incomingItems.filter((a) => mapIncomingStatus(String(a.status ?? "")) === "shortlisted").length,
      pending: incomingItems.filter((a) => mapIncomingStatus(String(a.status ?? "")) === "pending").length,
      rejected: incomingItems.filter((a) => mapIncomingStatus(String(a.status ?? "")) === "rejected").length,
    }),
    [incomingItems],
  );

  const counts = mode === "outgoing" ? outgoingCounts : incomingCounts;
  const submittedQuery = searchMode ? queryParam.trim().toLowerCase() : "";

  const filteredOutgoing = useMemo(() => {
    let rows = outgoingRows;
    if (tab !== "all") rows = rows.filter((a) => a.status === tab);
    if (submittedQuery) {
      rows = rows.filter(
        (a) =>
          a.jobTitle.toLowerCase().includes(submittedQuery) ||
          a.company.toLowerCase().includes(submittedQuery) ||
          a.location.toLowerCase().includes(submittedQuery),
      );
    }
    return rows;
  }, [outgoingRows, tab, submittedQuery]);

  const filteredIncoming = useMemo(
    () => filterIncomingItems(incomingItems, tab, submittedQuery),
    [incomingItems, tab, submittedQuery],
  );

  const selectedIncoming = useMemo(
    () =>
      incomingItems.find((item) => workerIncomingApplicationId(item) === applicationIdParam) ?? null,
    [applicationIdParam, incomingItems],
  );

  const useSplit = isLg === true;
  const showIncomingPanel = mode === "incoming" && useSplit && applicationIdParam != null;

  const submitSearch = useCallback(() => {
    const term = q.trim();
    if (!term) {
      router.push(mode === "incoming" ? "/worker/applications?mode=incoming" : "/worker/applications");
      return;
    }
    const modeQuery = mode === "incoming" ? "&mode=incoming" : "";
    router.push(`/worker/applications/search?q=${encodeURIComponent(term)}${modeQuery}`);
  }, [mode, q, router]);

  const setMode = useCallback(
    (nextMode: ApplicationMode) => {
      setTab("all");
      setContextMenu(null);
      router.replace(nextMode === "incoming" ? "/worker/applications?mode=incoming" : "/worker/applications");
    },
    [router],
  );

  const selectIncomingApplicant = useCallback(
    (id: string) => {
      router.replace(`/worker/applications?mode=incoming&applicationId=${encodeURIComponent(id)}`);
    },
    [router],
  );

  const closeIncomingPanel = useCallback(() => {
    router.replace("/worker/applications?mode=incoming");
  }, [router]);

  const openIncomingApplicant = useCallback(
    (id: string) => {
      if (useSplit) {
        selectIncomingApplicant(id);
        return;
      }
      router.push(`/worker/applications/incoming/${encodeURIComponent(id)}`);
    },
    [router, selectIncomingApplicant, useSplit],
  );

  useEffect(() => {
    setQ(queryParam);
  }, [queryParam]);

  useEffect(() => {
    if (isLg !== true || mode !== "incoming" || !applicationIdParam || incomingQuery.isLoading) return;
    if (incomingQuery.isSuccess && !selectedIncoming) {
      closeIncomingPanel();
    }
  }, [
    applicationIdParam,
    closeIncomingPanel,
    incomingQuery.isLoading,
    incomingQuery.isSuccess,
    isLg,
    mode,
    selectedIncoming,
  ]);

  useEffect(() => {
    if (isLg === null || isLg) return;
    if (mode !== "incoming" || !applicationIdParam) return;
    router.replace(`/worker/applications/incoming/${encodeURIComponent(applicationIdParam)}`);
  }, [applicationIdParam, isLg, mode, router]);

  const contextApp = contextMenu ? filteredOutgoing.find((app) => app.slug === contextMenu.slug) : undefined;

  const openContextMenu = useCallback((event: MouseEvent, app: WorkerApplicationRow) => {
    event.preventDefault();
    const width = 176;
    const height = 220;
    setContextMenu({
      slug: app.slug,
      x: Math.min(event.clientX, window.innerWidth - width - 12),
      y: Math.min(event.clientY, window.innerHeight - height - 12),
    });
  }, []);

  const archiveWithConfirm = useCallback(
    (app: WorkerApplicationRow) => {
      requestConfirm({
        title: tc("deleteApplication.title"),
        description: tc("deleteApplication.description"),
        confirmLabel: tc("deleteApplication.confirm"),
        cancelLabel: tc("cancel"),
        destructive: true,
        onConfirm: () => archiveApp.mutate(app.slug),
      });
    },
    [archiveApp, requestConfirm, tc],
  );

  const activeQuery = mode === "outgoing" ? appsQuery : incomingQuery;
  const isEmpty =
    mode === "outgoing" ? filteredOutgoing.length === 0 : filteredIncoming.length === 0;

  if (activeQuery.isLoading) {
    return <WorkerApplicationsPageSkeleton />;
  }

  return (
    <div className={portalPageShellClass}>
      <h1 className="sr-only">{searchMode ? t("resultsTitle") : t("title")}</h1>

      <div className="flex w-full flex-wrap gap-2">
        {(["outgoing", "incoming"] as const).map((nextMode) => (
          <button
            key={nextMode}
            type="button"
            onClick={() => setMode(nextMode)}
            className={cn(
              "inline-flex h-9 flex-1 items-center justify-center rounded-full px-4 text-sm font-medium transition min-[520px]:flex-none",
              mode === nextMode
                ? "bg-[var(--joballa-primary)] text-[var(--joballa-on-primary)]"
                : "border border-[var(--joballa-border)] bg-[var(--joballa-card)] text-[var(--joballa-fg)] hover:border-[color-mix(in_srgb,var(--joballa-primary)_35%,var(--joballa-border))]",
            )}
          >
            {t(`mode.${nextMode}`)}
          </button>
        ))}
      </div>

      <div className="flex w-full flex-col gap-[26px]">
        <form
          className="flex h-14 min-w-0 overflow-hidden rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)]"
          onSubmit={(event) => {
            event.preventDefault();
            submitSearch();
          }}
        >
          <label className="flex min-w-0 flex-1 cursor-text items-center border-r border-[var(--joballa-border)] px-3">
            <span className="sr-only">{t("searchPlaceholder")}</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={mode === "outgoing" ? t("searchPlaceholder") : t("incomingSearchPlaceholder")}
              className="min-w-0 flex-1 border-0 bg-transparent py-2 text-base font-normal leading-6 text-[var(--joballa-fg)] outline-none ring-[var(--joballa-primary)] placeholder:text-[var(--joballa-muted)] focus-visible:ring-2"
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

        <div className="flex flex-col gap-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav className="flex min-w-0 flex-wrap items-center gap-2.5" aria-label={t("tabsAria")}>
              {(
                [
                  ["all", counts.all],
                  ["shortlisted", counts.shortlisted],
                  ["pending", counts.pending],
                  ["rejected", counts.rejected],
                ] as const
              ).map(([key, n]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={cn(
                    "inline-flex h-8 shrink-0 items-center rounded-xl px-2.5 text-sm font-medium leading-5 transition-colors",
                    tab === key
                      ? "border border-[var(--joballa-border)] bg-[var(--joballa-card)] text-[var(--joballa-fg)]"
                      : "text-[var(--joballa-muted)] hover:text-[var(--joballa-fg)]",
                  )}
                >
                  {t(`tabs.${key}`, { count: String(n).padStart(2, "0") })}
                </button>
              ))}
            </nav>

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

          {searchMode && queryParam ? (
            <p className="text-sm text-[var(--joballa-muted)]">{t("resultsFor", { query: queryParam })}</p>
          ) : null}

          {activeQuery.isError ? (
            <p className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] px-6 py-10 text-center text-sm text-[var(--joballa-muted)] shadow-[var(--joballa-shadow-card)]">
              {activeQuery.error instanceof JoballaApiError ? activeQuery.error.message : t("loadError")}
            </p>
          ) : isEmpty ? (
            <p className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] px-6 py-10 text-center text-sm text-[var(--joballa-muted)] shadow-[var(--joballa-shadow-card)]">
              {mode === "outgoing" ? t("empty") : t("incomingEmpty")}
            </p>
          ) : mode === "incoming" ? (
            <div
              className={cn(
                "flex min-h-0 w-full flex-1 flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6",
                showIncomingPanel &&
                  "lg:grid lg:h-[calc(100dvh-8.5rem)] lg:grid-cols-[minmax(340px,0.78fr)_minmax(0,1.22fr)] lg:gap-6 lg:overflow-hidden",
              )}
            >
              <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 lg:overflow-y-auto lg:pr-1">
                {grid ? (
                  <div
                    className={cn(
                      "grid gap-3 sm:grid-cols-2 sm:gap-4",
                      showIncomingPanel ? "lg:grid-cols-1 xl:grid-cols-1" : "lg:grid-cols-2 xl:grid-cols-3",
                    )}
                  >
                    {filteredIncoming.map((application) => {
                      const id = workerIncomingApplicationId(application);
                      return (
                        <WorkerIncomingApplicantListCard
                          key={id}
                          application={application}
                          appliedLabel={t("incomingApplied", {
                            time: application.appliedAt ? formatAppliedAgo(application.appliedAt) : "—",
                          })}
                          isActive={showIncomingPanel && id === applicationIdParam}
                          onSelect={() => openIncomingApplicant(id)}
                          moreAriaLabel={t("moreActions")}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] shadow-[var(--joballa-shadow-card)]">
                    <table className="w-full min-w-[960px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-[var(--joballa-border)] text-xs font-semibold text-[var(--joballa-muted)]">
                          <th className="px-4 py-3">{t("table.applied")}</th>
                          <th className="px-4 py-3">{t("table.applicant")}</th>
                          <th className="px-4 py-3">{t("table.jobTitle")}</th>
                          <th className="px-4 py-3">{t("table.match")}</th>
                          <th className="px-4 py-3 text-right">{t("table.status")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredIncoming.map((application) => {
                          const id = workerIncomingApplicationId(application);
                          const applicant = workerIncomingToApplicantListItem(application);
                          const status = mapIncomingStatus(String(application.status ?? ""));
                          const match = applicantMatchText(applicant);
                          const isActive = useSplit && id === applicationIdParam;

                          return (
                            <tr
                              key={id}
                              onClick={() => openIncomingApplicant(id)}
                              className={cn(
                                "cursor-pointer border-b border-[var(--joballa-border)] text-[var(--joballa-fg)] last:border-0 hover:bg-[var(--joballa-row-hover)]",
                                isActive && "bg-[var(--joballa-row-selected)]",
                              )}
                            >
                              <td className="whitespace-nowrap px-4 py-3 text-[var(--joballa-muted)]">
                                {t("incomingApplied", {
                                  time: application.appliedAt ? formatAppliedAgo(application.appliedAt) : "—",
                                })}
                              </td>
                              <td className="px-4 py-3 font-medium">{application.applicantName ?? "—"}</td>
                              <td className="max-w-[210px] truncate px-4 py-3 font-semibold">{application.jobTitle}</td>
                              <td className="whitespace-nowrap px-4 py-3">{match ?? ""}</td>
                              <td className="px-4 py-3 text-right">
                                <span
                                  className={cn(
                                    "inline-flex rounded-[26px] px-2 py-0.5 text-xs font-semibold leading-4",
                                    statusBadgeClass(status),
                                  )}
                                >
                                  {t(`status.${status}`)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {showIncomingPanel && applicationIdParam ? (
                <aside className="hidden min-h-0 w-full lg:flex lg:max-h-[min(88vh,calc(100dvh-6.5rem))] lg:flex-col lg:overflow-hidden">
                  <WorkerIncomingApplicantDetailPanel
                    applicationId={applicationIdParam}
                    variant="panel"
                    onClose={closeIncomingPanel}
                  />
                </aside>
              ) : null}
            </div>
          ) : grid ? (
            <div className="grid gap-3.5 lg:grid-cols-2">
              {filteredOutgoing.map((app) => (
                <Link
                  key={app.slug}
                  href={outgoingHref(app.slug)}
                  className="block transition hover:opacity-95"
                >
                  <WorkerOutgoingApplicationCard
                    app={app}
                    statusLabel={t(`status.${app.status}`)}
                    appliedLabel={footerLine(app, t)}
                  />
                </Link>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] shadow-[var(--joballa-shadow-card)]">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--joballa-border)] text-xs font-semibold text-[var(--joballa-muted)]">
                    <th className="px-4 py-3">{t("table.applied")}</th>
                    <th className="px-4 py-3">{t("table.employer")}</th>
                    <th className="px-4 py-3">{t("table.jobTitle")}</th>
                    <th className="px-4 py-3">{t("table.pay")}</th>
                    <th className="px-4 py-3">{t("table.jobType")}</th>
                    <th className="px-4 py-3">{t("table.location")}</th>
                    <th className="px-4 py-3">{t("table.match")}</th>
                    <th className="px-4 py-3 text-right">{t("table.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOutgoing.map((app) => (
                    <tr
                      key={app.slug}
                      onClick={() => router.push(outgoingHref(app.slug))}
                      onContextMenu={(event) => openContextMenu(event, app)}
                      className={cn(
                        "cursor-pointer border-b border-[var(--joballa-border)] text-[var(--joballa-fg)] last:border-0 hover:bg-[var(--joballa-row-hover)]",
                        contextMenu?.slug === app.slug && "bg-[var(--joballa-row-hover)]",
                      )}
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-[var(--joballa-muted)]">
                        {app.timelineNoteKey
                          ? footerLine(app, t)
                          : t("table.appliedShort", { time: app.appliedTime })}
                      </td>
                      <td className="px-4 py-3">
                        <span className="truncate font-medium">{app.company}</span>
                      </td>
                      <td className="max-w-[210px] truncate px-4 py-3 font-semibold">{app.jobTitle}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div>{app.pay}</div>
                        {app.payUsd ? <div className="text-xs text-[var(--joballa-muted)]">{app.payUsd}</div> : null}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">{app.jobType}</td>
                      <td className="whitespace-nowrap px-4 py-3">{app.location}</td>
                      <td className="whitespace-nowrap px-4 py-3">{app.matchPct != null ? app.matchPct : ""}</td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={cn(
                            "inline-flex rounded-[26px] px-2 py-0.5 text-xs font-semibold leading-4",
                            statusBadgeClass(app.status),
                          )}
                        >
                          {t(`status.${app.status}`)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {contextMenu && contextApp ? (
        <>
          <button type="button" className="fixed inset-0 z-10 cursor-default bg-transparent" aria-hidden onClick={() => setContextMenu(null)} />
          <div
            className="fixed z-20 w-44 overflow-hidden rounded-lg border border-[var(--joballa-border)] bg-[var(--joballa-card)] py-1 text-sm shadow-md"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              type="button"
              className="block w-full px-4 py-2 text-left hover:bg-[var(--joballa-row-hover)]"
              onClick={() => router.push(outgoingHref(contextApp.slug))}
            >
              {t("rowMenu.open")}
            </button>
            <button type="button" className="block w-full px-4 py-2 text-left hover:bg-[var(--joballa-row-hover)]">
              {t("rowMenu.save")}
            </button>
            <button type="button" className="block w-full px-4 py-2 text-left hover:bg-[var(--joballa-row-hover)]">
              {t("rowMenu.share")}
            </button>
            <button type="button" className="block w-full px-4 py-2 text-left hover:bg-[var(--joballa-row-hover)]">
              {t("rowMenu.flag")}
            </button>
            <button
              type="button"
              className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
              onClick={() => {
                setContextMenu(null);
                archiveWithConfirm(contextApp);
              }}
            >
              {t("rowMenu.delete")}
            </button>
          </div>
        </>
      ) : null}

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}

export function WorkerApplicationsView({ searchMode = false }: { searchMode?: boolean }) {
  return (
    <Suspense fallback={null}>
      <WorkerApplicationsViewInner searchMode={searchMode} />
    </Suspense>
  );
}
