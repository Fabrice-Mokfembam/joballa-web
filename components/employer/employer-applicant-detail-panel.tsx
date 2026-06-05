"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { EmployerAsyncState } from "@/components/employer/employer-async-state";
import { EmployerApplicantStatusBadge } from "@/components/employer/employer-applicant-status-badge";
import {
  useCopyApplicantShareLink,
  useEmployerApplicant,
  usePatchEmployerApplicantNotes,
  usePatchEmployerApplicantStatus,
} from "@/features/employer/hooks";
import { parseSubmittedProfile, type ParsedApplicantProfile } from "@/features/employer/lib/applicant-profile";
import type { EmployerApplicantStatus, EmployerJobDetail } from "@/features/employer/types/employer-portal";
import { IconClose, IconMoreHorizontal, IconVerified } from "@/components/worker/icons";
import {
  portalAvatarPlaceholderClass,
  portalCardClass,
  portalDetailSectionClass,
  portalDetailSectionMutedClass,
  portalIconButtonMutedClass,
  portalOutlineButtonClass,
  portalSectionLabelClass,
} from "@/components/portal/portal-ui";
import { cn } from "@/lib/utils";
import { buttonClassName } from "@/components/ui/button";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h3 className={portalSectionLabelClass}>{children}</h3>;
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--joballa-border)] py-2.5 text-sm last:border-b-0">
      <dt className="font-semibold text-[var(--joballa-fg)]">{label}</dt>
      <dd className="text-right text-[var(--joballa-muted)]">{value}</dd>
    </div>
  );
}

function jobPayLine(job: EmployerJobDetail | undefined): string {
  if (!job) return "—";
  if (typeof job.salary === "string" && job.salary.trim()) return job.salary;
  if (job.pay != null && job.pay !== "") {
    const currency = String(job.currency ?? "XAF");
    const per = String(job.per ?? "mo").toLowerCase();
    return `${Number(job.pay).toLocaleString()} ${currency}/${per}`;
  }
  return "—";
}

function jobScheduleLine(job: EmployerJobDetail | undefined): string {
  if (!job) return "—";
  const type = String(job.jobType ?? job.employmentType ?? "—");
  const schedule = String((job as { schedule?: string }).schedule ?? "");
  return schedule ? `${type} • ${schedule}` : type;
}

function jobLocationLine(job: EmployerJobDetail | undefined): string {
  if (!job) return "—";
  const workMode = String((job as { workMode?: string }).workMode ?? "Onsite");
  const city = String(job.city ?? job.location ?? "—");
  const neighbourhood = String(job.neighbourhood ?? "");
  return [workMode, city, neighbourhood].filter(Boolean).join(", ");
}

function ProfileSections({ profile, t }: { profile: ParsedApplicantProfile; t: ReturnType<typeof useTranslations> }) {
  return (
    <>
      <div className="flex flex-col gap-4 border-b border-[var(--joballa-border)] pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {profile.avatarUrl ? (
            <span className="relative flex size-16 shrink-0 overflow-hidden rounded-full">
              <Image src={profile.avatarUrl} alt="" fill className="object-cover" sizes="64px" unoptimized />
            </span>
          ) : (
            <span className={cn(portalAvatarPlaceholderClass, "size-16 text-xl")}>
              {profile.fullName.charAt(0)}
            </span>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-[var(--joballa-fg)]">{profile.fullName}</h2>
              {profile.verified ? <IconVerified className="size-5 text-[var(--joballa-primary)]" /> : null}
            </div>
            {profile.headline ? (
              <p className="mt-1 text-sm text-[var(--joballa-muted)]">{profile.headline}</p>
            ) : null}
          </div>
        </div>
        <dl className="shrink-0 space-y-1 text-sm text-[var(--joballa-muted)] lg:text-right">
          {profile.location ? <dd>{profile.location}</dd> : null}
          {profile.phone ? <dd>{profile.phone}</dd> : null}
          {profile.languages ? (
            <dd>{profile.languages.startsWith("Speaks") ? profile.languages : `Speaks ${profile.languages}`}</dd>
          ) : null}
        </dl>
      </div>

      {profile.summary || profile.industries ? (
        <div className="grid gap-4 border-b border-[var(--joballa-border)] py-5 lg:grid-cols-[9rem_minmax(0,1fr)] lg:gap-6">
          <SectionLabel>{t("profile.summaryTitle")}</SectionLabel>
          <div>
            {profile.summary ? (
              <p className="text-sm font-semibold leading-6 text-[var(--joballa-fg)]">{profile.summary}</p>
            ) : null}
            {profile.industries ? (
              <p className="mt-2 text-sm text-[var(--joballa-muted)]">{profile.industries}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {profile.skills.length > 0 ? (
        <div className="grid gap-4 border-b border-[var(--joballa-border)] py-5 lg:grid-cols-[9rem_minmax(0,1fr)] lg:gap-6">
          <SectionLabel>{t("profile.skillsTitle")}</SectionLabel>
          <p className="text-sm leading-7 text-[var(--joballa-muted)]">
            {profile.skills.map((skill, index) => {
              const bold = profile.highlightedSkills.some((h) => h.toLowerCase() === skill.toLowerCase());
              return (
                <span key={skill}>
                  <span className={bold ? "font-bold text-[var(--joballa-fg)]" : undefined}>{skill}</span>
                  {index < profile.skills.length - 1 ? ", " : ""}
                </span>
              );
            })}
          </p>
        </div>
      ) : null}

      {profile.workHistory.length > 0 ? (
        <div className="grid gap-4 border-b border-[var(--joballa-border)] py-5 lg:grid-cols-[9rem_minmax(0,1fr)] lg:gap-6">
          <SectionLabel>{t("profile.workTitle")}</SectionLabel>
          <ul className="space-y-5">
            {profile.workHistory.map((item, index) => (
              <li key={`${item.company}-${index}`}>
                <p className="text-sm font-bold text-[var(--joballa-fg)]">{item.company}</p>
                <p className="text-sm font-bold text-[var(--joballa-fg)]">{item.role}</p>
                {item.description ? (
                  <p className="mt-1 text-sm leading-6 text-[var(--joballa-muted)]">{item.description}</p>
                ) : null}
                {item.period ? <p className="mt-1 text-xs text-[var(--joballa-muted)]">{item.period}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {profile.documents.length > 0 ? (
        <div className="grid gap-4 pt-5 lg:grid-cols-[9rem_minmax(0,1fr)] lg:gap-6">
          <SectionLabel>{t("profile.documentsTitle")}</SectionLabel>
          <ul className="flex flex-wrap gap-2">
            {profile.documents.map((doc) => (
              <li
                key={doc.name}
                className="flex h-[52px] min-w-[120px] items-center justify-end overflow-hidden rounded-sm rounded-tr-lg bg-[var(--joballa-tag-bg)] pl-3"
              >
                <span
                  className={cn(
                    "px-1 py-0.5 text-xs font-bold text-white",
                    doc.type.toUpperCase() === "PDF" ? "bg-[#cf3897]" : "bg-[#9e6c00]",
                  )}
                >
                  {doc.type.toUpperCase().slice(0, 3)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}

function ApplicantNotesSection({
  applicationId,
  initialNotes,
}: {
  applicationId: string;
  initialNotes?: string | null;
}) {
  const [notes, setNotes] = useState(initialNotes ?? "");
  const saveNotes = usePatchEmployerApplicantNotes(applicationId);

  return (
    <section className={cn(portalDetailSectionClass, "mt-4 p-4")}>
      <h3 className="text-sm font-bold text-[var(--joballa-fg)]">Private notes</h3>
      <p className="mt-1 text-xs text-[var(--joballa-muted)]">Only visible to your company.</p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        className="mt-3 w-full rounded-[12px] border border-[var(--joballa-border)] bg-[var(--joballa-input-bg)] px-3 py-2 text-sm text-[var(--joballa-fg)] outline-none focus:border-[var(--joballa-primary)] focus:ring-2 focus:ring-[var(--joballa-primary)]"
        placeholder="Add interview notes, follow-ups, or hiring context..."
      />
      <button
        type="button"
        disabled={saveNotes.isPending}
        onClick={() => saveNotes.mutate(notes.trim())}
        className={cn(buttonClassName("primary"), "mt-3 text-xs")}
      >
        {saveNotes.isPending ? "Saving..." : "Save notes"}
      </button>
    </section>
  );
}

function ApplicantSidebarPanel({
  applicationId,
  onClose,
  job,
  profile,
  status,
  statusLabels,
  t,
  ta,
  patchStatus,
  copyShare,
  employerNotes,
}: {
  applicationId: string;
  onClose?: () => void;
  job: EmployerJobDetail | undefined;
  profile: ParsedApplicantProfile;
  status: EmployerApplicantStatus;
  statusLabels: Record<string, string>;
  t: ReturnType<typeof useTranslations>;
  ta: ReturnType<typeof useTranslations>;
  patchStatus: ReturnType<typeof usePatchEmployerApplicantStatus>;
  copyShare: ReturnType<typeof useCopyApplicantShareLink>;
  employerNotes?: string | null;
}) {
  const [jobExpanded, setJobExpanded] = useState(false);
  const companyName = String(job?.company ?? "—");
  const startDate = job?.startAsap ? "As soon as possible" : String(job?.startDate ?? "—");
  const duration =
    job?.durationValue && job?.durationUnit
      ? `${job.durationValue} ${String(job.durationUnit).toLowerCase()}`
      : String((job as { duration?: string })?.duration ?? "—");

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:p-4">
      <div className="flex items-center justify-end gap-2">
        <Link
          href={`/employer/applicants/${applicationId}`}
          className={cn(portalOutlineButtonClass, "size-9 shrink-0 p-0 text-xs")}
          aria-label={t("openFull")}
        >
          ↗
        </Link>
        <button type="button" aria-label={t("more")} className={cn(portalIconButtonMutedClass, "size-9")}>
          <IconMoreHorizontal className="size-4" />
        </button>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label={t("closePanel")}
            className={cn(portalOutlineButtonClass, "size-9 shrink-0 p-0")}
          >
            <IconClose className="size-5" />
          </button>
        ) : null}
      </div>

      <section className={cn(portalDetailSectionClass, "p-4 sm:p-5")}>
        <section className={cn(portalDetailSectionMutedClass, "mb-4 p-4")}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[var(--joballa-fg)]">{job?.title ?? "—"}</h2>
              <p className="mt-1 text-xs font-semibold text-[var(--joballa-muted)]">{companyName}</p>
            </div>
            <button type="button" aria-label={t("more")} className={cn(portalIconButtonMutedClass, "size-8")}>
              <IconMoreHorizontal className="size-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setJobExpanded((v) => !v)}
            className="mt-3 flex w-full items-center justify-center gap-1 text-sm text-[var(--joballa-muted)] transition hover:text-[var(--joballa-fg)]"
          >
            {jobExpanded ? t("seeLess") : t("seeMore")}
            <span aria-hidden className={cn("transition", jobExpanded && "rotate-180")}>
              ▾
            </span>
          </button>
          {jobExpanded && job ? (
            <dl className="mt-3 border-t border-[var(--joballa-border)] pt-3">
              <MetaRow label={t("summary.jobType")} value={String(job.jobType ?? job.employmentType ?? "—")} />
              <MetaRow label={t("summary.location")} value={jobLocationLine(job)} />
              <MetaRow label={t("summary.startDate")} value={startDate} />
              <MetaRow label={t("summary.duration")} value={duration} />
              <MetaRow label={t("summary.applications")} value={String(job.applicantsCount ?? "—")} />
            </dl>
          ) : null}
        </section>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <EmployerApplicantStatusBadge status={status} label={statusLabels[status] ?? status} />
          {(["shortlisted", "rejected", "hired"] as const).map((next) => (
            <button
              key={next}
              type="button"
              disabled={patchStatus.isPending || status === next}
              onClick={() => patchStatus.mutate(next)}
              className={cn(buttonClassName(status === next ? "primary" : "outline"), "text-xs capitalize")}
            >
              {ta(`actions.${next}`)}
            </button>
          ))}
          <button
            type="button"
            disabled={copyShare.isPending}
            onClick={() => copyShare.mutate()}
            className={cn(buttonClassName("outline"), "text-xs")}
          >
            {t("share")}
          </button>
        </div>

        <ProfileSections profile={profile} t={t} />
        <ApplicantNotesSection key={applicationId} applicationId={applicationId} initialNotes={employerNotes} />
      </section>
    </div>
  );
}

export function EmployerApplicantDetailPanel({
  applicationId,
  onClose,
  variant = "page",
}: {
  applicationId: string;
  onClose?: () => void;
  variant?: "panel" | "page";
}) {
  const t = useTranslations("employer.applicantDetail");
  const ta = useTranslations("employer.applicants");
  const applicant = useEmployerApplicant(applicationId);
  const patchStatus = usePatchEmployerApplicantStatus(applicationId);
  const copyShare = useCopyApplicantShareLink(applicationId);

  const status = String(applicant.data?.status ?? "pending") as EmployerApplicantStatus;
  const profile = parseSubmittedProfile(applicant.data?.submittedProfile as Record<string, unknown> | undefined);
  const employerNotes = typeof applicant.data?.employerNotes === "string" ? applicant.data.employerNotes : null;
  const job = applicant.data?.job as EmployerJobDetail | undefined;
  const requirements = Array.isArray(job?.requirements) ? job.requirements : [];
  const responsibilities = Array.isArray(job?.responsibilities) ? job.responsibilities : [];
  const companyName = String(job?.company ?? "—");
  const startDate = job?.startAsap ? "As soon as possible" : String(job?.startDate ?? "—");
  const duration =
    job?.durationValue && job?.durationUnit
      ? `${job.durationValue} ${String(job.durationUnit).toLowerCase()}`
      : String((job as { duration?: string })?.duration ?? "—");

  const statusLabels: Record<string, string> = {
    pending: ta("status.pending"),
    shortlisted: ta("status.shortlisted"),
    rejected: ta("status.rejected"),
    hired: ta("status.hired"),
  };

  return (
    <EmployerAsyncState
      isLoading={applicant.isLoading}
      isError={applicant.isError}
      error={applicant.error}
      onRetry={() => void applicant.refetch()}
    >
      {applicant.data ? (
        variant === "panel" ? (
          <ApplicantSidebarPanel
            applicationId={applicationId}
            onClose={onClose}
            job={job}
            profile={profile}
            status={status}
            statusLabels={statusLabels}
            t={t}
            ta={ta}
            patchStatus={patchStatus}
            copyShare={copyShare}
            employerNotes={employerNotes}
          />
        ) : (
          <div className="mx-auto flex max-w-[1025px] flex-col gap-[26px]">
            <Link
              href="/employer/applicants"
              className="inline-flex h-8 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-[var(--joballa-muted)] transition hover:text-[var(--joballa-fg)]"
            >
              <span aria-hidden>‹</span> {t("back")}
            </Link>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                aria-label={t("more")}
                className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-[var(--joballa-border)] bg-[var(--joballa-card)] px-2.5 text-sm font-medium text-[var(--joballa-fg)]"
              >
                {t("more")}
                <span aria-hidden>▾</span>
              </button>
              <EmployerApplicantStatusBadge status={status} label={statusLabels[status] ?? status} />
              {(["shortlisted", "rejected", "hired"] as const).map((next) => (
                <button
                  key={next}
                  type="button"
                  disabled={patchStatus.isPending || status === next}
                  onClick={() => patchStatus.mutate(next)}
                  className={cn(buttonClassName(status === next ? "primary" : "outline"), "text-xs capitalize")}
                >
                  {ta(`actions.${next}`)}
                </button>
              ))}
              <button
                type="button"
                disabled={copyShare.isPending}
                onClick={() => copyShare.mutate()}
                className={cn(buttonClassName("outline"), "text-xs")}
              >
                {t("share")}
              </button>
            </div>

            <div className="grid gap-[26px] xl:grid-cols-[400px_minmax(0,1fr)] xl:items-start">
              <div className="flex flex-col gap-3">
                <section className={cn(portalCardClass(), "flex flex-col gap-6 p-6")}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-2xl font-semibold leading-8 text-[var(--joballa-primary)]">{jobPayLine(job)}</p>
                      <p className="mt-1 text-sm font-semibold text-[var(--joballa-muted)]">{jobScheduleLine(job)}</p>
                    </div>
                    <button type="button" aria-label={t("more")} className={cn(portalIconButtonMutedClass, "size-8")}>
                      <IconMoreHorizontal className="size-4" />
                    </button>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold leading-7 text-[var(--joballa-fg)]">{job?.title ?? "—"}</h2>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--joballa-fg)] text-[8px] font-bold text-[var(--joballa-on-primary)]">
                        {companyName.charAt(0)}
                      </span>
                      <span className="text-xs font-semibold text-[var(--joballa-muted)]">{companyName}</span>
                    </div>
                  </div>

                  <dl className="space-y-1.5">
                    <div className="flex items-center justify-between gap-4 text-sm font-semibold">
                      <dt className="text-[var(--joballa-fg)]">{t("summary.jobType")}</dt>
                      <dd className="text-[var(--joballa-muted)]">{String(job?.jobType ?? job?.employmentType ?? "—")}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-sm font-semibold">
                      <dt className="text-[var(--joballa-fg)]">{t("summary.location")}</dt>
                      <dd className="text-[var(--joballa-muted)]">{jobLocationLine(job)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-sm font-semibold">
                      <dt className="text-[var(--joballa-fg)]">{t("summary.startDate")}</dt>
                      <dd className="text-[var(--joballa-muted)]">{startDate}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-sm font-semibold">
                      <dt className="text-[var(--joballa-fg)]">{t("summary.duration")}</dt>
                      <dd className="text-[var(--joballa-muted)]">{duration}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-sm font-semibold">
                      <dt className="text-[var(--joballa-fg)]">{t("summary.applications")}</dt>
                      <dd className="text-[var(--joballa-muted)]">{String(job?.applicantsCount ?? "—")}</dd>
                    </div>
                  </dl>
                </section>

                {job?.description || requirements.length > 0 || responsibilities.length > 0 ? (
                  <section className={cn(portalCardClass(), "flex flex-col gap-6 p-6")}>
                    {job?.description ? (
                      <>
                        <h4 className="text-sm font-bold text-[var(--joballa-fg)]">{t("jobInfo.aboutTitle")}</h4>
                        <p className="mt-2 text-sm leading-6 text-[var(--joballa-muted)]">{job.description}</p>
                      </>
                    ) : null}
                    {requirements.length > 0 ? (
                      <div className={job?.description ? "mt-5" : undefined}>
                        <h4 className="text-sm font-bold text-[var(--joballa-fg)]">{t("jobInfo.requirementsTitle")}</h4>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--joballa-muted)]">
                          {requirements.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {responsibilities.length > 0 ? (
                      <div className="mt-5">
                        <h4 className="text-sm font-bold text-[var(--joballa-fg)]">{t("jobInfo.doTitle")}</h4>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--joballa-muted)]">
                          {responsibilities.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </section>
                ) : null}
              </div>

              <section className={cn(portalDetailSectionClass, "p-5 sm:p-6")}>
                <ProfileSections profile={profile} t={t} />
                <ApplicantNotesSection key={applicationId} applicationId={applicationId} initialNotes={employerNotes} />
              </section>
            </div>
          </div>
        )
      ) : null}
    </EmployerAsyncState>
  );
}
