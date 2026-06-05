"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { useWorkerDocuments, useWorkerFullProfile } from "@/features/worker/hooks";
import {
  documentFileLabel,
  formatCertificationMeta,
  formatEducationMeta,
  formatWorkHistoryMeta,
  profileDisplayName,
  profileEmploymentTypes,
  profileHeadline,
  profileIndustriesLine,
  profileLanguagesLine,
  profileLocationLine,
  profileSkillsLine,
} from "@/features/worker/lib/profile-display";
import { portalCardClass, portalOutlineButtonClass } from "@/components/portal/portal-ui";
import { IconGlobe, IconPencil, IconPhone, IconPin, IconPlus, IconShieldCheck, IconVerified } from "@/components/worker/icons";
import { isVerifiedStatus } from "@/features/worker/lib/verification";
import { WorkerProfilePageSkeleton } from "@/components/worker/worker-loading-skeletons";
import { JoballaApiError } from "@/lib/joballa/request";
import { cn } from "@/lib/utils";

export function WorkerProfilePublic({
  className,
  showEditProfileButton = true,
}: {
  className?: string;
  showEditProfileButton?: boolean;
}) {
  const tProfile = useTranslations("worker.profile");
  const tNav = useTranslations("worker.nav");
  const profileQuery = useWorkerFullProfile();
  const documentsQuery = useWorkerDocuments();

  if (profileQuery.isLoading) {
    return (
      <div className={cn("w-full", className)}>
        <WorkerProfilePageSkeleton />
      </div>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    const message =
      profileQuery.error instanceof JoballaApiError
        ? profileQuery.error.message
        : tProfile("loadError");
    return (
      <div className={cn(portalCardClass(), "p-8 text-center text-sm text-[var(--joballa-muted)]", className)}>
        {message}
      </div>
    );
  }

  const profile = profileQuery.data;
  const documents = documentsQuery.data ?? profile.documents ?? [];
  const name = profileDisplayName(profile);
  const verified =
    profile.kycSubmissions?.some((k) => isVerifiedStatus(String(k.status))) || isVerifiedStatus(profile.verificationStatus);
  const available = String(profile.availabilityStatus ?? "").toUpperCase() === "AVAILABLE";
  const avatarUrl = profile.avatarUrl;

  return (
    <div className={cn("relative flex flex-col items-center gap-4 pb-20 sm:gap-5", className)}>
      {showEditProfileButton ? (
        <div className="flex w-full max-w-[72rem] flex-wrap items-center justify-between gap-2 sm:gap-3">
          <Link
            href="/worker/profile/edit"
            className={portalOutlineButtonClass + " hidden min-h-10 px-5 font-semibold min-[600px]:inline-flex"}
          >
            {tProfile("preview.editProfile")}
          </Link>
          <Link href="/worker/my-jobs" className={portalOutlineButtonClass}>
            {tProfile("preview.viewMyJobs")}
          </Link>
        </div>
      ) : null}

      <article className={cn(portalCardClass(), "w-full px-5 py-6 text-sm leading-6 text-[var(--joballa-fg)] sm:px-8 sm:py-8 lg:px-14 lg:py-12")}>
        <div className="flex flex-col gap-5 border-b border-[var(--joballa-border)] pb-6 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-start gap-3 text-left sm:gap-4">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-[var(--joballa-avatar-bg)] min-[480px]:size-24 sm:size-28">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="" fill className="object-cover" sizes="112px" unoptimized />
              ) : (
                <div className="flex size-full items-center justify-center text-xl font-bold text-[var(--joballa-muted)] min-[480px]:text-2xl">
                  {(name.trim().charAt(0) || "?").toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-start gap-1.5 sm:gap-2">
                <h2 className="text-base font-bold leading-6 tracking-tight text-[var(--joballa-fg)] min-[480px]:text-xl sm:text-2xl">{name}</h2>
                {verified ? (
                  <span className="group relative inline-flex">
                    <IconVerified className="size-4 shrink-0 text-[var(--joballa-primary)] min-[480px]:size-5" aria-label={tProfile("preview.verified")} />
                    <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-56 -translate-x-1/2 rounded-lg border border-[var(--joballa-border)] bg-[var(--joballa-dropdown-bg)] px-3 py-2 text-center text-xs font-medium text-[var(--joballa-fg)] shadow-[var(--joballa-shadow-elevated)] group-hover:block group-focus-within:block">
                      {tProfile("preview.verificationTooltip")}
                    </span>
                  </span>
                ) : null}
              </div>
              {profileHeadline(profile) ? (
                <p className="mt-0.5 text-xs font-medium leading-5 text-[var(--joballa-fg-subtle)] min-[480px]:text-sm">{profileHeadline(profile)}</p>
              ) : null}
              <div className="mt-2 flex flex-wrap items-center justify-start gap-2">
                {available ? (
                  <span className="inline-flex min-h-6 items-center justify-center rounded-full bg-[var(--joballa-jade-3)] px-2.5 text-[11px] font-semibold leading-none text-[var(--joballa-primary)]">
                    {tProfile("preview.availableForHire")}
                  </span>
                ) : null}
                {!showEditProfileButton ? (
                  <Link
                    href="/worker/profile/edit"
                    className="inline-flex size-8 items-center justify-center rounded-full border border-[var(--joballa-border)] bg-[var(--joballa-card)] text-[var(--joballa-primary)] shadow-sm outline-none ring-[var(--joballa-primary)] transition hover:bg-[var(--joballa-row-hover)] focus-visible:ring-2 min-[600px]:hidden"
                    aria-label={tProfile("preview.editProfile")}
                  >
                    <IconPencil className="size-4" />
                  </Link>
                ) : null}
              </div>
              {!verified ? (
                <Link
                  href="/worker/profile/edit?section=verification"
                  className="mt-3 inline-flex min-h-7 items-center justify-center gap-1 rounded-[10px] border border-dashed border-[var(--joballa-primary)] bg-transparent px-2.5 text-xs font-semibold text-[var(--joballa-primary)] outline-none ring-[var(--joballa-primary)] transition hover:bg-[var(--joballa-jade-3)] focus-visible:ring-2"
                >
                  <IconShieldCheck className="size-3.5" />
                  {tProfile("preview.verifyKyc")}
                </Link>
              ) : null}
            </div>
          </div>
          <div className="shrink-0 space-y-2 border-t border-[var(--joballa-border)] pt-4 text-sm leading-6 text-[var(--joballa-fg-subtle)] md:min-w-64 lg:border-t-0 lg:pt-0">
            {profileLocationLine(profile) ? (
              <p className="flex items-center gap-2"><IconPin className="size-4" />{profileLocationLine(profile)}</p>
            ) : null}
            {profile.mobileMoneyNumber?.trim() ? (
              <p className="flex items-center gap-2"><IconPhone className="size-4" />{profile.mobileMoneyNumber}</p>
            ) : null}
            {profileLanguagesLine(profile) ? (
              <p className="flex items-center gap-2"><IconGlobe className="size-4" />{profileLanguagesLine(profile)}</p>
            ) : null}
          </div>
        </div>

        <section className="grid gap-3 border-b border-[var(--joballa-border)] py-6 md:grid-cols-[minmax(10rem,28%)_1fr]">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--joballa-label-fg)]">{tProfile("preview.summaryLabel")}</p>
          <div className="space-y-1.5 text-sm leading-6">
            {profile.professionalTitle?.trim() ? (
              <p className="text-[var(--joballa-fg)]">{profile.professionalTitle}</p>
            ) : null}
            {profile.summary?.trim() ? <p className="text-[var(--joballa-fg-subtle)]">{profile.summary}</p> : null}
            {profileIndustriesLine(profile) || profileEmploymentTypes(profile) ? (
              <p className="text-[var(--joballa-fg-subtle)]">
                {[profileIndustriesLine(profile), profileEmploymentTypes(profile)].filter(Boolean).join(" · ")}
              </p>
            ) : null}
          </div>
        </section>

        <section className="grid gap-3 border-b border-[var(--joballa-border)] py-6 md:grid-cols-[minmax(10rem,28%)_1fr]">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--joballa-label-fg)]">{tProfile("preview.skillsLabel")}</p>
          {profileSkillsLine(profile) ? (
            <p className="text-sm font-bold leading-6 text-[var(--joballa-fg)]">{profileSkillsLine(profile)}</p>
          ) : (
            <p className="text-sm text-[var(--joballa-fg-subtle)]">{tProfile("preview.emptySkills")}</p>
          )}
        </section>

        <section className="grid gap-4 border-b border-[var(--joballa-border)] py-6 md:grid-cols-[minmax(10rem,28%)_1fr]">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--joballa-label-fg)]">{tProfile("preview.workLabel")}</p>
          <div className="space-y-8 text-[var(--joballa-fg)]">
            {(profile.workHistories ?? []).length === 0 ? (
              <p className="text-sm text-[var(--joballa-fg-subtle)]">{tProfile("preview.emptyWork")}</p>
            ) : (
              (profile.workHistories ?? []).map((entry) => (
                <div key={entry.id}>
                  {entry.companyName?.trim() ? (
                    <p className="text-base font-bold leading-6">{entry.companyName}</p>
                  ) : null}
                  {entry.jobTitle?.trim() ? <p className="mt-1 text-sm leading-6">{entry.jobTitle}</p> : null}
                  {entry.description ? (
                    <p className="mt-1.5 max-w-4xl text-sm leading-6 text-[var(--joballa-fg-subtle)]">{entry.description}</p>
                  ) : null}
                  <p className="mt-1.5 text-sm leading-6 text-[var(--joballa-fg-subtle)]">{formatWorkHistoryMeta(entry)}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="grid gap-4 border-b border-[var(--joballa-border)] py-6 md:grid-cols-[minmax(10rem,28%)_1fr]">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--joballa-label-fg)]">{tProfile("preview.educationLabel")}</p>
          <div className="space-y-6 text-[var(--joballa-fg)]">
            {(profile.educations ?? []).length === 0 ? (
              <p className="text-sm text-[var(--joballa-fg-subtle)]">{tProfile("preview.emptyEducation")}</p>
            ) : (
              (profile.educations ?? []).map((entry) => (
                <div key={entry.id}>
                  {entry.institution?.trim() ? (
                    <p className="text-base font-bold leading-6">{entry.institution}</p>
                  ) : null}
                  {[entry.degree, entry.fieldOfStudy].filter(Boolean).length > 0 ? (
                    <p className="mt-1 text-sm leading-6 text-[var(--joballa-fg-subtle)]">
                      {[entry.degree, entry.fieldOfStudy].filter(Boolean).join(" · ")}
                    </p>
                  ) : null}
                  {formatEducationMeta(entry) ? (
                    <p className="mt-1.5 text-sm leading-6 text-[var(--joballa-fg-subtle)]">{formatEducationMeta(entry)}</p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </section>

        <section className="grid gap-4 border-b border-[var(--joballa-border)] py-6 md:grid-cols-[minmax(10rem,28%)_1fr]">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--joballa-label-fg)]">{tProfile("preview.certificationsLabel")}</p>
          <div className="space-y-6 text-[var(--joballa-fg)]">
            {(profile.certifications ?? []).length === 0 ? (
              <p className="text-sm text-[var(--joballa-fg-subtle)]">{tProfile("preview.emptyCertifications")}</p>
            ) : (
              (profile.certifications ?? []).map((entry) => (
                <div key={entry.id}>
                  {entry.name?.trim() ? <p className="text-base font-bold leading-6">{entry.name}</p> : null}
                  {formatCertificationMeta(entry) ? (
                    <p className="mt-1.5 text-sm leading-6 text-[var(--joballa-fg-subtle)]">{formatCertificationMeta(entry)}</p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </section>

        <section className="grid gap-4 pt-6 md:grid-cols-[minmax(10rem,28%)_1fr]">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--joballa-label-fg)]">{tProfile("preview.documentsLabel")}</p>
          <div className="space-y-3">
            {documents.length === 0 ? (
              <p className="text-sm text-[var(--joballa-fg-subtle)]">{tProfile("preview.emptyDocuments")}</p>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="flex min-w-0 items-center gap-3">
                  <span className="flex size-12 shrink-0 items-end justify-center overflow-hidden rounded-[8px] bg-[#e5e5e5]">
                    <span className="flex h-7 w-full items-center justify-center bg-[#d42ba3] text-sm font-bold text-white">
                      {(doc.fileName ?? "DOC").split(".").pop()?.slice(0, 3).toUpperCase() ?? "DOC"}
                    </span>
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[var(--joballa-fg)]">{documentFileLabel(doc)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </article>
      {showEditProfileButton ? (
        <Link
          href="/worker/jobs/new"
          className="absolute bottom-4 right-3 z-30 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--joballa-primary)] px-6 text-sm font-semibold text-[var(--joballa-on-primary)] shadow-[var(--joballa-shadow-elevated)] outline-none ring-[var(--joballa-primary)] transition hover:opacity-[0.96] focus-visible:ring-2 min-[600px]:bottom-5 min-[600px]:right-5 min-[600px]:px-7"
        >
          <IconPlus className="size-4" />
          {tNav("postJob")}
        </Link>
      ) : null}
    </div>
  );
}
