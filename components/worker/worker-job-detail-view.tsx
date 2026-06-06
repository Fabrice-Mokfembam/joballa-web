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
} from "@/features/worker/hooks";
import { workerApplicationRowsFromApi } from "@/features/worker/lib/application-mappers";
import { getVerificationStatus, isPendingStatus, isVerifiedStatus } from "@/features/worker/lib/verification";
import { displayValue } from "@/features/worker/lib/display-value";
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
        className="flex size-10 items-center justify-center rounded-[14px] bg-[#f6f6f6] text-[#737373] transition hover:bg-[#eeeeee] hover:text-[#0a0a0a]"
      >
        <IconMoreHorizontal className="size-5" />
      </button>
      {open ? (
        <>
          <button type="button" className="fixed inset-0 z-10 cursor-default bg-transparent" aria-hidden onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-[#e5e5e5] bg-white py-1 text-sm shadow-md">
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                className={cn("block w-full px-3 py-2 text-left hover:bg-neutral-50", item.destructive && "text-red-600 hover:bg-red-50")}
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
      <dt className="min-w-0 font-semibold text-[#0a0a0a]">{label}</dt>
      <dd className="min-w-0 text-right font-semibold leading-5 text-[#737373]">{value}</dd>
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
  const gateStatus = latestKycStatus === "PENDING" ? "PENDING" : isVerifiedStatus(verificationStatus) ? "VERIFIED" : "UNVERIFIED";
  const alreadyApplied = useMemo(
    () =>
      workerApplicationRowsFromApi(applicationsQuery.data?.items ?? []).some(
        (app) => app.linkedJobSlug === jobId || app.linkedJobSlug === job.slug,
      ),
    [applicationsQuery.data?.items, job.slug, jobId],
  );

  const metaRows = useMemo(() => {
    const ext = detail as WorkerJobDetail & { startDate?: string; startAsap?: boolean };
    const rows = [
      { label: t("meta.jobType"), value: displayValue(job.seniority || schedule) },
      { label: t("meta.location"), value: displayValue(location || detail?.city) },
      { label: t("meta.startDate"), value: displayValue(formatStartDate(ext?.startDate, ext?.startAsap)) },
      { label: t("meta.duration"), value: displayValue(formatDuration(detail)) },
      {
        label: t("meta.applications"),
        value: detail?.applicationCount != null ? t("values.applications", { count: detail.applicationCount }) : "",
      },
    ];
    return rows.filter((row) => row.value);
  }, [detail, job.seniority, location, schedule, t]);

  useEffect(() => {
    if (searchParams.get("apply") !== "1") {
      setApplyOpen(false);
      return;
    }
    if (alreadyApplied) {
      setApplyOpen(false);
      return;
    }
    if (isVerifiedStatus(verificationStatus)) {
      setApplyOpen(true);
      return;
    }
    setApplyOpen(false);
    setVerifyOpen(true);
  }, [alreadyApplied, searchParams, verificationStatus]);

  useEffect(() => {
    setSaved(isSavedProp);
  }, [isSavedProp]);

  const openApply = useCallback(() => {
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
  }, [alreadyApplied, job.slug, pathname, router, variant, verificationStatus]);

  const closeApply = useCallback(() => {
    setApplyOpen(false);
    if (variant === "panel") {
      router.replace(`${pathname}?job=${encodeURIComponent(job.slug)}`);
    } else {
      router.replace(pathname);
    }
  }, [job.slug, pathname, router, variant]);

  const toggleSave = useCallback(() => {
    if (saved) {
      unsaveJob.mutate(jobId, {
        onSuccess: () => setSaved(false),
      });
    } else {
      saveJob.mutate(jobId, {
        onSuccess: () => setSaved(true),
      });
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
        "flex w-full min-w-0 flex-1 flex-col",
        isPanel ? "min-h-0 rounded-[18px] bg-[var(--joballa-page-tint)]" : "gap-5 bg-[var(--joballa-page-tint)] sm:gap-6",
      )}
    >
      <h1 className="sr-only">
        {job.title} - {job.company}
      </h1>

      {isPanel && onClosePanel ? (
        <div className="sticky top-0 z-10 flex shrink-0 items-center justify-end border-b border-[#e5e5e5] bg-[var(--joballa-page-tint)] px-2 py-2">
          <button
            type="button"
            aria-label={t("closePanel")}
            onClick={onClosePanel}
            className="flex size-10 items-center justify-center rounded-[14px] bg-white text-[#737373] shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-[#e5e5e5] transition hover:bg-[#f6f6f6] hover:text-[#0a0a0a]"
          >
            <IconClose className="size-5" />
          </button>
        </div>
      ) : null}

      {!isPanel ? (
        <Link
          href="/worker/jobs"
          className="inline-flex w-fit shrink-0 items-center gap-1.5 text-sm font-medium text-[#737373] transition hover:text-[#0a0a0a]"
        >
          <IconChevronLeft className="size-4" />
          {t("back")}
        </Link>
      ) : null}

      <div
        className={cn(
          "min-w-0 flex-1 space-y-3",
          isPanel && "overflow-y-auto px-1 pb-3 pr-2",
          !isPanel && "mx-auto w-full max-w-3xl space-y-4 text-sm",
        )}
      >
        <section
          className={cn(
            "rounded-[14px] border border-[#e5e5e5] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
            isPanel ? "p-3.5" : "p-4 sm:p-5",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xl font-bold leading-7 tracking-tight text-[var(--joballa-primary)] sm:text-[22px]">{job.pay}</p>
              {scheduleLine ? (
                <p className="mt-0.5 text-sm font-semibold leading-5 text-[#737373]">{scheduleLine}</p>
              ) : null}
            </div>
            <DetailActionMenu label={t("moreActions")} items={menuItems} />
          </div>

          <div className="mt-5 min-w-0">
            <h2 className="text-lg font-bold leading-7 text-[#0a0a0a]">{job.title}</h2>
            <div className="mt-1.5 flex min-w-0 items-center gap-2">
              <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white", job.companyColor)}>
                {job.companyInitial}
              </div>
              <p className="truncate text-sm font-semibold text-[#737373]">{job.company}</p>
            </div>
          </div>

          <div className={cn("mt-5 grid grid-cols-1 gap-3", !alreadyApplied && "min-[420px]:grid-cols-2")}>
            {!alreadyApplied ? (
              <button
                type="button"
                onClick={openApply}
                className="flex h-12 items-center justify-center rounded-[12px] bg-[var(--joballa-primary)] px-4 text-sm font-semibold text-white shadow-[0_1px_1px_rgba(0,0,0,0.1)] transition hover:opacity-[0.96]"
              >
                {t("applyNow")}
              </button>
            ) : null}
            <button
              type="button"
              onClick={toggleSave}
              disabled={saveJob.isPending || unsaveJob.isPending}
              className="flex h-12 items-center justify-center gap-2 rounded-[12px] border border-[#e5e5e5] bg-white px-4 text-sm font-semibold text-[#171717] transition hover:border-[var(--joballa-primary)] hover:text-[var(--joballa-primary)] disabled:opacity-50"
            >
              {saved ? <IconBookmarkSolid className="size-4" /> : <IconBookmark className="size-4" />}
              {saved ? t("savedJob") : t("saveJob")}
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

        <section
          className={cn(
            "rounded-[14px] border border-[#e5e5e5] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
            isPanel ? "p-3.5" : "p-4 sm:p-5",
          )}
        >
          <h3 className="text-sm font-bold text-[#0a0a0a]">{t("aboutTitle")}</h3>
          {description ? (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#737373]">{description}</p>
          ) : (
            <p className="mt-4 text-sm leading-6 text-[#737373]">{t("emptyDescription")}</p>
          )}

          {requirements.length > 0 ? (
            <>
              <h3 className="mt-7 text-sm font-bold text-[#0a0a0a]">{t("reqTitle")}</h3>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-[#737373]">
                {requirements.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </>
          ) : null}

          {responsibilities.length > 0 ? (
            <>
              <h3 className="mt-7 text-sm font-bold text-[#0a0a0a]">{t("whatTitle")}</h3>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-[#737373]">
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
