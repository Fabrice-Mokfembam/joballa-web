"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import {
  employerJobDurationLabel,
  employerJobStartDateLabel,
} from "@/features/employer/lib/employer-job-fields";
import { usePublishWorkerPostedJob, useWorkerMe, useWorkerOwnedJob } from "@/features/worker/hooks";
import { profileInitials } from "@/features/worker/lib/profile-display";
import { IconChevronLeft, IconClose } from "@/components/worker/icons";
import { portalDetailSectionClass, portalIconButtonMutedClass, portalOutlineButtonClass } from "@/components/portal/portal-ui";
import { buttonClassName } from "@/components/ui/button";
import { jobStatusPillClass } from "@/lib/job-status-pill";
import { cn } from "@/lib/utils";

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(9rem,auto)] items-start gap-4 text-sm leading-5">
      <dt className="min-w-0 font-semibold text-[var(--joballa-fg)]">{label}</dt>
      <dd className="min-w-0 text-right font-semibold leading-5 text-[var(--joballa-muted)]">{value}</dd>
    </div>
  );
}

function formatPay(job: Record<string, unknown>): string {
  const amount = job.payAmount ?? job.pay ?? job.payRate;
  if (amount == null || amount === "") return "—";
  const currency = String(job.payCurrency ?? job.currency ?? "XAF");
  const structure = String(job.payStructure ?? job.per ?? "monthly");
  const per =
    structure === "monthly"
      ? "mo"
      : structure === "weekly"
        ? "wk"
        : structure === "daily"
          ? "day"
          : structure === "hourly"
            ? "hr"
            : "fixed";
  const n = Number(amount);
  if (!Number.isFinite(n)) return String(amount);
  return `${n.toLocaleString("en-US")} ${currency}/${per}`;
}

function normalizeStatus(status: string): string {
  return status.toLowerCase().replace(/\s+/g, "_");
}

export function WorkerOwnedJobDetailView({
  jobId,
  variant = "panel",
  onClose,
}: {
  jobId: string;
  variant?: "panel" | "page";
  onClose?: () => void;
}) {
  const t = useTranslations("worker.myJobs");
  const tDetail = useTranslations("worker.jobDetail");
  const meQuery = useWorkerMe();
  const jobQuery = useWorkerOwnedJob(jobId);
  const publishJob = usePublishWorkerPostedJob(jobId);
  const job = jobQuery.data;
  const isPanel = variant === "panel";

  const wp = meQuery.data?.workerProfile;
  const posterName = wp?.fullName?.trim() || meQuery.data?.email || t("title");
  const posterAvatarUrl = wp?.avatarUrl ?? null;
  const posterInitial = profileInitials(posterName);

  const status = normalizeStatus(String(job?.status ?? ""));
  const canPublish = status === "draft";
  const canEdit = status !== "closed";
  const canViewApplicants = status === "live" || status === "active";

  const requirements = useMemo(
    () => (Array.isArray(job?.requirements) ? job!.requirements.filter((line): line is string => !!line?.trim()) : []),
    [job?.requirements],
  );
  const responsibilities = useMemo(
    () =>
      Array.isArray(job?.responsibilities)
        ? job!.responsibilities.filter((line): line is string => !!line?.trim())
        : [],
    [job?.responsibilities],
  );

  const locationLine = useMemo(() => {
    if (!job) return "—";
    const city = String(job.city ?? job.location ?? "").trim();
    const neighbourhood = String(job.neighbourhood ?? "").trim();
    return [city, neighbourhood].filter(Boolean).join(", ") || "—";
  }, [job]);

  const statusLabel = useMemo(() => {
    const key = status as "draft" | "under_review" | "live" | "paused" | "closed" | "suspended";
    if (["draft", "under_review", "live", "paused", "closed", "suspended"].includes(key)) {
      return t(`status.${key}`);
    }
    return String(job?.status ?? "—");
  }, [job?.status, status, t]);

  if (jobQuery.isLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center p-6 text-sm text-[var(--joballa-muted)]">
        {t("detail.loading")}
      </div>
    );
  }

  if (jobQuery.isError || !job) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 p-6 text-center text-sm text-[var(--joballa-muted)]">
        <p>{t("detail.loadError")}</p>
        {onClose ? (
          <button type="button" onClick={onClose} className={portalOutlineButtonClass}>
            {tDetail("closePanel")}
          </button>
        ) : null}
      </div>
    );
  }

  const jobRecord = job as Record<string, unknown>;
  const payLine = formatPay(jobRecord);
  const employmentLabel = String(job.jobType ?? "—").replace(/_/g, " ");

  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col",
        isPanel ? "rounded-[18px] bg-[var(--joballa-page-tint)]" : "gap-5 bg-[var(--joballa-page-tint)] sm:gap-6",
      )}
    >
      {isPanel && onClose ? (
        <div className="sticky top-0 z-10 flex shrink-0 items-center justify-end bg-[var(--joballa-page-tint)] px-2 py-2">
          <button
            type="button"
            aria-label={tDetail("closePanel")}
            onClick={onClose}
            className={cn(portalIconButtonMutedClass, "size-10 rounded-[14px]")}
          >
            <IconClose className="size-5" />
          </button>
        </div>
      ) : null}

      {!isPanel ? (
        <Link
          href="/worker/my-jobs"
          className="inline-flex w-fit shrink-0 items-center gap-1.5 px-1 text-sm font-medium text-[var(--joballa-muted)] transition hover:text-[var(--joballa-fg)]"
        >
          <IconChevronLeft className="size-4" />
          {t("detail.back")}
        </Link>
      ) : null}

      <div className={cn("min-w-0 space-y-3", isPanel && "px-1 pb-3 pr-2", !isPanel && "mx-auto w-full max-w-3xl space-y-4")}>
        <section className={cn(portalDetailSectionClass, isPanel && "!p-3.5")}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xl font-bold leading-7 tracking-tight text-[var(--joballa-primary)] sm:text-[22px]">{payLine}</p>
              <p className="mt-0.5 text-sm font-semibold leading-5 text-[var(--joballa-muted)]">{employmentLabel}</p>
            </div>
            <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold", jobStatusPillClass(String(job.status ?? "")))}>
              {statusLabel}
            </span>
          </div>

          <div className="mt-5 min-w-0">
            <h2 className="text-lg font-bold leading-7 text-[var(--joballa-fg)]">{job.title}</h2>
            <div className="mt-1.5 flex min-w-0 items-center gap-2">
              <span className="relative flex size-7 shrink-0 overflow-hidden rounded-full bg-[var(--joballa-primary)]">
                {posterAvatarUrl ? (
                  <Image src={posterAvatarUrl} alt="" fill className="object-cover" sizes="28px" unoptimized />
                ) : (
                  <span className="flex size-full items-center justify-center text-xs font-bold text-[var(--joballa-on-primary)]">
                    {posterInitial}
                  </span>
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--joballa-muted)]">{posterName}</p>
                <p className="text-xs font-medium text-[var(--joballa-fg-subtle)]">{tDetail("posterType.worker")}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
            {canPublish ? (
              <button
                type="button"
                disabled={publishJob.isPending}
                onClick={() => publishJob.mutate(undefined)}
                className={cn(buttonClassName("primary"), "h-12 disabled:opacity-60")}
              >
                {publishJob.isPending ? t("actions.publishing") : t("actions.publish")}
              </button>
            ) : null}
            {canEdit ? (
              <Link
                href={`/worker/jobs/new?edit=${encodeURIComponent(jobId)}`}
                className={cn(
                  portalOutlineButtonClass,
                  "h-12 text-center",
                  !canPublish && "min-[420px]:col-span-2",
                )}
              >
                {t("actions.edit")}
              </Link>
            ) : null}
            {canViewApplicants ? (
              <Link
                href={`/worker/engagements?jobId=${encodeURIComponent(jobId)}`}
                className={cn(buttonClassName("primary"), "h-12 text-center", canPublish && "min-[420px]:col-span-2")}
              >
                {t("actions.viewApplicants")}
              </Link>
            ) : null}
          </div>

          <dl className="mt-5 space-y-2.5">
            <MetaRow label={tDetail("meta.jobType")} value={employmentLabel} />
            <MetaRow label={tDetail("meta.location")} value={locationLine} />
            <MetaRow
              label={tDetail("meta.startDate")}
              value={employerJobStartDateLabel(job as Parameters<typeof employerJobStartDateLabel>[0])}
            />
            <MetaRow
              label={tDetail("meta.duration")}
              value={employerJobDurationLabel(job as Parameters<typeof employerJobDurationLabel>[0])}
            />
            {job.applicantsCount != null ? (
              <MetaRow label={tDetail("meta.applications")} value={tDetail("values.applications", { count: job.applicantsCount })} />
            ) : null}
          </dl>
        </section>

        <section className={cn(portalDetailSectionClass, isPanel && "!p-3.5")}>
          <h3 className="text-sm font-bold text-[var(--joballa-fg)]">{tDetail("aboutTitle")}</h3>
          {job.description?.trim() ? (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[var(--joballa-muted)]">{job.description}</p>
          ) : (
            <p className="mt-4 text-sm leading-6 text-[var(--joballa-muted)]">{tDetail("emptyDescription")}</p>
          )}

          {requirements.length > 0 ? (
            <>
              <h3 className="mt-7 text-sm font-bold text-[var(--joballa-fg)]">{tDetail("reqTitle")}</h3>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-[var(--joballa-muted)]">
                {requirements.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </>
          ) : null}

          {responsibilities.length > 0 ? (
            <>
              <h3 className="mt-7 text-sm font-bold text-[var(--joballa-fg)]">{tDetail("whatTitle")}</h3>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-[var(--joballa-muted)]">
                {responsibilities.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}
