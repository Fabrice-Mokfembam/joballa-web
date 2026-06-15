"use client";

import { Suspense, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, usePathname, useRouter } from "@/lib/i18n/navigation";
import { JobPostingCard } from "@/components/job-posting/job-posting-card";
import type { JobPostingCardMenuItem } from "@/components/job-posting/job-posting-card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { portalPageShellClass } from "@/components/portal/portal-ui";
import { buttonClassName } from "@/components/ui/button";
import { IconPlus } from "@/components/worker/icons";
import { WorkerOwnedJobDetailView } from "@/components/worker/worker-owned-job-detail-view";
import { useWorkerMe, useWorkerOwnedJobs, useDeleteWorkerOwnedJob } from "@/features/worker/hooks";
import { publishWorkerPostedJob } from "@/features/worker/api";
import { toastApiError, toastSuccess } from "@/features/employer/lib/mutation-feedback";
import { workerKeys } from "@/features/worker/query-keys";
import { profileInitials } from "@/features/worker/lib/profile-display";
import { WorkerApplicationsPageSkeleton } from "@/components/worker/worker-loading-skeletons";
import { useMediaQuery } from "@/lib/use-media-query";
import { useConfirmAction } from "@/lib/hooks/use-confirm-action";
import { jobStatusPillClass } from "@/lib/job-status-pill";
import { cn } from "@/lib/utils";

function formatPosted(iso?: string): string {
  if (!iso) return "";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days < 1) return "today";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

const JOB_STATUS_KEYS = ["draft", "under_review", "live", "paused", "closed", "suspended"] as const;

function formatJobStatus(status: string, t: ReturnType<typeof useTranslations>): string {
  const key = status.toLowerCase().replace(/\s+/g, "_");
  if ((JOB_STATUS_KEYS as readonly string[]).includes(key)) {
    return t(`status.${key as (typeof JOB_STATUS_KEYS)[number]}`);
  }
  return status.replace(/_/g, " ");
}

function normalizeStatus(status: string): string {
  return status.toLowerCase().replace(/\s+/g, "_");
}

function jobMenuItems(
  job: { jobId: string; status?: string | null },
  t: ReturnType<typeof useTranslations>,
  router: ReturnType<typeof useRouter>,
  onPublish: (jobId: string) => void,
  onDelete: (jobId: string) => void,
  publishingJobId: string | null,
): JobPostingCardMenuItem[] {
  const normalized = normalizeStatus(String(job.status ?? ""));
  const items: JobPostingCardMenuItem[] = [];

  items.push({
    label: t("actions.viewDetails"),
    onSelect: () => void router.push(`/worker/my-jobs?job=${encodeURIComponent(job.jobId)}`),
  });

  if (normalized === "draft") {
    items.push({
      label: publishingJobId === job.jobId ? t("actions.publishing") : t("actions.publish"),
      onSelect: () => onPublish(job.jobId),
    });
    items.push({
      label: t("actions.delete"),
      onSelect: () => onDelete(job.jobId),
      destructive: true,
    });
  }

  if (normalized !== "closed") {
    items.push({
      label: t("actions.edit"),
      onSelect: () => void router.push(`/worker/jobs/new?edit=${encodeURIComponent(job.jobId)}`),
    });
  }

  if (normalized === "live" || normalized === "active") {
    items.push({
      label: t("actions.viewApplicants"),
      onSelect: () => void router.push(`/worker/engagements?jobId=${encodeURIComponent(job.jobId)}`),
    });
  }

  return items;
}

function WorkerMyJobsViewInner() {
  const t = useTranslations("worker.myJobs");
  const tDetail = useTranslations("worker.jobDetail");
  const tc = useTranslations("common.confirm");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isLg = useMediaQuery("(min-width: 1024px)");
  const jobParam = searchParams.get("job");
  const { requestConfirm, dialogProps } = useConfirmAction();
  const meQuery = useWorkerMe();
  const jobsQuery = useWorkerOwnedJobs({ page: 1, limit: 50 });
  const jobs = useMemo(() => jobsQuery.data?.items ?? [], [jobsQuery.data?.items]);
  const wp = meQuery.data?.workerProfile;
  const posterName = wp?.fullName?.trim() || meQuery.data?.email || t("title");
  const posterAvatarUrl = wp?.avatarUrl ?? null;
  const posterInitial = profileInitials(posterName);
  const qc = useQueryClient();
  const publishMutation = useMutation({
    mutationFn: (jobId: string) => publishWorkerPostedJob(jobId),
    onSuccess: (data, jobId) => {
      if (data.message) toastSuccess(data.message);
      void qc.invalidateQueries({ queryKey: workerKeys.ownedJob(jobId) });
      void qc.invalidateQueries({ queryKey: workerKeys.ownedJobs() });
    },
    onError: (e) => toastApiError(e, "Could not submit job for review."),
  });
  const deleteJob = useDeleteWorkerOwnedJob();
  const showPanel = !!jobParam && isLg === true;

  const closePanel = useCallback(() => {
    router.replace(pathname);
  }, [pathname, router]);

  const handlePublish = useCallback(
    (jobId: string) => {
      requestConfirm({
        title: t("publishConfirm.title"),
        description: t("publishConfirm.description"),
        confirmLabel: t("actions.publish"),
        cancelLabel: tc("cancel"),
        onConfirm: () => publishMutation.mutate(jobId),
      });
    },
    [publishMutation, requestConfirm, t, tc],
  );

  const handleDelete = useCallback(
    (jobId: string) => {
      requestConfirm({
        title: tc("deleteJobPosting.title"),
        description: tc("deleteJobPosting.description"),
        confirmLabel: tc("deleteJobPosting.confirm"),
        cancelLabel: tc("cancel"),
        destructive: true,
        onConfirm: () =>
          deleteJob.mutate(jobId, {
            onSuccess: () => {
              if (jobParam === jobId) {
                router.replace(pathname);
              }
            },
          }),
      });
    },
    [deleteJob, jobParam, pathname, requestConfirm, router, tc],
  );

  const buildMenu = useCallback(
    (job: (typeof jobs)[number]) =>
      jobMenuItems(
        job,
        t,
        router,
        handlePublish,
        handleDelete,
        publishMutation.isPending ? publishMutation.variables ?? null : null,
      ),
    [handleDelete, handlePublish, publishMutation.isPending, publishMutation.variables, router, t],
  );

  if (jobsQuery.isLoading) return <WorkerApplicationsPageSkeleton />;

  return (
    <div className={cn(portalPageShellClass, showPanel && "lg:min-h-0 lg:flex-1")}>
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h1 className="min-w-0 text-lg font-semibold text-[var(--joballa-fg)] sm:text-xl">{t("title")}</h1>
          <Link
            href="/worker/jobs/new"
            className={cn(buttonClassName("primary"), "inline-flex shrink-0 gap-2 text-sm")}
          >
            <IconPlus className="size-4" />
            {t("postJob")}
          </Link>
        </div>
        <p className="text-sm text-[var(--joballa-muted)]">{t("description")}</p>
      </header>

      <div
        className={cn(
          "flex min-h-0 w-full flex-1 flex-col gap-4 lg:flex-row lg:items-start lg:gap-6",
          showPanel && "lg:max-h-[calc(100dvh-8.5rem)]",
        )}
      >
        <div className={cn("min-w-0 flex-1", showPanel && "lg:min-h-0 lg:overflow-y-auto lg:pr-1")}>
          {jobs.length === 0 ? (
            <p className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] px-6 py-10 text-center text-sm text-[var(--joballa-muted)]">
              {t("empty")}
            </p>
          ) : (
            <div className={cn("grid gap-3 sm:grid-cols-2 sm:gap-4", showPanel ? "lg:grid-cols-1 xl:grid-cols-1" : "lg:grid-cols-3")}>
              {jobs.map((job) => {
                const statusLabel = formatJobStatus(String(job.status ?? ""), t);
                const selected = jobParam === job.jobId;
                const isDraft = normalizeStatus(String(job.status ?? "")) === "draft";
                const payLine = job.salary?.trim() || "—";
                const jobTypeLabel = job.jobType
                  ? String(job.jobType).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                  : "";
                const locationLine = [job.location, jobTypeLabel].filter(Boolean).join(" • ");
                const applicantsPill =
                  job.applicantsCount != null
                    ? t("applicantsCount", {
                        count: job.applicantsCount,
                        defaultValue:
                          job.applicantsCount === 1
                            ? "1 applicant"
                            : `${job.applicantsCount} applicants`,
                      })
                    : "";
                return (
                  <JobPostingCard
                    key={job.jobId}
                    postedLabel={formatPosted(job.postedAt)}
                    title={job.title}
                    scheduleLabel=""
                    locationLabel={locationLine}
                    pillTags={[payLine, applicantsPill].filter(Boolean)}
                    companyName={posterName}
                    posterRoleLabel={tDetail("posterType.worker")}
                    companyLogoUrl={posterAvatarUrl}
                    companyInitial={posterInitial}
                    companyAvatarClassName="bg-[var(--joballa-primary)]"
                    applyLabel=""
                    bookmarkLabel={t("bookmark")}
                    showApply={false}
                    showBookmark={false}
                    actionLabel={isDraft ? (publishMutation.isPending && publishMutation.variables === job.jobId ? t("actions.publishing") : t("actions.publish")) : undefined}
                    onActionClick={isDraft ? () => handlePublish(job.jobId) : undefined}
                    statusPill={{
                      label: statusLabel,
                      className: jobStatusPillClass(String(job.status ?? "")),
                    }}
                    menuItems={buildMenu(job)}
                    moreMenuAriaLabel={t("menu")}
                    className={selected ? "ring-2 ring-[var(--joballa-primary)]" : undefined}
                    onCardClick={() => void router.push(`/worker/my-jobs?job=${encodeURIComponent(job.jobId)}`)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {jobParam && !showPanel ? (
          <div className="w-full lg:hidden">
            <WorkerOwnedJobDetailView jobId={jobParam} variant="panel" onClose={closePanel} />
          </div>
        ) : null}

        {showPanel && jobParam ? (
          <aside className="hidden w-full max-w-full self-start rounded-[22px] border border-[var(--joballa-border)] bg-[var(--joballa-page)] p-3 lg:flex lg:max-h-[calc(100dvh-8.5rem)] lg:w-[min(100%,520px)] lg:flex-col lg:overflow-y-auto">
            <WorkerOwnedJobDetailView jobId={jobParam} variant="panel" onClose={closePanel} />
          </aside>
        ) : null}
      </div>
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}

export function WorkerMyJobsView() {
  return (
    <Suspense fallback={<WorkerApplicationsPageSkeleton />}>
      <WorkerMyJobsViewInner />
    </Suspense>
  );
}
