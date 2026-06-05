"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useArchiveWorkerApplication, useWorkerApplications, useWorkerIncomingApplications } from "@/features/worker/hooks";
import type { WorkerIncomingApplicationListItem } from "@/features/worker/types/worker-portal";
import { workerApplicationRowsFromApi } from "@/features/worker/lib/application-mappers";
import { useConfirmAction } from "@/lib/hooks/use-confirm-action";
import type { WorkerApplicationRow, WorkerApplicationStatus } from "@/lib/worker-applications-data";
import { JoballaApiError } from "@/lib/joballa/request";
import { WorkerApplicationsPageSkeleton } from "@/components/worker/worker-loading-skeletons";
import { IconGrid, IconList, IconSearch } from "@/components/worker/icons";
import { cn } from "@/lib/utils";

type TabKey = "all" | WorkerApplicationStatus;
type ContextMenuState = { slug: string; x: number; y: number } | null;
type ApplicationMode = "outgoing" | "incoming";

function formatRelativeTime(iso?: string): string {
  if (!iso) return "now";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "now";
  const diffMs = Date.now() - date.getTime();
  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  if (days === 0) return "today";
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}w`;
  if (days < 365) return `${Math.floor(days / 30)}mo`;
  return `${Math.floor(days / 365)}yr`;
}

function mapIncomingStatus(status?: string): WorkerApplicationStatus {
  const normalized = String(status ?? "").toLowerCase();
  if (normalized === "shortlisted" || normalized === "hired") return "shortlisted";
  if (normalized === "rejected") return "rejected";
  return "pending";
}

function incomingApplicationRowFromApi(app: WorkerIncomingApplicationListItem): WorkerApplicationRow {
  const applicantName = app.applicantName ?? "Applicant";
  const match = typeof app.matchPercent === "number" ? app.matchPercent : null;
  return {
    slug: String(app.applicationId ?? app.id ?? ""),
    jobTitle: app.jobTitle ?? "",
    company: applicantName,
    companyInitial: applicantName.trim().charAt(0).toUpperCase(),
    companyColor: "bg-teal-600",
    companyLogoUrl: typeof app.applicantAvatarUrl === "string" ? app.applicantAvatarUrl : null,
    status: mapIncomingStatus(String(app.status ?? "")),
    appliedTime: formatRelativeTime(app.appliedAt),
    pay: "",
    jobType: "",
    location: "",
    matchPct: match,
    linkedJobSlug: app.jobId,
  };
}

function statusBadgeClass(status: WorkerApplicationStatus) {
  switch (status) {
    case "shortlisted":
      return "bg-[var(--joballa-jade-3)] text-[var(--joballa-primary)] ring-1 ring-[var(--joballa-primary)]/25";
    case "pending":
      return "bg-[var(--joballa-tag-bg)] text-[var(--joballa-muted)] ring-1 ring-[var(--joballa-border)]";
    case "rejected":
      return "bg-[var(--joballa-danger-bg)] text-[var(--joballa-danger-fg)] ring-1 ring-red-500/25";
    default:
      return "bg-[var(--joballa-tag-bg)] text-[var(--joballa-tag-fg)]";
  }
}

function applicationHref(app: WorkerApplicationRow, mode: ApplicationMode) {
  return mode === "incoming"
    ? `/worker/applications?mode=incoming&applicationId=${encodeURIComponent(app.slug)}`
    : `/worker/applications/${app.slug}`;
}

function footerLine(app: WorkerApplicationRow, t: ReturnType<typeof useTranslations>) {
  if (app.timelineNoteKey === "interview") return t("timeline.interview");
  if (app.timelineNoteKey === "offerDue") return t("timeline.offerDue");
  return t("applied", { time: app.appliedTime });
}

function incomingFooterLine(app: WorkerApplicationRow, t: ReturnType<typeof useTranslations>) {
  return t("incomingApplied", { time: app.appliedTime });
}

function CompanyMark({ app, size = "md" }: { app: WorkerApplicationRow; size?: "sm" | "md" }) {
  const pixelSize = size === "sm" ? 32 : 40;
  const sizeClass = size === "sm" ? "size-8" : "size-10";

  if (app.companyLogoUrl) {
    return (
      <Image
        src={app.companyLogoUrl}
        alt=""
        width={pixelSize}
        height={pixelSize}
        unoptimized={app.companyLogoUrl.startsWith("http")}
        className={cn(sizeClass, "shrink-0 rounded-full object-cover")}
      />
    );
  }

  return (
    <span className={cn("grid shrink-0 place-items-center rounded-full bg-black text-sm font-bold text-white", sizeClass)}>
      {app.companyInitial || "J"}
    </span>
  );
}

function WorkerApplicationsViewInner({ searchMode = false }: { searchMode?: boolean }) {
  const t = useTranslations("worker.applications");
  const tc = useTranslations("common.confirm");
  const { requestConfirm, dialogProps } = useConfirmAction();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") ?? "";
  const [q, setQ] = useState(() => queryParam);
  const [tab, setTab] = useState<TabKey>("all");
  const [mode, setMode] = useState<ApplicationMode>("outgoing");
  const [grid, setGrid] = useState(true);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

  const appsQuery = useWorkerApplications({ page: 1, limit: 50 });
  const incomingQuery = useWorkerIncomingApplications({
    page: 1,
    limit: 50,
    enabled: mode === "incoming",
  });
  const archiveApp = useArchiveWorkerApplication();

  const allRows = useMemo(
    () => workerApplicationRowsFromApi(appsQuery.data?.items ?? []),
    [appsQuery.data?.items],
  );
  const incomingRows = useMemo(
    () => (incomingQuery.data?.items ?? []).map(incomingApplicationRowFromApi).filter((row) => row.slug),
    [incomingQuery.data?.items],
  );
  const activeRows = mode === "outgoing" ? allRows : incomingRows;

  const counts = useMemo(
    () => ({
      all: activeRows.length,
      shortlisted: activeRows.filter((a) => a.status === "shortlisted").length,
      pending: activeRows.filter((a) => a.status === "pending").length,
      rejected: activeRows.filter((a) => a.status === "rejected").length,
    }),
    [activeRows],
  );

  const submittedQuery = searchMode ? queryParam.trim().toLowerCase() : "";

  const submitSearch = useCallback(() => {
    const term = q.trim();
    if (!term) {
      router.push("/worker/applications");
      return;
    }
    router.push(`/worker/applications/search?q=${encodeURIComponent(term)}`);
  }, [q, router]);

  useEffect(() => {
    setQ(queryParam);
  }, [queryParam]);

  const filtered = useMemo(() => {
    let rows = activeRows;
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
  }, [activeRows, tab, submittedQuery]);

  const contextApp = contextMenu ? filtered.find((app) => app.slug === contextMenu.slug) : undefined;

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

  if (activeQuery.isLoading) {
    return <WorkerApplicationsPageSkeleton />;
  }

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-5 bg-[var(--joballa-page-tint)] sm:gap-6">
      <h1 className="sr-only">{searchMode ? t("resultsTitle") : t("title")}</h1>

      <div className="flex w-full flex-col gap-5 sm:gap-8">
        <div className="flex w-full flex-wrap gap-2">
          {(["outgoing", "incoming"] as const).map((nextMode) => (
            <button
              key={nextMode}
              type="button"
              onClick={() => {
                setMode(nextMode);
                setTab("all");
                setContextMenu(null);
              }}
              className={cn(
                "inline-flex min-h-11 flex-1 items-center justify-center rounded-full px-4 text-sm font-semibold transition min-[520px]:flex-none min-[520px]:px-6",
                mode === nextMode
                  ? "bg-[var(--joballa-primary)] text-[var(--joballa-on-primary)] shadow-[var(--joballa-shadow-card)]"
                  : "border border-[var(--joballa-border)] bg-[var(--joballa-card)] text-[var(--joballa-fg)] hover:border-[var(--joballa-primary)]",
              )}
            >
              {t(`mode.${nextMode}`)}
            </button>
          ))}
        </div>

        <form
          className="flex h-16 min-w-0 overflow-hidden rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] sm:h-[76px]"
          onSubmit={(event) => {
            event.preventDefault();
            submitSearch();
          }}
        >
          <label className="flex min-w-0 flex-1 cursor-text items-stretch border-r border-[var(--joballa-border)]">
            <span className="sr-only">{t("searchPlaceholder")}</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={mode === "outgoing" ? t("searchPlaceholder") : t("incomingSearchPlaceholder")}
              className="min-w-0 flex-1 border-0 bg-transparent px-4 py-2 text-sm font-normal leading-6 text-[var(--joballa-fg)] outline-none ring-[var(--joballa-primary)] placeholder:text-[var(--joballa-muted)] focus-visible:ring-2 sm:px-5 sm:text-2xl"
            />
          </label>
          <button type="submit" className="flex w-16 shrink-0 items-center justify-center text-[var(--joballa-fg)] sm:w-24" aria-label={t("submitSearch")}>
            <IconSearch className="size-6" />
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav className="flex min-w-0 flex-wrap gap-2 sm:gap-8" aria-label={t("tabsAria")}>
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
                  "inline-flex h-10 shrink-0 items-center rounded-[12px] px-3 text-sm font-bold transition-colors sm:h-11 sm:px-4 sm:text-lg",
                  tab === key
                    ? "border border-[var(--joballa-border)] bg-[var(--joballa-card)] text-[var(--joballa-fg)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                    : "text-[var(--joballa-muted)] hover:text-[var(--joballa-fg)]",
                )}
              >
                {t(`tabs.${key}`, { count: String(n).padStart(2, "0") })}
              </button>
            ))}
          </nav>

          <div className="flex shrink-0 items-center rounded-[13px] border-2 border-[var(--joballa-border-strong)] bg-[var(--joballa-card)] p-1">
            <button
              type="button"
              className={cn("rounded-[9px] p-1 text-[var(--joballa-muted)] transition-colors", grid && "bg-[var(--joballa-segment-active)] text-[var(--joballa-fg)]")}
              aria-pressed={grid}
              aria-label={t("viewGrid")}
              onClick={() => setGrid(true)}
            >
              <IconGrid className="size-6" />
            </button>
            <button
              type="button"
              className={cn("rounded-[9px] p-1 text-[var(--joballa-muted)] transition-colors", !grid && "bg-[var(--joballa-segment-active)] text-[var(--joballa-fg)]")}
              aria-pressed={!grid}
              aria-label={t("viewList")}
              onClick={() => setGrid(false)}
            >
              <IconList className="size-6" />
            </button>
          </div>
        </div>
      </div>

      {searchMode && queryParam ? (
        <p className="text-sm font-medium text-[var(--joballa-muted)]">{t("resultsFor", { query: queryParam })}</p>
      ) : null}

      {activeQuery.isError ? (
        <p className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] px-6 py-10 text-center text-sm text-[var(--joballa-muted)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          {activeQuery.error instanceof JoballaApiError ? activeQuery.error.message : t("loadError")}
        </p>
      ) : filtered.length === 0 ? (
        <p className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] px-6 py-10 text-center text-sm text-[var(--joballa-muted)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          {mode === "outgoing" ? t("empty") : t("incomingEmpty")}
        </p>
      ) : grid ? (
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
          {filtered.map((app) => (
            <Link
              key={app.slug}
              href={applicationHref(app, mode)}
              className="flex min-h-[126px] min-w-0 flex-col justify-between rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] px-4 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition hover:border-[#0d7377]/35 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] sm:px-5 sm:py-5"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="min-w-0 text-xl font-bold leading-7 text-[var(--joballa-fg)] sm:text-2xl sm:leading-8">{app.jobTitle}</h2>
                <span className={cn("shrink-0 rounded-full px-3 py-1 text-sm font-bold sm:text-base", statusBadgeClass(app.status))}>
                  {t(`status.${app.status}`)}
                </span>
              </div>
              <div className="mt-4 flex flex-col items-start justify-between gap-3 min-[520px]:flex-row min-[520px]:items-center min-[520px]:gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <CompanyMark app={app} />
                  <span className="truncate text-base font-bold text-[var(--joballa-muted)] sm:text-xl">{app.company}</span>
                </div>
                <span className="shrink-0 text-sm font-medium text-[var(--joballa-muted)] sm:text-lg">
                  {mode === "outgoing" ? footerLine(app, t) : incomingFooterLine(app, t)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] px-4 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <table className="w-full min-w-[1040px] border-separate border-spacing-y-0 text-left text-base">
            <thead>
              <tr className="text-lg font-bold text-[var(--joballa-muted)]">
                <th className="px-3 py-4">{t("table.applied")}</th>
                <th className="px-3 py-4">{mode === "outgoing" ? t("table.employer") : t("table.applicant")}</th>
                <th className="px-3 py-4">{t("table.jobTitle")}</th>
                <th className="px-3 py-4">{t("table.pay")}</th>
                <th className="px-3 py-4">{t("table.jobType")}</th>
                <th className="px-3 py-4">{t("table.location")}</th>
                <th className="px-3 py-4">{t("table.match")}</th>
                <th className="px-3 py-4 text-right">{t("table.status")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr
                  key={app.slug}
                  onClick={() => router.push(applicationHref(app, mode))}
                  onContextMenu={(event) => openContextMenu(event, app)}
                  className={cn(
                    "cursor-pointer rounded-[14px] text-[var(--joballa-fg)] transition hover:bg-[var(--joballa-row-hover)]/80",
                    contextMenu?.slug === app.slug && "shadow-[inset_0_0_0_2px_var(--joballa-primary)]",
                  )}
                >
                  <td className="whitespace-nowrap rounded-l-[14px] px-3 py-5">
                    {mode === "outgoing"
                      ? app.timelineNoteKey
                        ? footerLine(app, t)
                        : t("table.appliedShort", { time: app.appliedTime })
                      : incomingFooterLine(app, t)}
                  </td>
                  <td className="px-3 py-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <CompanyMark app={app} size="sm" />
                      <span className="truncate font-medium text-[var(--joballa-fg)]">{app.company}</span>
                    </div>
                  </td>
                  <td className="max-w-[210px] truncate px-3 py-5 font-medium">{app.jobTitle}</td>
                  <td className="whitespace-nowrap px-3 py-5">
                    <div>{app.pay}</div>
                    {app.payUsd ? <div className="text-xs text-[var(--joballa-muted)]">{app.payUsd}</div> : null}
                  </td>
                  <td className="whitespace-nowrap px-3 py-5">{app.jobType}</td>
                  <td className="whitespace-nowrap px-3 py-5">{app.location}</td>
                  <td className="whitespace-nowrap px-3 py-5">{app.matchPct != null ? app.matchPct : ""}</td>
                  <td className="rounded-r-[14px] px-3 py-5 text-right">
                    <span className={cn("inline-flex rounded-full px-3 py-1 text-base font-bold", statusBadgeClass(app.status))}>
                      {t(`status.${app.status}`)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {contextMenu && contextApp ? (
        <>
          <button type="button" className="fixed inset-0 z-10 cursor-default bg-transparent" aria-hidden onClick={() => setContextMenu(null)} />
          <div
            className="fixed z-20 w-44 overflow-hidden rounded-lg border border-[var(--joballa-border)] bg-[var(--joballa-card)] py-1 text-lg shadow-md"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              type="button"
              className="block w-full px-4 py-2 text-left hover:bg-[var(--joballa-row-hover)]"
              onClick={() => router.push(applicationHref(contextApp, mode))}
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
