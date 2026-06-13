"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/lib/i18n/navigation";
import {
  useHideWorkerJob,
  useReportWorkerJob,
  useSaveWorkerJob,
  useUnsaveWorkerJob,
  useWorkerKyc,
  useWorkerMe,
  useWorkerApplications,
  useWorkerJobShare,
  useWorkerOwnedJobs,
} from "@/features/worker/hooks";
import { workerApplicationRowsFromApi } from "@/features/worker/lib/application-mappers";
import { getVerificationStatus, isPendingStatus, isVerifiedStatus } from "@/features/worker/lib/verification";
import { displayValue } from "@/features/worker/lib/display-value";
import { resolveJobPosterType } from "@/features/worker/lib/job-poster";
import type { WorkerJobDetail } from "@/features/worker/types/worker-portal";
import type { WorkerJobCard } from "@/lib/worker-job-data";
import { splitJobSubtitle } from "@/components/job-posting/worker-job-posting-card";
import { WorkerApplyFlow } from "@/components/worker/worker-apply-flow";
import { VerificationGateDialog } from "@/components/verification/verification-gate-dialog";
import { toast } from "@/lib/toast";
import {
  IconBookmark,
  IconBookmarkSolid,
  IconChevronLeft,
  IconClose,
  IconMoreHorizontal,
} from "@/components/worker/icons";
import { portalDetailSectionClass, portalIconButtonMutedClass } from "@/components/portal/portal-ui";
import { cn } from "@/lib/utils";

function DetailActionMenu({
  label,
  items,
}: {
  label: string;
  items: { label: string; onSelect: () => void; destructive?: boolean }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(portalIconButtonMutedClass, "size-10 rounded-[14px]")}
      >
        <IconMoreHorizontal className="size-5" />
      </button>
      {open ? (
        <>
          <button type="button" className="fixed inset-0 z-10 cursor-default bg-transparent" aria-hidden onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-[var(--joballa-border)] bg-[var(--joballa-dropdown-bg)] py-1 text-sm shadow-[var(--joballa-shadow-elevated)]">
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                className={cn(
                  "block w-full px-3 py-2 text-left text-[var(--joballa-fg)] hover:bg-[var(--joballa-row-hover)]",
                  item.destructive && "text-[var(--joballa-danger-fg)] hover:bg-[var(--joballa-danger-bg)]",
                )}
                onClick={() => {
                  item.onSelect();
                  setOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(9rem,auto)] items-start gap-4 text-sm leading-5">
      <dt className="min-w-0 font-semibold text-[var(--joballa-fg)]">{label}</dt>
      <dd className="min-w-0 text-right font-semibold leading-5 text-[var(--joballa-muted)]">{value}</dd>
    </div>
  );
}

function formatStartDate(value?: string | null, startAsap?: boolean): string {
  if (startAsap) return "As soon as possible";
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatDuration(detail?: WorkerJobDetail | null): string {
  const ext = detail as WorkerJobDetail & { duration?: string; durationValue?: number | string; durationUnit?: string };
  if (detail?.duration) return String(detail.duration);
  if (ext?.duration) return String(ext.duration);
  if (ext?.durationValue) {
    const unit = ext.durationUnit ? String(ext.durationUnit).toLowerCase() : "months";
    return `${ext.durationValue} ${unit}`;
  }
  return "";
}

export function WorkerJobDetailView({
  job,
  jobId = job.slug,
  isSaved: isSavedProp = false,
  detail,
  variant = "page",
  onClosePanel,
}: {
  job: WorkerJobCard;
  /** API job id (same as route param). */
  jobId?: string;
  isSaved?: boolean;
  detail?: WorkerJobDetail | null;
  variant?: "page" | "panel";
  /** Split pane: kept in the prop shape for callers that manage panel selection. */
  onClosePanel?: () => void;
}) {
  const t = useTranslations("worker.jobDetail");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [applyOpen, setApplyOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [saved, setSaved] = useState(isSavedProp);
  const meQuery = useWorkerMe();
  const applicationsQuery = useWorkerApplications({ limit: 100 });
  const kycQuery = useWorkerKyc();
  const saveJob = useSaveWorkerJob();
  const unsaveJob = useUnsaveWorkerJob();
  const hideJob = useHideWorkerJob();
  const reportJob = useReportWorkerJob();
  const shareQuery = useWorkerJobShare(jobId);
  const ownedJobsQuery = useWorkerOwnedJobs({ page: 1, limit: 100 });
  const meWorkerId = meQuery.data?.id;

  const { schedule, location } = useMemo(() => splitJobSubtitle(job.subtitle), [job.subtitle]);
  const isPanel = variant === "panel";
  const scheduleLine = schedule.trim();

  const requirements = Array.isArray(detail?.requirements)
    ? detail.requirements.filter((line): line is string => typeof line === "string" && !!line.trim())
    : [];
  const responsibilities = Array.isArray(detail?.responsibilities)
    ? detail.responsibilities.filter((line): line is string => typeof line === "string" && !!line.trim())
    : [];
  const description = typeof detail?.description === "string" ? detail.description.trim() : "";
  const latestKycStatus = kycQuery.data?.status ? String(kycQuery.data.status).toUpperCase() : null;
  const verificationStatus = latestKycStatus ?? getVerificationStatus(meQuery.data?.workerProfile);
  const verificationReady = !kycQuery.isLoading && !meQuery.isLoading;
  const gateStatus = latestKycStatus === "PENDING" ? "PENDING" : isVerifiedStatus(verificationStatus) ? "VERIFIED" : "UNVERIFIED";
  const alreadyApplied = useMemo(
    () =>
      workerApplicationRowsFromApi(applicationsQuery.data?.items ?? []).some(
        (app) => app.linkedJobSlug === jobId || app.linkedJobSlug === job.slug,
      ),
    [applicationsQuery.data?.items, job.slug, jobId],
  );
  const isOwnPostedJob = useMemo(() => {
    const detailRecord = detail as (WorkerJobDetail & { isOwnJob?: boolean; ownerId?: string }) | null | undefined;
    if (detailRecord?.isOwnJob) return true;
    if (meWorkerId && detailRecord?.ownerId && String(detailRecord.ownerId) === String(meWorkerId)) {
      return true;
    }
    return (ownedJobsQuery.data?.items ?? []).some(
      (owned) => owned.jobId === jobId || owned.assignedJobId === jobId,
    );
  }, [detail, jobId, meWorkerId, ownedJobsQuery.data?.items]);

  const posterType = useMemo(() => resolveJobPosterType(detail ?? null), [detail]);

  const metaRows = useMemo(() => {
    const ext = detail as WorkerJobDetail & {
      startDate?: string;
      startAsap?: boolean;
      department?: { name?: string };
    };
    const detailRaw = detail as Record<string, unknown> | undefined;
    const departmentValue =
      job.department?.trim() ||
      (ext?.department?.name ? String(ext.department.name) : "") ||
      (typeof detailRaw?.departmentName === "string" ? detailRaw.departmentName : "");
    const rows = [
      { label: t("meta.department"), value: displayValue(departmentValue) },
      { label: t("meta.jobType"), value: displayValue(job.employmentType || schedule) },
      { label: t("meta.location"), value: displayValue(location || detail?.city) },
      { label: t("meta.startDate"), value: displayValue(formatStartDate(ext?.startDate, ext?.startAsap)) },
      { label: t("meta.duration"), value: displayValue(formatDuration(detail)) },
      {
        label: t("meta.applications"),
        value: detail?.applicationCount != null ? t("values.applications", { count: detail.applicationCount }) : "",
      },
    ];
    return rows.filter((row) => row.value);
  }, [detail, job.department, job.employmentType, location, schedule, t]);

  useEffect(() => {
    if (searchParams.get("apply") !== "1") {
      setApplyOpen(false);
      setVerifyOpen(false);
      return;
    }
    if (!verificationReady) return;
    if (alreadyApplied || isOwnPostedJob) {
      setApplyOpen(false);
      setVerifyOpen(false);
      return;
    }
    if (isVerifiedStatus(verificationStatus)) {
      setVerifyOpen(false);
      setApplyOpen(true);
      return;
    }
    setApplyOpen(false);
    setVerifyOpen(true);
  }, [alreadyApplied, isOwnPostedJob, searchParams, verificationReady, verificationStatus]);

  useEffect(() => {
    setSaved(isSavedProp);
  }, [isSavedProp]);

  const openApply = useCallback(() => {
    if (isOwnPostedJob) {
      toast.error(t("ownJobApplyBlocked"));
      return;
    }
    if (!isVerifiedStatus(verificationStatus)) {
      setVerifyOpen(true);
      return;
    }
    if (alreadyApplied) return;
    setApplyOpen(true);
    if (variant === "panel") {
      router.replace(`${pathname}?job=${encodeURIComponent(job.slug)}&apply=1`);
    } else {
      router.replace(`${pathname}?apply=1`);
    }
  }, [alreadyApplied, isOwnPostedJob, job.slug, pathname, router, t, variant, verificationStatus]);

  const closeApply = useCallback(() => {
    setApplyOpen(false);
    if (variant === "panel") {
      router.replace(`${pathname}?job=${encodeURIComponent(job.slug)}`);
    } else {
      router.replace(pathname);
    }
  }, [job.slug, pathname, router, variant]);

  const toggleSave = useCallback(() => {
    const next = !saved;
    setSaved(next);
    if (next) {
      saveJob.mutate(jobId, { onError: () => setSaved(false) });
    } else {
      unsaveJob.mutate(jobId, { onError: () => setSaved(true) });
    }
  }, [jobId, saveJob, saved, unsaveJob]);

  const shareJob = useCallback(() => {
    const url = shareQuery.data?.url;
    if (url && navigator.clipboard) {
      void navigator.clipboard.writeText(url);
      toast.success(t("menu.shareCopied"));
      return;
    }
    if (typeof window !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(`${window.location.origin}/worker/jobs/${job.slug}`);
    }
  }, [job.slug, shareQuery.data?.url, t]);

  const menuItems = useMemo(
    () => [
      { label: saved ? t("menu.unsave") : t("menu.save"), onSelect: toggleSave },
      { label: t("menu.share"), onSelect: shareJob },
      {
        label: t("menu.report"),
        onSelect: () => {
          reportJob.mutate({
            jobId,
            body: { reason: "OTHER", description: "Reported from worker portal" },
          });
        },
        destructive: true,
      },
      {
        label: t("menu.hide"),
        onSelect: () => {
          hideJob.mutate(jobId, {
            onSuccess: () => router.push("/worker/jobs"),
          });
        },
        destructive: true,
      },
    ],
    [hideJob, jobId, reportJob, router, saved, shareJob, t, toggleSave],
  );

  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col",
        isPanel ? "rounded-[18px] bg-[var(--joballa-page-tint)]" : "flex-1 gap-5 bg-[var(--joballa-page-tint)] sm:gap-6",
      )}
    >
      <h1 className="sr-only">
        {job.title} - {job.company}
      </h1>

      {isPanel && onClosePanel ? (
        <div className="sticky top-0 z-10 flex shrink-0 items-center justify-end bg-[var(--joballa-page-tint)] px-2 py-2">
          <button
            type="button"
            aria-label={t("closePanel")}
            onClick={onClosePanel}
            className={cn(portalIconButtonMutedClass, "size-10 rounded-[14px]")}
          >
            <IconClose className="size-5" />
          </button>
        </div>
      ) : null}

      {!isPanel ? (
        <Link
          href="/worker/jobs"
          className="inline-flex w-fit shrink-0 items-center gap-1.5 text-sm font-medium text-[var(--joballa-muted)] transition hover:text-[var(--joballa-fg)]"
        >
          <IconChevronLeft className="size-4" />
          {t("back")}
        </Link>
      ) : null}

      <div
        className={cn(
          "min-w-0 space-y-3",
          isPanel && "px-1 pb-3 pr-2",
          !isPanel && "mx-auto w-full max-w-3xl flex-1 space-y-4 text-sm",
        )}
      >
        <section className={cn(portalDetailSectionClass, isPanel && "!p-3.5")}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xl font-bold leading-7 tracking-tight text-[var(--joballa-primary)] sm:text-[22px]">{job.pay}</p>
              {scheduleLine ? (
                <p className="mt-0.5 text-sm font-semibold leading-5 text-[var(--joballa-muted)]">{scheduleLine}</p>
              ) : null}
            </div>
            <DetailActionMenu label={t("moreActions")} items={menuItems} />
          </div>

          <div className="mt-5 min-w-0">
            <h2 className="text-lg font-bold leading-7 text-[var(--joballa-fg)]">{job.title}</h2>
            <div className="mt-1.5 flex min-w-0 items-center gap-2">
              <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white", job.companyColor)}>
                {job.companyInitial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--joballa-muted)]">{job.company}</p>
                {posterType ? (
                  <p className="text-xs font-medium text-[var(--joballa-fg-subtle)]">{t(`posterType.${posterType}`)}</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
            <button
              type="button"
              onClick={openApply}
              disabled={alreadyApplied || isOwnPostedJob}
              className={cn(
                "flex h-12 items-center justify-center rounded-[12px] px-4 text-sm font-semibold shadow-[0_1px_1px_rgba(0,0,0,0.1)] transition",
                alreadyApplied || isOwnPostedJob
                  ? "cursor-not-allowed bg-[var(--joballa-primary)]/45 text-white/85"
                  : "bg-[var(--joballa-primary)] text-white hover:opacity-[0.96]",
              )}
            >
              {alreadyApplied ? t("applied") : isOwnPostedJob ? t("ownJob") : t("applyNow")}
            </button>
            <button
              type="button"
              onClick={toggleSave}
              disabled={saveJob.isPending || unsaveJob.isPending}
              aria-pressed={saved}
              className={cn(
                "flex h-12 items-center justify-center gap-2 rounded-[12px] border px-4 text-sm font-semibold transition disabled:opacity-50",
                saved
                  ? "border-[var(--joballa-primary)] bg-[var(--joballa-jade-3)] text-[var(--joballa-primary)] hover:opacity-90"
                  : "border-[var(--joballa-border)] bg-[var(--joballa-card)] text-[var(--joballa-fg)] hover:border-[var(--joballa-primary)] hover:text-[var(--joballa-primary)]",
              )}
            >
              {saved ? <IconBookmarkSolid className="size-4" /> : <IconBookmark className="size-4" />}
              {saved ? t("menu.unsave") : t("saveJob")}
            </button>
          </div>

          {metaRows.length > 0 ? (
            <dl className="mt-5 space-y-2.5">
              {metaRows.map((row) => (
                <MetaRow key={row.label} label={row.label} value={row.value} />
              ))}
            </dl>
          ) : null}
        </section>

        <section className={cn(portalDetailSectionClass, isPanel && "!p-3.5")}>
          <h3 className="text-sm font-bold text-[var(--joballa-fg)]">{t("aboutTitle")}</h3>
          {description ? (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[var(--joballa-muted)]">{description}</p>
          ) : (
            <p className="mt-4 text-sm leading-6 text-[var(--joballa-muted)]">{t("emptyDescription")}</p>
          )}

          {requirements.length > 0 ? (
            <>
              <h3 className="mt-7 text-sm font-bold text-[var(--joballa-fg)]">{t("reqTitle")}</h3>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-[var(--joballa-muted)]">
                {requirements.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </>
          ) : null}

          {responsibilities.length > 0 ? (
            <>
              <h3 className="mt-7 text-sm font-bold text-[var(--joballa-fg)]">{t("whatTitle")}</h3>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-[var(--joballa-muted)]">
                {responsibilities.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      </div>

      {applyOpen ? <WorkerApplyFlow jobId={jobId} jobTitle={job.title} onClose={closeApply} /> : null}
      <VerificationGateDialog
        open={verifyOpen}
        onOpenChange={setVerifyOpen}
        status={isPendingStatus(gateStatus) ? "PENDING" : gateStatus}
        subject="worker"
        onVerify={() => router.push("/worker/profile/edit?section=verification")}
      />
    </div>
  );
}
