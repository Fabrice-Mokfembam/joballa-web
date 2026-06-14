"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { EmployerAsyncState } from "@/components/employer/employer-async-state";
import { useEmployerMe, useEmployerWorkforceWorker, usePatchEmployerWorkforceStatus } from "@/features/employer/hooks";
import { buttonClassName } from "@/components/ui/button";
import { parseSubmittedProfile, type ParsedApplicantProfile } from "@/features/employer/lib/applicant-profile";
import { displayWorkforceJobType } from "@/features/employer/lib/workforce-display";
import type { EmployerJobDetail, EmployerWorkforceListItem, EmployerWorkforceStatus } from "@/features/employer/types/employer-portal";
import { IconMoreHorizontal, IconVerified } from "@/components/worker/icons";
import {
  portalAvatarPlaceholderClass,
  portalCardClass,
  portalDetailSectionClass,
  portalIconButtonMutedClass,
  portalSectionLabelClass,
} from "@/components/portal/portal-ui";
import { cn } from "@/lib/utils";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h3 className={portalSectionLabelClass}>{children}</h3>;
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

function formatJoinedDate(value?: string): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
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
            <span className={cn(portalAvatarPlaceholderClass, "size-16 text-xl")}>{profile.fullName.charAt(0)}</span>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-[var(--joballa-fg)]">{profile.fullName}</h2>
              {profile.verified ? <IconVerified className="size-5 text-[var(--joballa-primary)]" /> : null}
            </div>
            {profile.headline ? <p className="mt-1 text-sm text-[var(--joballa-muted)]">{profile.headline}</p> : null}
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
            {profile.industries ? <p className="mt-2 text-sm text-[var(--joballa-muted)]">{profile.industries}</p> : null}
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
    </>
  );
}

export function EmployerWorkforceWorkerProfile({ workerId }: { workerId: string }) {
  const t = useTranslations("employer.workforceDetail");
  const tw = useTranslations("employer.workforce");
  const me = useEmployerMe();
  const detail = useEmployerWorkforceWorker(workerId);
  const patchStatus = usePatchEmployerWorkforceStatus(workerId);

  const status = String(detail.data?.status ?? "active") as EmployerWorkforceStatus;
  const profile = parseSubmittedProfile(detail.data?.submittedProfile as Record<string, unknown> | undefined);
  const job = detail.data?.job as EmployerJobDetail | undefined;
  const requirements = Array.isArray(job?.requirements) ? job.requirements : [];
  const responsibilities = Array.isArray(job?.responsibilities) ? job.responsibilities : [];
  const companyName = String(job?.company ?? "—");
  const companyLogo = me.data?.company?.logo ?? null;
  const statusLabels: Record<string, string> = {
    active: tw("status.active"),
    terminated: tw("status.terminated"),
    completed: tw("status.completed"),
    rejected: tw("status.rejected"),
  };
  const workerRecord = detail.data as EmployerWorkforceListItem | undefined;
  const jobTypeLabel = workerRecord
    ? displayWorkforceJobType(workerRecord, (slug) => tw(`jobTypes.${slug}`))
    : "—";

  return (
    <EmployerAsyncState
      isLoading={detail.isLoading}
      isError={detail.isError}
      error={detail.error}
      onRetry={() => void detail.refetch()}
    >
      {detail.data ? (
        <div className="mx-auto flex max-w-[1025px] flex-col gap-[26px]">
          <Link
            href="/employer/workforce"
            className="inline-flex h-8 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-[var(--joballa-muted)] transition hover:text-[var(--joballa-fg)]"
          >
            <span aria-hidden>‹</span> {t("back")}
          </Link>

          <div className="flex justify-end">
            <button
              type="button"
              aria-label={t("actions")}
              className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-[var(--joballa-border)] bg-[var(--joballa-card)] px-2.5 text-sm font-medium text-[var(--joballa-fg)]"
            >
              {t("actions")}
              <span aria-hidden>▾</span>
            </button>
          </div>

          <div className="grid gap-[26px] xl:grid-cols-[400px_minmax(0,1fr)] xl:items-start">
            <div className="flex flex-col gap-3">
              <section className={cn(portalCardClass(), "gap-6 p-6")}>
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
                  <h2 className="text-lg font-semibold leading-7 text-[var(--joballa-fg)]">
                    {job?.title ?? String(detail.data.role ?? "—")}
                  </h2>
                  <div className="mt-2 flex items-center gap-2">
                    {companyLogo ? (
                      <span className="relative flex size-6 shrink-0 overflow-hidden rounded-full">
                        <Image src={companyLogo} alt="" fill className="object-cover" sizes="24px" unoptimized />
                      </span>
                    ) : (
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--joballa-fg)] text-[8px] font-bold text-[var(--joballa-on-primary)]">
                        {companyName.charAt(0)}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-[var(--joballa-muted)]">{companyName}</span>
                  </div>
                </div>

                <dl className="space-y-1.5">
                  <div className="flex items-center justify-between gap-4 text-sm font-semibold">
                    <dt className="text-[var(--joballa-fg)]">{t("summary.dateJoined")}</dt>
                    <dd className="text-[var(--joballa-muted)]">{formatJoinedDate(String(detail.data.dateJoined ?? ""))}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm font-semibold">
                    <dt className="text-[var(--joballa-fg)]">{t("summary.jobType")}</dt>
                    <dd className="text-[var(--joballa-muted)]">{jobTypeLabel}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm font-semibold">
                    <dt className="text-[var(--joballa-fg)]">{t("summary.status")}</dt>
                    <dd className="text-[var(--joballa-primary)]">{statusLabels[status] ?? status}</dd>
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
                        {requirements.map((item, index) => (
                          <li key={`req-${index}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {responsibilities.length > 0 ? (
                    <div className="mt-5">
                      <h4 className="text-sm font-bold text-[var(--joballa-fg)]">{t("jobInfo.doTitle")}</h4>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--joballa-muted)]">
                        {responsibilities.map((item, index) => (
                          <li key={`resp-${index}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </section>
              ) : null}
            </div>

            <section className={cn(portalDetailSectionClass, "p-5 sm:p-6")}>
              <ProfileSections profile={profile} t={t} />
            </section>

            <div className="flex flex-wrap gap-2 border-t border-[var(--joballa-border)] pt-5">
              <button
                type="button"
                disabled={patchStatus.isPending}
                onClick={() => patchStatus.mutate({ status: "terminated", reason: "End of contract" })}
                className={cn(buttonClassName("outline"), "text-xs")}
              >
                {tw("actions.terminate")}
              </button>
              <button
                type="button"
                disabled={patchStatus.isPending}
                onClick={() => patchStatus.mutate({ status: "completed", reason: "Contract completed" })}
                className={cn(buttonClassName("outline"), "text-xs")}
              >
                {tw("actions.complete")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </EmployerAsyncState>
  );
}
