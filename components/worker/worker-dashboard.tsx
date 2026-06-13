"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/lib/i18n/navigation";
import {
  useHideWorkerJob,
  useReportWorkerJob,
  useSaveWorkerJob,
  useWorkerDashboard,
  useWorkerFullProfile,
  useWorkerProfileCompleteness,
} from "@/features/worker/hooks";
import { profileSectionCompletion } from "@/features/worker/lib/profile-display";
import { workerApplicationRowsFromApi } from "@/features/worker/lib/application-mappers";
import { workerJobCardsFromApi } from "@/features/worker/lib/job-mappers";
import type { WorkerJobCard } from "@/lib/worker-job-data";
import type { WorkerApplicationRow } from "@/lib/worker-applications-data";
import { WorkerJobPostingCard } from "@/components/job-posting/worker-job-posting-card";
import { IconGrid, IconList } from "@/components/worker/icons";
import { SimpleDialog } from "@/components/worker/dashboard/simple-dialog";
import { JobCardSkeleton, WorkerStatCardSkeleton } from "@/components/worker/worker-loading-skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type StatKey = "applications" | "earnings" | "views" | "strength";

function postedRank(posted: string): number {
  const m = posted.match(/^(\d+)(d|w|mo)$/);
  if (!m) return 9999;
  const n = Number.parseInt(m[1]!, 10);
  const u = m[2]!;
  if (u === "d") return n;
  if (u === "w") return n * 7;
  return n * 30;
}

function sortJobs(jobs: WorkerJobCard[]): WorkerJobCard[] {
  return [...jobs].sort((a, b) => postedRank(a.posted) - postedRank(b.posted));
}

function DashboardJobCard({
  job,
  t,
  grid,
  showApply = true,
}: {
  job: WorkerJobCard;
  t: (key: string, values?: Record<string, string | number>) => string;
  grid: boolean;
  showApply?: boolean;
}) {
  const router = useRouter();
  const saveJob = useSaveWorkerJob();
  const hideJob = useHideWorkerJob();
  const reportJob = useReportWorkerJob();
  const menuItems = [
    { label: t("recommended.apply"), onSelect: () => void router.push(`/worker/jobs/${job.slug}?apply=1`) },
    { label: t("recommended.save"), onSelect: () => saveJob.mutate(job.slug) },
    {
      label: t("recommended.share"),
      onSelect: () => {
        if (typeof window !== "undefined" && navigator.clipboard) {
          void navigator.clipboard.writeText(`${window.location.origin}/worker/jobs/${job.slug}`);
        }
      },
    },
    {
      label: t("recommended.flag"),
      onSelect: () =>
        reportJob.mutate({
          jobId: job.slug,
          body: { reason: "OTHER", description: "Reported from worker dashboard" },
        }),
    },
    { label: t("recommended.hide"), onSelect: () => hideJob.mutate(job.slug), destructive: true },
  ];

  return (
    <WorkerJobPostingCard
      className={cn(!grid && "min-w-[280px]")}
      job={job}
      postedLabel={t("recommended.posted", { time: job.posted })}
      matchTextOverride={job.match != null ? t("recommended.match", { pct: job.match }) : undefined}
      bookmarkLabel={t("recommended.bookmark")}
      applyLabel={t("recommended.apply")}
      showApply={showApply}
      moreMenuAriaLabel={t("recommended.menu")}
      titleHref={null}
      applyHref={null}
      onCardClick={() => void router.push(`/worker/jobs/${job.slug}`)}
      onApplyClick={() => void router.push(`/worker/jobs/${job.slug}?apply=1`)}
      menuItems={menuItems}
    />
  );
}

export function WorkerDashboard() {
  const t = useTranslations("worker.dashboardPage");
  const router = useRouter();
  const dashboardQuery = useWorkerDashboard();
  const profileCompleteness = useWorkerProfileCompleteness();
  const profileQuery = useWorkerFullProfile();
  const dashboard = dashboardQuery.data;
  const profileName =
    dashboard?.greeting?.name ??
    profileQuery.data?.firstName ??
    profileQuery.data?.fullName?.split(" ")[0] ??
    "there";

  const profileSections = useMemo(() => {
    const keys = ["personal", "summary", "skills", "education", "work", "verification", "payment"] as const;
    if (!profileQuery.data) return { done: [] as string[], todo: [] as string[] };
    const completion = profileSectionCompletion(profileQuery.data);
    const done: string[] = [];
    const todo: string[] = [];
    for (const key of keys) {
      const label = t(`profileStrength.sections.${key}`);
      if (completion[key]) done.push(label);
      else todo.push(label);
    }
    return { done, todo };
  }, [profileQuery.data, t]);
  const [grid, setGrid] = useState(true);
  const [applicationDialog, setApplicationDialog] = useState<WorkerApplicationRow | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const profileComplete = profileCompleteness >= 100;
  const statsLoading = dashboardQuery.isLoading;
  const recommendedLoading = dashboardQuery.isLoading;
  const applicationsLoading = dashboardQuery.isLoading;
  const profileStrengthLoading = profileQuery.isLoading;

  const stats = useMemo(
    () =>
      [
        { k: "applications" as const },
        { k: "earnings" as const },
        { k: "views" as const },
        ...(profileComplete ? [] : [{ k: "strength" as const }]),
      ] as const,
    [profileComplete],
  );

  const statHint = (k: StatKey) => {
    return t(`stats.${k}.hintMonth`);
  };

  const apiJobs = useMemo(
    () => workerJobCardsFromApi(dashboard?.recommendedJobs ?? []),
    [dashboard?.recommendedJobs],
  );
  const recommendedPool = useMemo(() => sortJobs(apiJobs), [apiJobs]);
  const recommendedGrid = useMemo(() => recommendedPool.slice(0, 3), [recommendedPool]);
  const recommendedTable = useMemo(() => recommendedPool.slice(0, 4), [recommendedPool]);

  const applicationRows = useMemo(() => {
    return workerApplicationRowsFromApi(dashboard?.applications ?? []).slice(0, 5);
  }, [dashboard?.applications]);

  const appliedJobIds = useMemo(
    () =>
      new Set(
        workerApplicationRowsFromApi(dashboard?.applications ?? [])
          .map((app) => app.linkedJobSlug)
          .filter(Boolean),
      ),
    [dashboard?.applications],
  );

  const isJobApplied = useCallback(
    (job: WorkerJobCard) => appliedJobIds.has(job.slug) || appliedJobIds.has(job.id) || !!job.hasApplied,
    [appliedJobIds],
  );

  const earningsStats = useMemo(() => {
    const earnings = dashboard?.stats?.earnings;
    if (!earnings?.amount) return { total: t("stats.earnings.value") };
    const currency = earnings.currency ?? "XAF";
    return { total: `${Number(earnings.amount).toLocaleString()} ${currency}` };
  }, [dashboard?.stats?.earnings, t]);

  const statDisplay: Record<StatKey, string> = {
    applications:
      dashboard?.stats?.activeApplications?.count != null
        ? String(dashboard.stats.activeApplications.count).padStart(2, "0")
        : t("stats.applications.value"),
    earnings: dashboard?.stats?.earnings?.amount != null ? earningsStats.total : t("stats.earnings.value"),
    views:
      dashboard?.stats?.profileViews?.count != null
        ? String(dashboard.stats.profileViews.count)
        : t("stats.views.value"),
    strength: `${profileCompleteness}%`,
  };

  const statusLabel = (status: WorkerApplicationRow["status"]) => {
    if (status === "shortlisted") return t("applications.statusShortlisted");
    if (status === "pending") return t("applications.statusPending");
    return t("applications.statusRejected");
  };

  return (
    <>
      <div className="flex w-full min-w-0 flex-1 flex-col gap-4 bg-[var(--joballa-page-tint)] sm:gap-5 md:gap-6">
        {profileCompleteness < 100 ? (
          <div className="-mx-4 -mt-3 flex items-center justify-between gap-4 px-4 py-4 text-[var(--joballa-fg)] min-[600px]:-mx-6 min-[600px]:-mt-4 min-[600px]:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10">
            <div className="min-w-0">
              <p className="text-sm font-semibold sm:text-base">
                {dashboard?.greeting?.profileSetupMessage ?? t("setupBanner.title", { name: profileName })}
              </p>
              <p className="mt-1 text-xs font-medium text-[var(--joballa-muted)] sm:text-sm">{t("profileStrength.percent", { pct: profileCompleteness })}</p>
            </div>
            <Link href="/worker/profile" className="shrink-0 text-sm font-bold text-[var(--joballa-primary)] hover:underline sm:text-base">
              {t("setupBanner.cta")}
            </Link>
          </div>
        ) : null}
        <div
          className={cn(
            "grid gap-2.5 min-[420px]:grid-cols-2 sm:gap-3",
            profileComplete ? "xl:grid-cols-3" : "xl:grid-cols-4",
          )}
        >
          {statsLoading
            ? Array.from({ length: profileComplete ? 3 : 4 }).map((_, i) => <WorkerStatCardSkeleton key={i} />)
            : stats.map(({ k }) => (
                <div
                  key={k}
                  className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] px-3 py-4 shadow-sm sm:px-3.5 sm:py-5"
                >
                  <p className="text-[10px] font-bold uppercase leading-3.5 tracking-normal text-[var(--joballa-muted)] sm:text-xs sm:leading-4">
                    {t(`stats.${k}.label`)}
                  </p>
                  <div className="mt-2 flex items-end justify-between gap-1.5 sm:mt-3 sm:gap-2">
                    <p className="text-2xl font-semibold leading-7 text-[var(--joballa-fg)] sm:text-3xl sm:leading-8 md:text-4xl md:leading-10 lg:text-5xl lg:leading-[48px]">
                      {statDisplay[k]}
                    </p>
                    <p
                      className={cn(
                        "max-w-[88px] shrink-0 text-right text-[10px] font-semibold leading-3.5 text-[var(--joballa-muted)] sm:max-w-[120px] sm:text-xs sm:leading-4",
                        k === "strength" && "text-[var(--joballa-primary)]",
                      )}
                    >
                      {statHint(k)}
                    </p>
                  </div>
                </div>
              ))}
        </div>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-baseline gap-3">
              <h2 className="text-base font-semibold leading-6 text-[var(--joballa-fg)] sm:text-lg sm:leading-7">
                {t("recommended.title")}
              </h2>
              <Link
                href="/worker/jobs"
                className="border-b border-current text-xs font-semibold text-[var(--joballa-fg)] hover:text-[var(--joballa-primary)] sm:text-sm"
              >
                {t("recommended.seeAll")}
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <div className="flex items-center rounded-[10px] border border-[var(--joballa-border)] p-1">
                <button
                  type="button"
                  className={cn(
                    "rounded-md p-0.5",
                    grid ? "bg-[var(--joballa-tag-bg)] text-[var(--joballa-fg)]" : "text-[var(--joballa-muted)]",
                  )}
                  aria-pressed={grid}
                  aria-label={t("recommended.viewGrid")}
                  onClick={() => setGrid(true)}
                >
                  <IconGrid className="size-5" />
                </button>
                <button
                  type="button"
                  className={cn(
                    "rounded-md p-0.5",
                    !grid ? "bg-[var(--joballa-tag-bg)] text-[var(--joballa-fg)]" : "text-[var(--joballa-muted)]",
                  )}
                  aria-pressed={!grid}
                  aria-label={t("recommended.viewList")}
                  onClick={() => setGrid(false)}
                >
                  <IconList className="size-5" />
                </button>
              </div>
            </div>
          </div>

          {recommendedLoading ? (
            grid ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <JobCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="mb-3 h-10 w-full last:mb-0" />
                ))}
              </div>
            )
          ) : grid ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recommendedGrid.map((job) => (
                <DashboardJobCard key={job.id} job={job} t={t} grid showApply={!isJobApplied(job)} />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)]">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--joballa-border)] text-xs font-semibold text-[var(--joballa-muted)]">
                    <th className="px-4 py-3">{t("recommended.table.posted")}</th>
                    <th className="px-4 py-3">{t("recommended.table.employer")}</th>
                    <th className="px-4 py-3">{t("recommended.table.jobTitle")}</th>
                    <th className="px-4 py-3">{t("recommended.table.pay")}</th>
                    <th className="px-4 py-3">{t("recommended.table.jobType")}</th>
                    <th className="px-4 py-3">{t("recommended.table.location")}</th>
                    <th className="px-4 py-3">{t("recommended.table.match")}</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {recommendedTable.map((job) => (
                    <tr
                      key={job.id}
                      className="cursor-pointer border-b border-[var(--joballa-border)] last:border-0 hover:bg-[var(--joballa-row-hover)]/60"
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest("[data-card-stop]")) return;
                        void router.push(`/worker/jobs/${job.slug}`);
                      }}
                    >
                      <td className="px-4 py-3 text-[var(--joballa-muted)]">{job.posted}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "flex size-7 items-center justify-center rounded-full text-[10px] font-bold text-white",
                              job.companyColor,
                            )}
                          >
                            {job.companyInitial}
                          </div>
                          <span className="font-medium">{job.company}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold">{job.title}</td>
                      <td className="px-4 py-3">{job.pay}</td>
                      <td className="px-4 py-3">{job.subtitle.split("•")[0]?.trim()}</td>
                      <td className="px-4 py-3">{job.subtitle.split("•")[1]?.trim()}</td>
                      <td className="px-4 py-3">{job.match != null ? `${job.match}%` : ""}</td>
                      <td className="px-4 py-3 text-right" data-card-stop>
                        {!isJobApplied(job) ? (
                          <Link
                            href={`/worker/jobs/${job.slug}?apply=1`}
                            className="font-semibold text-[var(--joballa-primary)] hover:underline"
                          >
                            {t("recommended.apply")}
                          </Link>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <section className="w-full max-w-[600px]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-baseline gap-3">
                <h2 className="text-base font-semibold leading-6 text-[var(--joballa-fg)] sm:text-lg sm:leading-7">
                  {t("applications.title")}
                </h2>
                <Link
                  href="/worker/applications"
                  className="border-b border-current text-xs font-semibold text-[var(--joballa-fg)] hover:text-[var(--joballa-primary)] sm:text-sm"
                >
                  {t("applications.seeAll")}
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              {applicationsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] px-4 py-4 shadow-sm sm:px-5 sm:py-5"
                  >
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="mt-3 h-4 w-1/2" />
                  </div>
                ))
              ) : applicationRows.length === 0 ? (
                <p className="rounded-[14px] border border-dashed border-[var(--joballa-border)] bg-[var(--joballa-card)] p-6 text-center text-sm text-[var(--joballa-muted)]">
                  {t("applications.emptyFiltered")}
                </p>
              ) : (
                applicationRows.map((row) => (
                  <Link
                    key={row.slug}
                    href={`/worker/applications/${row.slug}`}
                    className="block rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] px-4 py-4 shadow-sm transition hover:border-[color-mix(in_srgb,var(--joballa-primary)_35%,var(--joballa-border))] hover:bg-[var(--joballa-row-hover)] sm:px-5 sm:py-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-base font-bold leading-6 text-[var(--joballa-fg)] sm:text-lg sm:leading-7">{row.jobTitle}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-semibold",
                            row.status === "shortlisted" && "bg-[var(--joballa-jade-3)] text-[var(--joballa-primary)]",
                            row.status === "pending" && "bg-[var(--joballa-tag-bg)] text-[var(--joballa-muted)]",
                            row.status === "rejected" && "bg-[var(--joballa-danger-bg)] text-[var(--joballa-danger-fg)]",
                          )}
                        >
                          {statusLabel(row.status)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-col items-start justify-between gap-2 min-[480px]:flex-row min-[480px]:items-center min-[480px]:gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="relative flex size-7 shrink-0 overflow-hidden rounded-full bg-[var(--joballa-avatar-bg)]">
                          {row.companyLogoUrl ? (
                            <Image src={row.companyLogoUrl} alt="" fill className="object-cover" sizes="28px" unoptimized={row.companyLogoUrl.startsWith("http")} />
                          ) : (
                            <span
                              className={cn(
                                "flex size-full items-center justify-center text-[10px] font-bold text-[var(--joballa-on-primary)]",
                                row.companyColor,
                              )}
                            >
                              {row.companyInitial}
                            </span>
                          )}
                        </span>
                        <p className="min-w-0 truncate text-sm font-semibold text-[var(--joballa-muted)]">{row.company}</p>
                      </div>
                      <p className="shrink-0 text-xs text-[var(--joballa-muted)]">
                        {t("applications.applied", { time: row.appliedTime })}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          {!profileComplete ? (
          <section className="w-full max-w-[500px] self-start rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] px-4 py-5 shadow-sm sm:px-5 sm:py-6">
            {profileStrengthLoading ? (
              <div className="space-y-3" aria-busy>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2.5 w-full rounded-full" />
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-[14px]" />
              </div>
            ) : (
            <>
            <h2 className="text-base font-semibold leading-6 text-[var(--joballa-fg)] sm:text-lg sm:leading-7">
              {t("profileStrength.title")}
            </h2>
            <p className="mt-2 text-xs font-semibold text-[var(--joballa-primary)] sm:text-sm">
              {t("profileStrength.percent", { pct: profileCompleteness })}
            </p>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[var(--joballa-tag-bg)]">
              <div
                className="h-full rounded-full bg-[var(--joballa-primary)]"
                style={{ width: `${Math.min(100, profileCompleteness)}%` }}
              />
            </div>
            <p className="mt-4 text-[10px] font-semibold uppercase text-[var(--joballa-muted)] sm:text-xs">
              {t("profileStrength.subtitle")}
            </p>
            <ul className="mt-3 space-y-2">
              {profileSections.done.map((label) => (
                <li key={`d-${label}`} className="flex items-center gap-2 text-xs sm:text-sm">
                  <span className="flex size-6 items-center justify-center rounded-full bg-[var(--joballa-primary)] text-xs font-bold text-white">
                    ✓
                  </span>
                  <span className="font-bold text-[var(--joballa-primary)]">{label}</span>
                </li>
              ))}
              {profileSections.todo.map((label) => (
                <li key={`t-${label}`} className="flex items-center gap-2 text-xs sm:text-sm">
                  <span className="flex size-6 items-center justify-center rounded-full border border-[var(--joballa-border)] bg-[var(--joballa-card)]" />
                  <span className="text-[var(--joballa-muted)]">{label}</span>
                </li>
              ))}
              {profileSections.done.length === 0 && profileSections.todo.length === 0 ? (
                <li className="text-xs text-[var(--joballa-muted)] sm:text-sm">{t("profileStrength.empty")}</li>
              ) : null}
            </ul>
            <button
              type="button"
              className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-[14px] bg-[var(--joballa-primary)] text-sm font-semibold text-[var(--joballa-on-primary)] transition hover:opacity-95"
              onClick={() => setProfileDialogOpen(true)}
            >
              {t("profileBoostCta")}
            </button>
            </>
            )}
          </section>
          ) : null}
        </div>
      </div>

      <SimpleDialog
        open={applicationDialog != null}
        onOpenChange={(open) => {
          if (!open) setApplicationDialog(null);
        }}
        title={t("dialogs.applicationTitle")}
        description={
          applicationDialog
            ? t("dialogs.applicationIntro", { title: applicationDialog.jobTitle, company: applicationDialog.company })
            : null
        }
        footer={
          applicationDialog ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] px-4 text-sm font-semibold text-[var(--joballa-fg)] hover:bg-[var(--joballa-row-hover)]"
                onClick={() => setApplicationDialog(null)}
              >
                {t("dialogs.close")}
              </button>
              <Link
                href={`/worker/applications/${applicationDialog.slug}`}
                className="inline-flex h-10 items-center justify-center rounded-[14px] bg-[var(--joballa-primary)] px-4 text-sm font-semibold text-[var(--joballa-on-primary)] hover:opacity-95"
                onClick={() => setApplicationDialog(null)}
              >
                {t("dialogs.viewFull")}
              </Link>
              {applicationDialog.linkedJobSlug ? (
                <Link
                  href={`/worker/jobs/${applicationDialog.linkedJobSlug}?apply=1`}
                  className="inline-flex h-10 items-center justify-center rounded-[14px] border border-[var(--joballa-primary)] bg-transparent px-4 text-sm font-semibold text-[var(--joballa-primary)] hover:bg-[var(--joballa-jade-3)]"
                  onClick={() => setApplicationDialog(null)}
                >
                  {t("dialogs.viewJob")}
                </Link>
              ) : null}
            </div>
          ) : null
        }
      />

      <SimpleDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        title={t("dialogs.profileTitle")}
        description={t("dialogs.profileIntro")}
        footer={
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-[14px] border border-[var(--joballa-border)] px-4 text-sm font-semibold hover:bg-[var(--joballa-row-hover)]"
              onClick={() => setProfileDialogOpen(false)}
            >
              {t("dialogs.close")}
            </button>
            <Link
              href="/worker/profile"
              className="inline-flex h-10 items-center justify-center rounded-[14px] bg-[var(--joballa-primary)] px-4 text-sm font-semibold text-[var(--joballa-on-primary)] hover:opacity-95"
              onClick={() => setProfileDialogOpen(false)}
            >
              {t("dialogs.profileCta")}
            </Link>
          </div>
        }
      />
    </>
  );
}
