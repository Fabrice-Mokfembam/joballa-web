"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { useWorkerApplication } from "@/features/worker/hooks";
import { workerApplicationRowFromApi } from "@/features/worker/lib/application-mappers";
import { workerJobCardFromApi } from "@/features/worker/lib/job-mappers";
import { IconChevronLeft, IconMoreHorizontal } from "@/components/worker/icons";
import { WorkerProfilePublic } from "@/components/worker/worker-profile-public";
import { WorkerApplicationsPageSkeleton } from "@/components/worker/worker-loading-skeletons";
import { JoballaApiError } from "@/lib/joballa/request";
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
  const query = useWorkerApplication(applicationId);

  const row = useMemo(() => {
    if (!query.data) return null;
    return workerApplicationRowFromApi(query.data);
  }, [query.data]);

  const job = useMemo(() => {
    const apiJob = query.data?.job;
    if (!apiJob) return null;
    return workerJobCardFromApi(apiJob);
  }, [query.data?.job]);

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

  const subtitleParts = [job?.subtitle, row.jobType, row.location].filter(Boolean);
  const subtitle = subtitleParts[0] ?? "";
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
        className="inline-flex w-fit items-center gap-2 text-2xl font-semibold text-[var(--joballa-muted)] hover:text-[var(--joballa-fg)]"
      >
        <IconChevronLeft className="size-5" />
        {t("detail.back")}
      </Link>

      <div className="grid gap-6 xl:grid-cols-[minmax(340px,0.72fr)_minmax(0,1.62fr)] xl:items-start xl:gap-8">
        <div className="space-y-5">
          <section className="rounded-[18px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-6 shadow-sm sm:p-8">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-3xl font-bold leading-tight text-[#0d7377] sm:text-4xl">{row.pay}</p>
                <p className="mt-1 text-base font-bold leading-6 text-[var(--joballa-muted)] sm:text-lg">
                  {[row.jobType, cadenceLine(row)].filter(Boolean).join(" · ")}
                </p>
              </div>
              <button
                type="button"
                className="grid size-12 place-items-center rounded-[16px] bg-[var(--joballa-surface)] text-[var(--joballa-muted)] hover:bg-neutral-100 hover:text-[var(--joballa-fg)]"
                aria-label={t("detail.jobMenu")}
              >
                <IconMoreHorizontal className="size-6" />
              </button>
            </div>

            <h2 className="mt-10 text-xl font-bold leading-7 text-[var(--joballa-fg)] sm:mt-12 sm:text-2xl sm:leading-8">{row.jobTitle}</h2>
            <div className="mt-2.5 flex items-center gap-3">
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-full bg-black text-sm font-bold text-white",
                )}
              >
                {row.companyInitial}
              </div>
              <span className="text-lg font-bold text-[var(--joballa-muted)]">{row.company}</span>
            </div>

            <dl className="mt-12 space-y-3">
              {stats.map((s) => (
                <div key={s.label} className="grid grid-cols-[minmax(0,1fr)_minmax(7rem,auto)] items-start gap-3 text-base leading-6 sm:grid-cols-[minmax(0,1fr)_minmax(9rem,auto)] sm:gap-4 sm:text-lg">
                  <dt className="font-bold text-[var(--joballa-fg)]">{s.label}</dt>
                  <dd className="text-right font-bold text-[var(--joballa-muted)]">{s.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-[18px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-6 shadow-sm sm:p-8">
            <h3 className="text-lg font-bold text-[var(--joballa-fg)] sm:text-xl">{t("detail.aboutTitle")}</h3>
            {description ? (
              <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-[var(--joballa-muted)] sm:mt-5 sm:text-xl sm:leading-8">{description}</p>
            ) : (
              <p className="mt-4 text-base leading-7 text-[var(--joballa-muted)] sm:mt-5 sm:text-xl sm:leading-8">{t("detail.emptyDescription")}</p>
            )}
            {displayRequirements.length > 0 ? (
              <>
                <p className="mt-8 text-lg font-bold text-[var(--joballa-fg)] sm:mt-10 sm:text-xl">{t("detail.requirementsTitle")}</p>
                <ul className="mt-4 list-disc space-y-1.5 pl-6 text-base leading-7 text-[var(--joballa-muted)] sm:mt-5 sm:pl-8 sm:text-xl sm:leading-8">
                  {displayRequirements.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </>
            ) : null}
            {displayWhatYouWillDo.length > 0 ? (
              <>
                <p className="mt-8 text-lg font-bold text-[var(--joballa-fg)] sm:mt-10 sm:text-xl">{t("detail.whatYouDoTitle")}</p>
                <ul className="mt-4 list-disc space-y-1.5 pl-6 text-base leading-7 text-[var(--joballa-muted)] sm:mt-5 sm:pl-8 sm:text-xl sm:leading-8">
                  {displayWhatYouWillDo.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>
        </div>

        <WorkerProfilePublic showEditProfileButton={false} className="xl:min-w-0" />
      </div>
    </div>
  );
}
