"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { EmployerAsyncState } from "@/components/employer/employer-async-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDeleteEmployerJob, useEmployerJob, usePatchEmployerJobStatus } from "@/features/employer/hooks";
import { portalCardClass, portalOutlineButtonClass } from "@/components/portal/portal-ui";
import { IconClose } from "@/components/worker/icons";
import { cn } from "@/lib/utils";

export function EmployerJobDetailPanel({
  jobId,
  onClose,
}: {
  jobId: string;
  onClose?: () => void;
}) {
  const t = useTranslations("employer.jobDetail");
  const tc = useTranslations("common.confirm");
  const job = useEmployerJob(jobId);
  const patchStatus = usePatchEmployerJobStatus(jobId);
  const deleteJob = useDeleteEmployerJob();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const requirements = Array.isArray(job.data?.requirements) ? job.data.requirements : [];
  const responsibilities = Array.isArray(job.data?.responsibilities) ? job.data.responsibilities : [];

  return (
    <EmployerAsyncState
      isLoading={job.isLoading}
      isError={job.isError}
      error={job.error}
      onRetry={() => void job.refetch()}
    >
      {job.data ? (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          {onClose ? (
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={onClose}
                aria-label={t("closePanel")}
                className={portalOutlineButtonClass + " size-10 shrink-0 p-0"}
              >
                <IconClose className="size-5" />
              </button>
            </div>
          ) : (
            <Link href="/employer/jobs" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--joballa-muted)] hover:text-[var(--joballa-fg)]">
              <span aria-hidden>‹</span> {t("back")}
            </Link>
          )}

          <div className="flex flex-wrap gap-2">
            {(["live", "paused", "closed"] as const).map((status) => (
              <button
                key={status}
                type="button"
                disabled={patchStatus.isPending}
                onClick={() => patchStatus.mutate(status)}
                className="rounded-full border border-[var(--joballa-border)] bg-[var(--joballa-card)] px-3 py-1.5 text-xs font-semibold capitalize text-[var(--joballa-fg)] transition hover:border-[color-mix(in_srgb,var(--joballa-primary)_35%,var(--joballa-border))] hover:bg-[var(--joballa-row-hover)]"
              >
                {status.replace("_", " ")}
              </button>
            ))}
            <button
              type="button"
              disabled={deleteJob.isPending}
              onClick={() => setDeleteOpen(true)}
              className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
            >
              {t("delete")}
            </button>
          </div>
          <ConfirmDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title={tc("deleteJobPosting.title")}
            description={tc("deleteJobPosting.description")}
            confirmLabel={tc("deleteJobPosting.confirm")}
            cancelLabel={tc("cancel")}
            destructive
            busy={deleteJob.isPending}
            onConfirm={() => {
              deleteJob.mutate(jobId, {
                onSuccess: () => {
                  setDeleteOpen(false);
                  onClose?.();
                },
              });
            }}
          />

          <section className={cn(portalCardClass(), "p-4")}>
            <p className="text-xl font-bold text-[var(--joballa-primary)]">{job.data.salary ?? job.data.pay}</p>
            <p className="mt-1 text-sm text-[var(--joballa-muted)]">{job.data.jobType}</p>
            <h2 className="mt-4 text-lg font-bold text-[var(--joballa-fg)]">{job.data.title}</h2>
            <p className="mt-1 text-sm text-[var(--joballa-muted)]">
              {[job.data.city, job.data.neighbourhood, job.data.location].filter(Boolean).join(", ")}
            </p>
            <dl className="mt-4 space-y-2 border-t border-[var(--joballa-border)] pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="font-semibold text-[var(--joballa-fg)]">{t("summary.status")}</dt>
                <dd className="text-[var(--joballa-muted)] capitalize">{String(job.data.status).replace("_", " ")}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-semibold text-[var(--joballa-fg)]">{t("summary.applications")}</dt>
                <dd className="text-[var(--joballa-muted)]">{job.data.applicantsCount ?? 0}</dd>
              </div>
            </dl>
            <Link
              href={`/employer/applicants?jobId=${encodeURIComponent(jobId)}`}
              className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-[12px] bg-[var(--joballa-primary)] text-sm font-semibold text-white"
            >
              {t("viewApplicants")}
            </Link>
          </section>

          <section className={cn(portalCardClass(), "p-4")}>
            <h3 className="text-sm font-bold text-[var(--joballa-fg)]">{t("aboutTitle")}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--joballa-muted)]">{job.data.description}</p>
            {requirements.length ? (
              <>
                <h4 className="mt-4 text-sm font-bold text-[var(--joballa-fg)]">{t("requirementsTitle")}</h4>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--joballa-muted)]">
                  {requirements.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </>
            ) : null}
            {responsibilities.length ? (
              <>
                <h4 className="mt-4 text-sm font-bold text-[var(--joballa-fg)]">{t("doTitle")}</h4>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--joballa-muted)]">
                  {responsibilities.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>
        </div>
      ) : null}
    </EmployerAsyncState>
  );
}
