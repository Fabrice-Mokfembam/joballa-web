"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { EmployerAsyncState } from "@/components/employer/employer-async-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDeleteEmployerJob, useEmployerJob, usePatchEmployerJobStatus } from "@/features/employer/hooks";
import {
  displayEmployerJobStatus,
  employerJobStatusActions,
  employerJobStatusKey,
  normalizeEmployerJobStatusFromApi,
} from "@/features/employer/lib/employer-job-status";
import { employerJobDurationLabel, employerJobStartDateLabel } from "@/features/employer/lib/employer-job-fields";
import {
  EmployerJobRequiredSkillsBlock,
  employerJobRequiredSkillsList,
} from "@/components/employer/employer-job-required-skills";
import type { EmployerJobDetail } from "@/features/employer/types/employer-portal";
import type { EmployerJobStatusAction } from "@/features/employer/lib/employer-job-status";
import { portalDetailSectionClass } from "@/components/portal/portal-ui";
import { IconClose, IconExpand, IconMoreHorizontal } from "@/components/worker/icons";
import { jobStatusPillClass } from "@/lib/job-status-pill";
import { cn } from "@/lib/utils";

function PanelChromeButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center rounded-xl bg-[var(--joballa-secondary)] text-[var(--joballa-muted)] transition hover:text-[var(--joballa-fg)]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <dt className="font-semibold text-[var(--joballa-fg)]">{label}</dt>
      <dd className="text-right text-[var(--joballa-muted)]">{value}</dd>
    </div>
  );
}

function jobLocationLine(job: EmployerJobDetail) {
  return [job.city, job.neighbourhood, job.location].filter(Boolean).join(", ") || "—";
}

function JobActionsMenu({
  open,
  onOpenChange,
  jobId,
  status,
  patchStatus,
  onDelete,
  t,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  status: string;
  patchStatus: ReturnType<typeof usePatchEmployerJobStatus>;
  onDelete: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const tJobs = useTranslations("employer.jobsPage");
  const normalized = normalizeEmployerJobStatusFromApi(status);
  const statusActions = employerJobStatusActions(status);

  const runStatus = (next: EmployerJobStatusAction) => {
    onOpenChange(false);
    patchStatus.mutate(next);
  };

  return open ? (
    <>
      <button
        type="button"
        className="fixed inset-0 z-10 cursor-default bg-transparent"
        aria-hidden
        onClick={() => onOpenChange(false)}
      />
      <div className="absolute right-0 z-20 mt-1 min-w-[168px] overflow-hidden rounded-xl border border-[var(--joballa-border)] bg-[var(--joballa-dropdown-bg)] py-1 text-sm shadow-[var(--joballa-shadow-elevated)]">
        <p className="border-b border-[var(--joballa-border)] px-3 py-2 text-xs font-medium text-[var(--joballa-muted)]">
          {tJobs(`status.${employerJobStatusKey(status)}`)}
        </p>
        {statusActions.map((next) => (
          <button
            key={next}
            type="button"
            disabled={patchStatus.isPending || normalized === next}
            onClick={() => runStatus(next)}
            className="block w-full px-3 py-2 text-left text-[var(--joballa-fg)] hover:bg-[var(--joballa-row-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t(`actions.${next}`)}
          </button>
        ))}
        <Link
          href={`/employer/jobs/${encodeURIComponent(jobId)}/edit`}
          onClick={() => onOpenChange(false)}
          className="block w-full px-3 py-2 text-left text-[var(--joballa-fg)] hover:bg-[var(--joballa-row-hover)]"
        >
          {t("editJob")}
        </Link>
        <button
          type="button"
          disabled={patchStatus.isPending}
          onClick={() => {
            onOpenChange(false);
            onDelete();
          }}
          className="block w-full px-3 py-2 text-left text-[var(--joballa-danger-fg)] hover:bg-[var(--joballa-danger-bg)]"
        >
          {t("delete")}
        </button>
      </div>
    </>
  ) : null;
}

function JobAboutSections({
  job,
  t,
}: {
  job: EmployerJobDetail;
  t: ReturnType<typeof useTranslations>;
}) {
  const requirements = Array.isArray(job.requirements) ? job.requirements : [];
  const responsibilities = Array.isArray(job.responsibilities) ? job.responsibilities : [];
  const requiredSkills = employerJobRequiredSkillsList(job);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-[var(--joballa-fg)]">{t("aboutTitle")}</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--joballa-muted)]">{job.description || "—"}</p>
      </div>
      <EmployerJobRequiredSkillsBlock skills={requiredSkills} title={t("requiredSkillsTitle")} />
      {requirements.length ? (
        <div>
          <h4 className="text-sm font-bold text-[var(--joballa-fg)]">{t("requirementsTitle")}</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--joballa-muted)]">
            {requirements.map((line, index) => (
              <li key={`req-${index}`}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {responsibilities.length ? (
        <div>
          <h4 className="text-sm font-bold text-[var(--joballa-fg)]">{t("doTitle")}</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--joballa-muted)]">
            {responsibilities.map((line, index) => (
              <li key={`resp-${index}`}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function JobSidebarPanel({
  jobId,
  job,
  onClose,
  showExpand = true,
  patchStatus,
  onDelete,
  t,
}: {
  jobId: string;
  job: EmployerJobDetail;
  onClose?: () => void;
  showExpand?: boolean;
  patchStatus: ReturnType<typeof usePatchEmployerJobStatus>;
  onDelete: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const tJobs = useTranslations("employer.jobsPage");
  const [expanded, setExpanded] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const pay = job.salary ?? (typeof job.pay === "string" ? job.pay : "—");
  const startDate = employerJobStartDateLabel(job);
  const duration = employerJobDurationLabel(job);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-[26px] border border-[var(--joballa-border)] bg-[var(--joballa-page-tint)] p-4">
      <section className={cn(portalDetailSectionClass, "shrink-0 !p-[14px] shadow-[var(--joballa-shadow-card)]")}>
        <div className="flex items-start justify-between gap-2.5 pb-3">
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold leading-none text-[var(--joballa-primary)]">{pay}</p>
            <p className="mt-1 text-xs font-semibold text-[var(--joballa-muted)]">{job.jobType ?? "—"}</p>
            <h2 className="mt-3 text-lg font-semibold leading-7 text-[var(--joballa-fg)]">{job.title}</h2>
            <p className="mt-1 truncate text-xs font-semibold text-[var(--joballa-muted)]">{jobLocationLine(job)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            <span className={jobStatusPillClass(String(job.status))}>
              {tJobs(`status.${employerJobStatusKey(job.status)}`)}
            </span>
            {showExpand ? (
              <Link
                href={`/employer/jobs/${encodeURIComponent(jobId)}`}
                aria-label={t("openFull")}
                className="inline-flex h-8 shrink-0 items-center justify-center rounded-xl bg-[var(--joballa-secondary)] px-3 text-[var(--joballa-muted)] transition hover:text-[var(--joballa-fg)]"
              >
                <IconExpand className="size-4" />
              </Link>
            ) : null}
            <div className="relative">
              <PanelChromeButton
                aria-label={t("more")}
                aria-expanded={actionsOpen}
                className="px-2"
                onClick={() => setActionsOpen((open) => !open)}
              >
                <IconMoreHorizontal className="size-6" />
              </PanelChromeButton>
              <JobActionsMenu
                open={actionsOpen}
                onOpenChange={setActionsOpen}
                jobId={jobId}
                status={String(job.status)}
                patchStatus={patchStatus}
                onDelete={onDelete}
                t={t}
              />
            </div>
            {onClose ? (
              <PanelChromeButton aria-label={t("closePanel")} onClick={onClose}>
                <IconClose className="size-4" />
              </PanelChromeButton>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex w-full items-center justify-center gap-0.5 text-sm text-[var(--joballa-muted)] transition hover:text-[var(--joballa-fg)]"
        >
          {expanded ? t("seeLess") : t("seeMore")}
          <span aria-hidden className={cn("inline-flex transition", expanded && "rotate-180")}>
            ▾
          </span>
        </button>
        {expanded ? (
          <dl className="mt-3 border-t border-[var(--joballa-border)] pt-3">
            <MetaRow label={t("summary.status")} value={displayEmployerJobStatus(job.status)} />
            <MetaRow label={t("summary.jobType")} value={String(job.jobType ?? "—")} />
            <MetaRow label={t("summary.location")} value={jobLocationLine(job)} />
            <MetaRow label={t("summary.startDate")} value={startDate} />
            <MetaRow label={t("summary.duration")} value={duration} />
            <MetaRow label={t("summary.applications")} value={String(job.applicantsCount ?? 0)} />
            {employerJobRequiredSkillsList(job).length > 0 ? (
              <MetaRow
                label={t("requiredSkillsTitle")}
                value={employerJobRequiredSkillsList(job).join(", ")}
              />
            ) : null}
          </dl>
        ) : null}
        <Link
          href={`/employer/applicants?jobId=${encodeURIComponent(jobId)}`}
          className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-[12px] bg-[var(--joballa-primary)] text-sm font-semibold text-white"
        >
          {t("viewApplicants")}
        </Link>
      </section>

      <section className={cn(portalDetailSectionClass, "min-h-0 flex-1 overflow-y-auto p-6")}>
        <JobAboutSections job={job} t={t} />
      </section>
    </div>
  );
}

export function EmployerJobDetailPanel({
  jobId,
  onClose,
  variant,
}: {
  jobId: string;
  onClose?: () => void;
  variant?: "panel" | "page";
}) {
  const t = useTranslations("employer.jobDetail");
  const tc = useTranslations("common.confirm");
  const job = useEmployerJob(jobId);
  const patchStatus = usePatchEmployerJobStatus(jobId);
  const deleteJob = useDeleteEmployerJob();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const resolvedVariant = variant ?? (onClose ? "panel" : "page");

  return (
    <EmployerAsyncState
      isLoading={job.isLoading}
      isError={job.isError}
      error={job.error}
      onRetry={() => void job.refetch()}
    >
      {job.data ? (
        <>
          {resolvedVariant === "panel" ? (
            <JobSidebarPanel
              key={jobId}
              jobId={jobId}
              job={job.data}
              onClose={onClose}
              showExpand
              patchStatus={patchStatus}
              onDelete={() => setDeleteOpen(true)}
              t={t}
            />
          ) : (
            <div className="flex min-h-0 flex-1 flex-col gap-4">
              <Link
                href="/employer/jobs"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--joballa-muted)] hover:text-[var(--joballa-fg)]"
              >
                <span aria-hidden>‹</span> {t("back")}
              </Link>
              <JobSidebarPanel
                jobId={jobId}
                job={job.data}
                showExpand={false}
                patchStatus={patchStatus}
                onDelete={() => setDeleteOpen(true)}
                t={t}
              />
            </div>
          )}
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
        </>
      ) : null}
    </EmployerAsyncState>
  );
}
