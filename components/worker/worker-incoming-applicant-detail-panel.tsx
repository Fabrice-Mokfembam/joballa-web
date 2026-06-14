"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import {
  MetaRow,
  ProfileSections,
  ApplicantStatusActions,
} from "@/components/employer/employer-applicant-detail-panel";
import { EmployerAsyncState } from "@/components/employer/employer-async-state";
import { parseApplicantDetailProfile } from "@/features/employer/lib/applicant-profile";
import type { EmployerApplicantStatus } from "@/features/employer/types/employer-portal";
import { employerJobDurationLabel, employerJobStartDateLabel } from "@/features/employer/lib/employer-job-fields";
import { employerJobRequiredSkillsList } from "@/components/employer/employer-job-required-skills";
import { workerIncomingToApplicantDetail } from "@/features/worker/lib/incoming-applicant-mappers";
import { useWorkerIncomingApplication, useWorkerMe, useWorkerOwnedJob, usePatchWorkerApplicantStatus } from "@/features/worker/hooks";
import type { WorkerOwnedJobDetail } from "@/features/worker/types/worker-portal";
import { IconClose, IconExpand } from "@/components/worker/icons";
import { portalDetailSectionClass } from "@/components/portal/portal-ui";
import { cn } from "@/lib/utils";

function ownedJobLocationLine(job: WorkerOwnedJobDetail | undefined): string {
  if (!job) return "—";
  const city = String(job.city ?? job.location ?? "—");
  const neighbourhood = String(job.neighbourhood ?? "");
  return [city, neighbourhood].filter(Boolean).join(", ");
}

function IncomingApplicantSidebarPanel({
  applicationId,
  onClose,
  job,
  profile,
  status,
  statusLabels,
  t,
  ta,
  patchStatus,
  coverNote,
  posterName,
  posterAvatar,
}: {
  applicationId: string;
  onClose?: () => void;
  job: WorkerOwnedJobDetail | undefined;
  profile: ReturnType<typeof parseApplicantDetailProfile>;
  status: EmployerApplicantStatus;
  statusLabels: Record<string, string>;
  t: ReturnType<typeof useTranslations>;
  ta: ReturnType<typeof useTranslations>;
  patchStatus: ReturnType<typeof usePatchWorkerApplicantStatus>;
  coverNote?: string | null;
  posterName: string;
  posterAvatar?: string | null;
}) {
  const [jobExpanded, setJobExpanded] = useState(false);
  const startDate = job ? employerJobStartDateLabel(job as Parameters<typeof employerJobStartDateLabel>[0]) : "—";
  const duration = job ? employerJobDurationLabel(job as Parameters<typeof employerJobDurationLabel>[0]) : "—";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-[26px] border border-[var(--joballa-border)] bg-[var(--joballa-page-tint)] p-4">
      <section className={cn(portalDetailSectionClass, "shrink-0 !p-[14px] shadow-[var(--joballa-shadow-card)]")}>
        <div className="flex items-start justify-between gap-2.5 pb-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold leading-7 text-[var(--joballa-fg)]">{job?.title ?? "—"}</h2>
            <div className="mt-1 flex items-center gap-2">
              {posterAvatar ? (
                <span className="relative flex size-6 shrink-0 overflow-hidden rounded-full">
                  <Image src={posterAvatar} alt="" fill className="object-cover" sizes="24px" unoptimized />
                </span>
              ) : (
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--joballa-fg)] text-[8px] font-bold text-[var(--joballa-on-primary)]">
                  {posterName.charAt(0)}
                </span>
              )}
              <p className="truncate text-xs font-semibold text-[var(--joballa-muted)]">{posterName}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            <Link
              href={`/worker/applications/incoming/${encodeURIComponent(applicationId)}`}
              aria-label={t("openFull")}
              className="inline-flex h-8 shrink-0 items-center justify-center rounded-xl bg-[var(--joballa-secondary)] px-3 text-[var(--joballa-muted)] transition hover:text-[var(--joballa-fg)]"
            >
              <IconExpand className="size-4" />
            </Link>
            {onClose ? (
              <button
                type="button"
                aria-label={t("closePanel")}
                onClick={onClose}
                className="inline-flex h-8 shrink-0 items-center justify-center rounded-xl bg-[var(--joballa-secondary)] text-[var(--joballa-muted)] transition hover:text-[var(--joballa-fg)]"
              >
                <IconClose className="size-4" />
              </button>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setJobExpanded((value) => !value)}
          className="flex w-full items-center justify-center gap-0.5 text-sm text-[var(--joballa-muted)] transition hover:text-[var(--joballa-fg)]"
        >
          {jobExpanded ? t("seeLess") : t("seeMore")}
          <span aria-hidden className={cn("inline-flex transition", jobExpanded && "rotate-180")}>
            ▾
          </span>
        </button>
        {jobExpanded && job ? (
          <dl className="mt-3 border-t border-[var(--joballa-border)] pt-3">
            <MetaRow label={t("summary.jobType")} value={String(job.jobType ?? "—")} />
            <MetaRow label={t("summary.location")} value={ownedJobLocationLine(job)} />
            <MetaRow label={t("summary.startDate")} value={startDate} />
            <MetaRow label={t("summary.duration")} value={duration} />
            <MetaRow label={t("summary.applications")} value={String(job.applicantsCount ?? "—")} />
            {employerJobRequiredSkillsList(job as Parameters<typeof employerJobRequiredSkillsList>[0]).length > 0 ? (
              <MetaRow
                label={t("jobInfo.requiredSkillsTitle")}
                value={employerJobRequiredSkillsList(job as Parameters<typeof employerJobRequiredSkillsList>[0]).join(", ")}
              />
            ) : null}
          </dl>
        ) : null}
      </section>

      <section className={cn(portalDetailSectionClass, "shrink-0 !p-[14px] shadow-[var(--joballa-shadow-card)]")}>
        <div className="flex flex-wrap items-center gap-2">
          <ApplicantStatusActions
            status={status}
            statusLabels={statusLabels}
            patchStatus={patchStatus}
            ta={ta}
          />
        </div>
      </section>

      <section className={cn(portalDetailSectionClass, "min-h-0 flex-1 overflow-y-auto p-6")}>
        <ProfileSections profile={profile} t={t} variant="page" coverNote={coverNote} />
      </section>
    </div>
  );
}

export function WorkerIncomingApplicantDetailPanel({
  applicationId,
  onClose,
  variant = "panel",
}: {
  applicationId: string;
  onClose?: () => void;
  variant?: "panel" | "page";
}) {
  const t = useTranslations("employer.applicantDetail");
  const ta = useTranslations("employer.applicants");
  const application = useWorkerIncomingApplication(applicationId);
  const patchStatus = usePatchWorkerApplicantStatus(applicationId);
  const jobId = String(application.data?.jobId ?? "");
  const ownedJob = useWorkerOwnedJob(jobId);
  const workerMe = useWorkerMe();

  const employerShape = useMemo(
    () => workerIncomingToApplicantDetail(application.data, ownedJob.data),
    [application.data, ownedJob.data],
  );
  const profile = parseApplicantDetailProfile(employerShape);
  const coverNote =
    typeof employerShape?.coverNote === "string"
      ? employerShape.coverNote
      : typeof (employerShape as { jobSpecificNote?: string | null })?.jobSpecificNote === "string"
        ? (employerShape as { jobSpecificNote?: string | null }).jobSpecificNote
        : null;

  const posterName = [workerMe.data?.firstName, workerMe.data?.lastName].filter(Boolean).join(" ").trim() || "You";
  const posterAvatar =
    typeof workerMe.data?.workerProfile?.photoUrl === "string"
      ? workerMe.data.workerProfile.photoUrl
      : typeof workerMe.data?.workerProfile?.avatarUrl === "string"
        ? workerMe.data.workerProfile.avatarUrl
        : null;

  const status = String(application.data?.status ?? "pending") as EmployerApplicantStatus;
  const statusLabels: Record<string, string> = {
    pending: ta("status.pending"),
    shortlisted: ta("status.shortlisted"),
    rejected: ta("status.rejected"),
    hired: ta("status.hired"),
  };

  const isLoading = application.isLoading || (jobId ? ownedJob.isLoading : false);
  const isError = application.isError || (jobId ? ownedJob.isError : false);
  const error = application.error ?? ownedJob.error;

  return (
    <EmployerAsyncState
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => {
        void application.refetch();
        if (jobId) void ownedJob.refetch();
      }}
    >
      {application.data ? (
        variant === "panel" ? (
          <IncomingApplicantSidebarPanel
            applicationId={applicationId}
            onClose={onClose}
            job={ownedJob.data}
            profile={profile}
            status={status}
            statusLabels={statusLabels}
            t={t}
            ta={ta}
            patchStatus={patchStatus}
            coverNote={coverNote}
            posterName={posterName}
            posterAvatar={posterAvatar}
          />
        ) : (
          <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-[26px]">
            <Link
              href="/worker/applications?mode=incoming"
              className="inline-flex h-8 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-[var(--joballa-muted)] transition hover:text-[var(--joballa-fg)]"
            >
              <span aria-hidden>‹</span> {t("back")}
            </Link>
            <IncomingApplicantSidebarPanel
              applicationId={applicationId}
              job={ownedJob.data}
              profile={profile}
              status={status}
              statusLabels={statusLabels}
              t={t}
              ta={ta}
              patchStatus={patchStatus}
              coverNote={coverNote}
              posterName={posterName}
              posterAvatar={posterAvatar}
            />
          </div>
        )
      ) : null}
    </EmployerAsyncState>
  );
}
