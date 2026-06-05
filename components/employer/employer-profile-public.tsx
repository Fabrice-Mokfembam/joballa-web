"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { EmployerAsyncState } from "@/components/employer/employer-async-state";
import { portalCardClass } from "@/components/portal/portal-ui";
import { useEmployerCompany, useEmployerDashboard } from "@/features/employer/hooks";
import { formatStatValue } from "@/features/employer/lib/applicant-helpers";
import { EmployerProfilePageSkeleton } from "@/components/employer/employer-loading-skeletons";
import { cn } from "@/lib/utils";

function formatLocation(loc: unknown): string {
  if (!loc) return "—";
  if (typeof loc === "string") return loc;
  const o = loc as { city?: string; country?: string };
  return [o.city, o.country].filter(Boolean).join(", ") || "—";
}

export function EmployerProfilePublic({ className }: { className?: string }) {
  const t = useTranslations("employer.profile");
  const company = useEmployerCompany();
  const dashboard = useEmployerDashboard();
  const data = company.data;

  const applicantsCount =
    data?.applicantsCount ??
    dashboard.data?.totalApplicants?.count ??
    dashboard.data?.totalApplicants;
  const employeesCount =
    data?.employeesCount ?? dashboard.data?.hiredWorkers?.count ?? dashboard.data?.hiredWorkers;
  const shortBio = String(data?.tagline ?? "").trim();

  return (
    <EmployerAsyncState
      isLoading={company.isLoading}
      isError={company.isError}
      error={company.error}
      onRetry={() => void company.refetch()}
      skeleton={<EmployerProfilePageSkeleton />}
    >
      <div className={cn("flex flex-col items-center gap-4 sm:gap-5", className)}>
        <Link
          href="/employer/profile/edit"
          className="inline-flex min-h-10 items-center justify-center rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] px-5 text-sm font-semibold text-[var(--joballa-fg)] shadow-[0_1px_2px_rgba(0,0,0,0.06)] outline-none ring-[var(--joballa-primary)] transition hover:border-[color-mix(in_srgb,var(--joballa-primary)_35%,var(--joballa-border))] hover:bg-[var(--joballa-row-hover)] focus-visible:ring-2"
        >
          {t("preview.editProfile")}
        </Link>

        <article className={cn(portalCardClass(), "w-full px-5 py-6 sm:px-8 sm:py-8 lg:px-14 lg:py-12")}>
          <div className="flex flex-col gap-5 border-b border-[var(--joballa-border)] pb-6 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              {data?.logoUrl || data?.logo ? (
                <span className="relative size-24 shrink-0 overflow-hidden rounded-full border border-[var(--joballa-border)] bg-[var(--joballa-tag-bg)] sm:size-28">
                  <Image
                    src={String(data.logoUrl ?? data.logo)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="112px"
                    unoptimized
                  />
                </span>
              ) : (
                <span className="flex size-24 shrink-0 items-center justify-center rounded-full bg-[var(--joballa-primary)] text-2xl font-bold text-[var(--joballa-on-primary)] sm:size-28">
                  {(data?.name ?? "C").charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <h2 className="text-xl font-bold leading-7 tracking-tight text-[var(--joballa-fg)] sm:text-2xl">
                  {data?.name ?? "—"}
                </h2>
                {data?.industry?.trim() ? (
                  <p className="mt-0.5 text-sm font-medium leading-5 text-[var(--joballa-muted)]">{data.industry}</p>
                ) : null}
                {shortBio ? (
                  <p className="mt-0.5 text-sm font-medium leading-5 text-[var(--joballa-muted)]">{shortBio}</p>
                ) : null}
                {data?.verificationStatus ? (
                  <span className="mt-2 inline-flex rounded-full bg-[var(--joballa-jade-3)] px-2.5 py-0.5 text-xs font-semibold capitalize text-[var(--joballa-primary)]">
                    {String(data.verificationStatus)}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="shrink-0 space-y-1 text-center text-sm leading-6 text-[var(--joballa-muted)] md:text-right">
              <p>{formatLocation(data?.location)}</p>
              {data?.website ? <p>{String(data.website)}</p> : null}
            </div>
          </div>

          <div className="grid gap-4 border-b border-[var(--joballa-border)] py-6 sm:grid-cols-2">
            <div className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-pill-bg)] px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--joballa-muted)]">
                {t("preview.applicantsLabel")}
              </p>
              <p className="mt-1 text-2xl font-semibold text-[var(--joballa-fg)]">
                {formatStatValue(
                  typeof applicantsCount === "object"
                    ? (applicantsCount as { count?: number | string })
                    : { count: applicantsCount as number | string | undefined },
                )}
              </p>
            </div>
            <div className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-pill-bg)] px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--joballa-muted)]">
                {t("preview.employeesLabel")}
              </p>
              <p className="mt-1 text-2xl font-semibold text-[var(--joballa-fg)]">
                {formatStatValue(
                  typeof employeesCount === "object"
                    ? (employeesCount as { count?: number | string })
                    : { count: employeesCount as number | string | undefined },
                )}
              </p>
            </div>
          </div>

          <section className="grid gap-3 border-b border-[var(--joballa-border)] py-6 md:grid-cols-[minmax(10rem,28%)_1fr]">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--joballa-muted)]">
              {t("preview.aboutLabel")}
            </p>
            <p className="text-sm leading-6 text-[var(--joballa-fg)]">{data?.bio?.trim() || "—"}</p>
          </section>

          {data?.website ? (
            <section className="grid gap-3 pt-6 md:grid-cols-[minmax(10rem,28%)_1fr]">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--joballa-muted)]">
                {t("preview.websiteLabel")}
              </p>
              <p className="text-sm font-medium text-[var(--joballa-primary)]">{String(data.website)}</p>
            </section>
          ) : null}
        </article>
      </div>
    </EmployerAsyncState>
  );
}
