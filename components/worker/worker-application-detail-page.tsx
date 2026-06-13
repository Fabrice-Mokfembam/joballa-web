"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { ProfileSections } from "@/components/employer/employer-applicant-detail-panel";
import { useWorkerApplication } from "@/features/worker/hooks";
import { workerApplicationRowFromApi } from "@/features/worker/lib/application-mappers";
import { parseSubmittedProfile } from "@/features/employer/lib/applicant-profile";
import { IconChevronLeft, IconMoreHorizontal } from "@/components/worker/icons";
import { WorkerApplicationsPageSkeleton } from "@/components/worker/worker-loading-skeletons";
import { JoballaApiError } from "@/lib/joballa/request";
import { portalDetailSectionClass } from "@/components/portal/portal-ui";
import { cn } from "@/lib/utils";

function fallbackList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((line): line is string => typeof line === "string" && line.trim().length > 0) : [];
}

function cadenceLine(row: ReturnType<typeof workerApplicationRowFromApi>) {
  if (row.jobType.toLowerCase().includes("part")) return "3d/week";
  if (row.jobType.toLowerCase().includes("full")) return "5d/week";
  return "";
}

export function WorkerApplicationDetailPage({ applicationId }: { applicationId: string }) {
  const t = useTranslations("worker.applications");
  const tProfile = useTranslations("employer.applicantDetail");
  const query = useWorkerApplication(applicationId);

  const row = useMemo(() => {
    if (!query.data) return null;
    return workerApplicationRowFromApi(query.data);
  }, [query.data]);

  const profile = useMemo(() => {
    const snapshot = query.data?.profileSnapshot;
    if (!snapshot || typeof snapshot !== "object") {
      return parseSubmittedProfile(undefined);
    }
    return parseSubmittedProfile(snapshot as Record<string, unknown>);
  }, [query.data?.profileSnapshot]);

  const coverNote = useMemo(() => {
    const note = query.data?.jobSpecificNote ?? query.data?.coverNote;
    return typeof note === "string" && note.trim() ? note.trim() : null;
  }, [query.data?.coverNote, query.data?.jobSpecificNote]);

  if (query.isLoading) {
    return <WorkerApplicationsPageSkeleton />;
  }

  if (query.isError || !row) {
    const message =
      query.error instanceof JoballaApiError ? query.error.message : t("loadError");
    return (
      <div className="flex min-h-[40vh] flex-1 flex-col items-center justify-center gap-4 px-4 py-10 text-center">
        <p className="text-sm text-[var(--joballa-muted)]">{message}</p>
        <Link href="/worker/applications" className="text-sm font-semibold text-[var(--joballa-primary)] hover:underline">
          {t("detail.back")}
        </Link>
      </div>
    );
  }

  const apiJob = query.data?.job;
  const description = (typeof apiJob?.description === "string" ? apiJob.description : "").trim();
  const requirements = fallbackList(apiJob?.requirements);
  const whatYouWillDo = fallbackList(apiJob?.responsibilities);
  const displayRequirements = requirements.length ? requirements : fallbackList(t.raw("detail.requirements"));
  const displayWhatYouWillDo = whatYouWillDo.length ? whatYouWillDo : fallbackList(t.raw("detail.whatYouWillDo"));

  const stats: { label: string; value: string }[] = [
    { label: t("detail.jobMeta.jobType"), value: row.detailJobType ?? row.jobType },
    { label: t("detail.jobMeta.location"), value: row.detailLocation ?? row.location },
    { label: t("detail.jobMeta.start"), value: row.detailStart ?? "" },
    { label: t("detail.jobMeta.duration"), value: row.detailDuration ?? "" },
    { label: t("detail.jobMeta.applicants"), value: row.detailApplicantsSoFar ?? "" },
  ].filter((s) => s.value);

  return (
    <div className="mx-auto flex w-full max-w-[1420px] min-w-0 flex-1 flex-col gap-8 bg-[var(--joballa-page-tint)] text-sm">
      <Link
        href="/worker/applications"
        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[var(--joballa-muted)] hover:text-[var(--joballa-fg)]"
      >
        <IconChevronLeft className="size-4" />
        {t("detail.back")}
      </Link>

      <div className="grid gap-6 xl:grid-cols-[minmax(340px,0.72fr)_minmax(0,1.62fr)] xl:items-start xl:gap-8">
        <div className="space-y-5">
          <section className="rounded-[18px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-2xl font-semibold leading-8 text-[var(--joballa-primary)]">{row.pay}</p>
                <p className="mt-1 text-sm font-semibold text-[var(--joballa-muted)]">
                  {[row.jobType, cadenceLine(row)].filter(Boolean).join(" · ")}
                </p>
              </div>
              <button
                type="button"
                className="grid size-8 shrink-0 place-items-center rounded-xl bg-[var(--joballa-card)] text-[var(--joballa-muted)] transition hover:bg-[var(--joballa-row-hover)] hover:text-[var(--joballa-fg)]"
                aria-label={t("detail.jobMenu")}
              >
                <IconMoreHorizontal className="size-4" />
              </button>
            </div>

            <h2 className="mt-6 text-lg font-semibold leading-7 text-[var(--joballa-fg)]">{row.jobTitle}</h2>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--joballa-fg)] text-[8px] font-bold text-[var(--joballa-on-primary)]">
                {row.companyInitial}
              </div>
              <span className="truncate text-xs font-semibold text-[var(--joballa-muted)]">{row.company}</span>
            </div>

            <dl className="mt-6 space-y-1.5">
              {stats.map((s) => (
                <div key={s.label} className="flex items-center justify-between gap-4 text-sm font-semibold">
                  <dt className="text-[var(--joballa-fg)]">{s.label}</dt>
                  <dd className="text-right text-[var(--joballa-muted)]">{s.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-[18px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-5 shadow-sm sm:p-6">
            <h3 className="text-base font-semibold text-[var(--joballa-fg)]">{t("detail.aboutTitle")}</h3>
            {description ? (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--joballa-muted)]">{description}</p>
            ) : (
              <p className="mt-3 text-sm leading-6 text-[var(--joballa-muted)]">{t("detail.emptyDescription")}</p>
            )}
            {displayRequirements.length > 0 ? (
              <>
                <p className="mt-5 text-sm font-semibold text-[var(--joballa-fg)]">{t("detail.requirementsTitle")}</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--joballa-muted)]">
                  {displayRequirements.map((line, index) => (
                    <li key={`req-${index}`}>{line}</li>
                  ))}
                </ul>
              </>
            ) : null}
            {displayWhatYouWillDo.length > 0 ? (
              <>
                <p className="mt-5 text-sm font-semibold text-[var(--joballa-fg)]">{t("detail.whatYouDoTitle")}</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--joballa-muted)]">
                  {displayWhatYouWillDo.map((line, index) => (
                    <li key={`resp-${index}`}>{line}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>
        </div>

        <section className={cn(portalDetailSectionClass, "min-h-0 p-6 sm:p-8")}>
          <h3 className="mb-5 text-lg font-bold text-[var(--joballa-fg)] sm:text-xl">{t("detail.submittedProfileTitle")}</h3>
          <ProfileSections
            profile={profile}
            t={tProfile}
            variant="page"
            coverNote={coverNote}
            allowDocumentDownload={false}
          />
        </section>
      </div>
    </div>
  );
}
