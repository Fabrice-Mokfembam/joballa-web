"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import {
  useDownloadWorkerCvExport,
  useGenerateWorkerCvExport,
  useWorkerCvExportStatus,
  useWorkerDocuments,
  useWorkerFullProfile,
  useWorkerMe,
} from "@/features/worker/hooks";
import {
  documentFileLabel,
  formatCertificationMeta,
  formatEducationMeta,
  formatWorkHistoryMeta,
  profileDisplayName,
  profileInitials,
  profileEmploymentTypes,
  profileHeadline,
  profileIndustriesLine,
  profileLanguagesLine,
  profileLocationLine,
  profileSkillsLine,
  sortedCertifications,
  sortedEducations,
  sortedWorkHistories,
} from "@/features/worker/lib/profile-display";
import { isAvailableForHire } from "@/features/worker/lib/availability";
import { ProfileSectionEmpty } from "@/components/worker/profile-section-empty";
import { portalCardClass, portalOutlineButtonClass } from "@/components/portal/portal-ui";
import { buttonClassName } from "@/components/ui/button";
import { IconDownload, IconFileDown, IconGlobe, IconPencil, IconPhone, IconPin, IconPlus, IconShieldCheck, IconVerified } from "@/components/worker/icons";
import { getVerificationStatus, isPendingStatus, isVerifiedStatus } from "@/features/worker/lib/verification";
import { WorkerProfilePageSkeleton } from "@/components/worker/worker-loading-skeletons";
import { JoballaApiError } from "@/lib/joballa/request";
import type { WorkerFullProfile } from "@/features/worker/types/worker-portal";
import { cn } from "@/lib/utils";

export function WorkerProfilePublic({
  className,
  showEditProfileButton = true,
  applicationNote,
  compactHeader = false,
  previewProfile,
}: {
  className?: string;
  showEditProfileButton?: boolean;
  applicationNote?: string;
  compactHeader?: boolean;
  /** When set (e.g. apply-flow preview), renders this profile instead of the live query. */
  previewProfile?: WorkerFullProfile;
}) {
  const tProfile = useTranslations("worker.profile");
  const profileQuery = useWorkerFullProfile();
  const meQuery = useWorkerMe();
  const documentsQuery = useWorkerDocuments();
  const cvStatusQuery = useWorkerCvExportStatus();
  const generateCv = useGenerateWorkerCvExport();
  const downloadCv = useDownloadWorkerCvExport();

  if (!previewProfile && profileQuery.isLoading) {
    return (
      <div className={cn("w-full", className)}>
        <WorkerProfilePageSkeleton />
      </div>
    );
  }

  if (!previewProfile && (profileQuery.isError || !profileQuery.data)) {
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

  const profile = previewProfile ?? profileQuery.data!;
  const documents = previewProfile?.documents ?? documentsQuery.data ?? profile.documents ?? [];
  const name = profileDisplayName(profile);
  const kycStatus = getVerificationStatus(profile, profile.kycSubmissions?.[0]);
  const verified = isVerifiedStatus(kycStatus);
  const kycPending = isPendingStatus(kycStatus);
  const available = isAvailableForHire(profile);
  const paymentMethods = profile.paymentMethods ?? profile.paymentAccounts ?? [];
  const primaryPayment = paymentMethods.find((m) => m.isPrimary) ?? paymentMethods[0];
  const contactPhone =
    meQuery.data?.phone?.trim() ||
    primaryPayment?.phoneNumber?.trim() ||
    primaryPayment?.phone?.trim() ||
    profile.mobileMoneyNumber?.trim() ||
    "";
  const workHistories = sortedWorkHistories(profile);
  const educations = sortedEducations(profile);
  const certifications = sortedCertifications(profile);
  const avatarUrl = profile.avatarUrl;
  const cvStatus = cvStatusQuery.data;
  const cvBusy = generateCv.isPending || downloadCv.isPending;

  return (
    <div className={cn("flex flex-col items-center gap-4 sm:gap-5", className)}>
      {showEditProfileButton ? (
        <div className="flex w-full max-w-[72rem] flex-wrap items-center justify-between gap-2 sm:gap-3">
          <Link
            href="/worker/profile/edit"
            className={portalOutlineButtonClass + " hidden min-h-10 px-5 font-semibold min-[600px]:inline-flex"}
          >
            {tProfile("preview.editProfile")}
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {cvStatus?.available && cvStatus.isOutdated ? (
              <button
                type="button"
                disabled={cvBusy}
                onClick={() => downloadCv.mutate()}
                className={cn(portalOutlineButtonClass, "gap-2 disabled:cursor-wait disabled:opacity-60")}
              >
                <IconDownload className="size-4" />
                {tProfile("preview.downloadPreviousCv")}
              </button>
            ) : null}
            <button
              type="button"
              disabled={cvBusy || cvStatusQuery.isLoading}
              onClick={() => (cvStatus?.available && !cvStatus.isOutdated ? downloadCv.mutate() : generateCv.mutate())}
              className={cn(portalOutlineButtonClass, "gap-2 disabled:cursor-wait disabled:opacity-60")}
            >
              {cvStatus?.available && !cvStatus.isOutdated ? (
                <IconDownload className="size-4" />
              ) : (
                <IconFileDown className="size-4" />
              )}
              {cvBusy
                ? tProfile("preview.cvWorking")
                : cvStatus?.available && !cvStatus.isOutdated
                  ? tProfile("preview.downloadCv")
                  : cvStatus?.available
                    ? tProfile("preview.regenerateCv")
                    : tProfile("preview.exportCv")}
            </button>
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/worker/my-jobs" className={portalOutlineButtonClass}>
                {tProfile("preview.viewMyJobs")}
              </Link>
              <Link
                href="/worker/jobs/new"
                className={cn(buttonClassName("primary"), "inline-flex gap-2")}
              >
                <IconPlus className="size-4" />
                {tProfile("preview.postJob")}
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <article className={cn(portalCardClass(), "w-full px-5 py-6 text-sm leading-6 text-[var(--joballa-fg)] sm:px-8 sm:py-8 lg:px-14 lg:py-12")}>
        {applicationNote?.trim() ? (
          <section className="mb-6 border-b border-[var(--joballa-border)] pb-6">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--joballa-label-fg)]">{tProfile("preview.applicationNoteLabel")}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--joballa-fg-subtle)]">{applicationNote}</p>
          </section>
        ) : null}

        <div className={cn("flex flex-col gap-5 border-b border-[var(--joballa-border)] pb-6 sm:flex-row sm:items-start sm:justify-between", compactHeader && "pb-4")}>
          <div className="flex min-w-0 items-start gap-3 text-left sm:gap-4">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-[var(--joballa-avatar-bg)] min-[480px]:size-24 sm:size-28">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="" fill className="object-cover" sizes="112px" unoptimized />
              ) : (
                <div className="flex size-full items-center justify-center text-xl font-bold text-[var(--joballa-muted)] min-[480px]:text-2xl">
                  {profileInitials(name || profile.professionalTitle || "?")}
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
                ) : kycPending ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--joballa-border)] px-2 py-0.5 text-[10px] font-semibold text-[var(--joballa-muted)]">
                    <IconShieldCheck className="size-3" />
                    {tProfile("preview.underReview")}
                  </span>
                ) : (
                  <Link
                    href="/worker/profile/edit?section=verification"
                    className="inline-flex items-center gap-1 rounded-full border border-dashed border-[var(--joballa-primary)] px-2 py-0.5 text-[10px] font-semibold text-[var(--joballa-primary)] transition hover:bg-[var(--joballa-jade-3)]"
                  >
                    <IconShieldCheck className="size-3" />
                    {tProfile("preview.verifyKyc")}
                  </Link>
                )}
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
            </div>
          </div>
          <div className="shrink-0 space-y-2 text-sm leading-6 text-[var(--joballa-fg-subtle)] sm:min-w-56 sm:text-right">
            {profileLocationLine(profile) ? (
              <p className="flex items-center gap-2 sm:justify-end"><IconPin className="size-4 shrink-0" />{profileLocationLine(profile)}</p>
            ) : null}
            {contactPhone ? (
              <p className="flex items-center gap-2 sm:justify-end"><IconPhone className="size-4 shrink-0" />{contactPhone}</p>
            ) : null}
            {profileLanguagesLine(profile) ? (
              <p className="flex items-center gap-2 sm:justify-end"><IconGlobe className="size-4 shrink-0" />{profileLanguagesLine(profile)}</p>
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
            {workHistories.length === 0 ? (
              <ProfileSectionEmpty
                message={tProfile("preview.emptyWork")}
                actionLabel={tProfile("preview.addWork")}
                actionHref="/worker/profile/edit?section=work"
              />
            ) : (
              workHistories.map((entry) => (
                <div key={entry.id}>
                  {entry.jobTitle?.trim() ? (
                    <p className="text-base font-bold leading-6 text-[var(--joballa-primary)]">{entry.jobTitle}</p>
                  ) : null}
                  {entry.companyName?.trim() ? <p className="mt-1 text-sm leading-6">{entry.companyName}</p> : null}
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
            {educations.length === 0 ? (
              <ProfileSectionEmpty
                message={tProfile("preview.emptyEducation")}
                actionLabel={tProfile("preview.addEducation")}
                actionHref="/worker/profile/edit?section=education"
              />
            ) : (
              educations.map((entry) => (
                <div key={entry.id}>
                  {entry.degree?.trim() ? (
                    <p className="text-base font-bold leading-6 text-[var(--joballa-primary)]">{entry.degree}</p>
                  ) : null}
                  {entry.institution?.trim() ? (
                    <p className="mt-1 text-sm leading-6">{entry.institution}</p>
                  ) : null}
                  {entry.fieldOfStudy?.trim() ? (
                    <p className="mt-1 text-sm leading-6 text-[var(--joballa-fg-subtle)]">{entry.fieldOfStudy}</p>
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
            {certifications.length === 0 ? (
              <ProfileSectionEmpty
                message={tProfile("preview.emptyCertifications")}
                actionLabel={tProfile("preview.addCertification")}
                actionHref="/worker/profile/edit?section=certifications"
              />
            ) : (
              certifications.map((entry) => (
                <div key={entry.id}>
                  {entry.name?.trim() ? (
                    entry.credentialUrl?.trim() ? (
                      <a
                        href={entry.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-bold leading-6 text-[var(--joballa-primary)] underline-offset-2 hover:underline"
                      >
                        {entry.name}
                      </a>
                    ) : (
                      <p className="text-base font-bold leading-6 text-[var(--joballa-primary)]">{entry.name}</p>
                    )
                  ) : null}
                  {formatCertificationMeta(entry) ? (
                    <p className="mt-1.5 text-sm leading-6 text-[var(--joballa-fg-subtle)]">{formatCertificationMeta(entry)}</p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </section>

        <section className="grid gap-4 border-b border-[var(--joballa-border)] py-6 md:grid-cols-[minmax(10rem,28%)_1fr] md:items-start">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--joballa-label-fg)]">{tProfile("preview.documentsLabel")}</p>
          <div className="min-w-0 space-y-3">
            {documents.length === 0 ? (
              <ProfileSectionEmpty
                message={tProfile("preview.emptyDocuments")}
                actionLabel={tProfile("preview.addDocument")}
                actionHref="/worker/profile/edit?section=verification"
              />
            ) : (
              documents.map((doc) => {
                const url = doc.url ?? (doc as { fileUrl?: string }).fileUrl;
                const label = documentFileLabel(doc);
                const typeLabel = (doc.fileName ?? doc.type ?? "DOC").toString().split(".").pop()?.slice(0, 3).toUpperCase() ?? "DOC";
                const fileIcon = (
                  <span
                    className="flex size-12 shrink-0 flex-col overflow-hidden rounded-[8px] bg-[#e5e5e5]"
                    aria-hidden
                  >
                    <span className="flex-1" />
                    <span className="flex h-5 items-center justify-center bg-[#d42ba3] text-[9px] font-bold uppercase tracking-wide text-white">
                      {typeLabel}
                    </span>
                  </span>
                );
                return (
                  <div key={doc.id} className="flex min-w-0 items-center gap-3">
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-w-0 flex-1 items-center gap-3 underline-offset-2 hover:underline"
                      >
                        {fileIcon}
                        <span className="min-w-0 truncate text-sm font-bold text-[var(--joballa-primary)]">{label}</span>
                      </a>
                    ) : (
                      <>
                        {fileIcon}
                        <p className="min-w-0 truncate text-sm font-bold text-[var(--joballa-fg)]">{label}</p>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {paymentMethods.length > 0 ? (
          <section className="grid gap-4 py-6 md:grid-cols-[minmax(10rem,28%)_1fr] md:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--joballa-label-fg)]">{tProfile("preview.paymentLabel")}</p>
              <p className="mt-1 text-xs italic text-[var(--joballa-muted)]">{tProfile("preview.paymentPrivate")}</p>
            </div>
            <div className="flex flex-wrap gap-6">
              {paymentMethods.map((method) => {
                const phone = method.phoneNumber ?? method.phone;
                const provider = String(method.provider ?? "").includes("ORANGE") ? "Orange Money" : "MTN MoMo";
                return (
                  <div key={method.id}>
                    <p className="text-sm font-semibold text-[var(--joballa-fg)]">{phone}</p>
                    <p className="text-xs text-[var(--joballa-muted)]">
                      {provider}
                      {method.isPrimary ? ` · ${tProfile("preview.primaryPayment")}` : ""}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}
      </article>
    </div>
  );
}
