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
  forceMobileLayout = false,
}: {
  className?: string;
  showEditProfileButton?: boolean;
  applicationNote?: string;
  compactHeader?: boolean;
  /** When set (e.g. apply-flow preview), renders this profile instead of the live query. */
  previewProfile?: WorkerFullProfile;
  /** Locks mobile layout regardless of viewport (e.g. landing page phone mockup). */
  forceMobileLayout?: boolean;
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
  const compact = forceMobileLayout;
  const sectionGridClass = (gap: "3" | "4" = "3", itemsStart = false) =>
    cn(
      "grid border-b border-[var(--joballa-border)]",
      compact ? "py-4" : "py-6",
      gap === "4" ? (compact ? "gap-3" : "gap-4") : compact ? "gap-2.5" : "gap-3",
      !forceMobileLayout && "md:grid-cols-[minmax(10rem,28%)_1fr]",
      !forceMobileLayout && itemsStart && "md:items-start",
    );
  const sectionLabelClass = compact
    ? "text-[10px] font-bold uppercase tracking-wide text-[var(--joballa-label-fg)]"
    : "text-xs font-bold uppercase tracking-wide text-[var(--joballa-label-fg)]";
  const bodyBlockClass = compact ? "space-y-1 text-xs leading-5" : "space-y-1.5 text-sm leading-6";
  const skillsTextClass = compact
    ? "text-xs font-semibold leading-5 text-[var(--joballa-fg)]"
    : "text-sm font-bold leading-6 text-[var(--joballa-fg)]";
  const entryTitleClass = compact
    ? "text-sm font-bold leading-5 text-[var(--joballa-primary)]"
    : "text-base font-bold leading-6 text-[var(--joballa-primary)]";
  const entryBodyClass = compact ? "text-xs leading-5" : "text-sm leading-6";
  const contactTextClass = compact ? "text-xs leading-5" : "text-sm leading-6";
  const contactIconClass = compact ? "size-3.5" : "size-4";

  return (
    <div className={cn("flex flex-col items-center gap-4", !forceMobileLayout && "sm:gap-5", className)}>
      {showEditProfileButton ? (
        <div className="flex w-full max-w-[72rem] flex-wrap items-center justify-between gap-2 sm:gap-3">
          <Link
            href="/worker/profile/edit"
            className={portalOutlineButtonClass + " hidden min-h-10 px-5 font-semibold min-[600px]:inline-flex"}
          >
            {tProfile("preview.editProfile")}
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-2">
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

      <article
        className={cn(
          portalCardClass(),
          "w-full text-[var(--joballa-fg)]",
          compact ? "px-4 py-4 text-xs leading-5" : "px-5 py-6 text-sm leading-6",
          !forceMobileLayout && "sm:px-8 sm:py-8 lg:px-14 lg:py-12",
        )}
      >
        {applicationNote?.trim() ? (
          <section className="mb-6 border-b border-[var(--joballa-border)] pb-6">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--joballa-label-fg)]">{tProfile("preview.applicationNoteLabel")}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--joballa-fg-subtle)]">{applicationNote}</p>
          </section>
        ) : null}

        <div
          className={cn(
            "flex flex-col border-b border-[var(--joballa-border)]",
            compact ? "gap-4 pb-4" : "gap-5 pb-6",
            !forceMobileLayout && "sm:flex-row sm:items-start sm:justify-between",
            compactHeader && "pb-4",
          )}
        >
          <div className={cn("flex min-w-0 items-start gap-3 text-left", !forceMobileLayout && "sm:gap-4")}>
            <div
              className={cn(
                "relative shrink-0 overflow-hidden rounded-full bg-[var(--joballa-avatar-bg)]",
                compact ? "size-14" : "size-16",
                !forceMobileLayout && "min-[480px]:size-24 sm:size-28",
              )}
            >
              {avatarUrl ? (
                <Image src={avatarUrl} alt="" fill className="object-cover" sizes="112px" unoptimized />
              ) : (
                <div
                  className={cn(
                    "flex size-full items-center justify-center text-xl font-bold text-[var(--joballa-muted)]",
                    !forceMobileLayout && "min-[480px]:text-2xl",
                  )}
                >
                  {profileInitials(name || profile.professionalTitle || "?")}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h2
                className={cn(
                  compact
                    ? "text-sm font-bold leading-5 tracking-tight text-[var(--joballa-fg)]"
                    : "text-base font-bold leading-6 tracking-tight text-[var(--joballa-fg)]",
                  !forceMobileLayout && "min-[480px]:text-xl sm:text-2xl",
                )}
              >
                {name}
              </h2>
              {profileHeadline(profile) ? (
                <p
                  className={cn(
                    compact
                      ? "mt-1 text-[11px] font-medium leading-4 text-[var(--joballa-fg-subtle)]"
                      : "mt-1 text-xs font-medium leading-5 text-[var(--joballa-fg-subtle)]",
                    !compact && !forceMobileLayout && "min-[480px]:text-sm",
                  )}
                >
                  {profileHeadline(profile)}
                </p>
              ) : null}
              <div className={cn("mt-2 flex flex-wrap items-center justify-start gap-1.5", !forceMobileLayout && "sm:gap-2")}>
                {verified ? (
                  <span className="group relative inline-flex">
                    <IconVerified
                      className={cn(
                        compact ? "size-3.5 shrink-0 text-[var(--joballa-primary)]" : "size-4 shrink-0 text-[var(--joballa-primary)]",
                        !compact && !forceMobileLayout && "min-[480px]:size-5",
                      )}
                      aria-label={tProfile("preview.verified")}
                    />
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
                {available ? (
                  <span
                    className={cn(
                      "inline-flex items-center justify-center rounded-full bg-[var(--joballa-jade-3)] px-2 font-semibold leading-none text-[var(--joballa-primary)]",
                      compact ? "min-h-5 text-[10px]" : "min-h-6 text-[11px] px-2.5",
                    )}
                  >
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
          <div
            className={cn(
              "shrink-0 space-y-1.5 text-[var(--joballa-fg-subtle)]",
              contactTextClass,
              !forceMobileLayout && "sm:min-w-56 sm:text-right",
            )}
          >
            {profileLocationLine(profile) ? (
              <p className={cn("flex items-center gap-2", !forceMobileLayout && "sm:justify-end")}>
                <IconPin className={cn("shrink-0", contactIconClass)} />
                {profileLocationLine(profile)}
              </p>
            ) : null}
            {contactPhone ? (
              <p className={cn("flex items-center gap-2", !forceMobileLayout && "sm:justify-end")}>
                <IconPhone className={cn("shrink-0", contactIconClass)} />
                {contactPhone}
              </p>
            ) : null}
            {profileLanguagesLine(profile) ? (
              <p className={cn("flex items-center gap-2", !forceMobileLayout && "sm:justify-end")}>
                <IconGlobe className={cn("shrink-0", contactIconClass)} />
                {profileLanguagesLine(profile)}
              </p>
            ) : null}
          </div>
        </div>

        <section className={sectionGridClass()}>
          <p className={sectionLabelClass}>{tProfile("preview.summaryLabel")}</p>
          <div className={bodyBlockClass}>
            {profile.summary?.trim() ? (
              <p className="text-[var(--joballa-fg-subtle)]">{profile.summary}</p>
            ) : !profileHeadline(profile) ? (
              <p className="text-[var(--joballa-fg-subtle)]">{tProfile("preview.emptySummary")}</p>
            ) : null}
            {profileIndustriesLine(profile) || profileEmploymentTypes(profile) ? (
              <p className="text-[var(--joballa-fg-subtle)]">
                {[profileIndustriesLine(profile), profileEmploymentTypes(profile)].filter(Boolean).join(" · ")}
              </p>
            ) : null}
          </div>
        </section>

        <section className={sectionGridClass()}>
          <p className={sectionLabelClass}>{tProfile("preview.skillsLabel")}</p>
          {profileSkillsLine(profile) ? (
            <p className={skillsTextClass}>{profileSkillsLine(profile)}</p>
          ) : (
            <p className={cn(entryBodyClass, "text-[var(--joballa-fg-subtle)]")}>{tProfile("preview.emptySkills")}</p>
          )}
        </section>

        <section className={sectionGridClass("4")}>
          <p className={sectionLabelClass}>{tProfile("preview.workLabel")}</p>
          <div className={cn(compact ? "space-y-5" : "space-y-8", "text-[var(--joballa-fg)]")}>
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
                    <p className={entryTitleClass}>{entry.jobTitle}</p>
                  ) : null}
                  {entry.companyName?.trim() ? <p className={cn("mt-1", entryBodyClass)}>{entry.companyName}</p> : null}
                  {entry.description ? (
                    <p className={cn("mt-1.5 max-w-4xl text-[var(--joballa-fg-subtle)]", entryBodyClass)}>{entry.description}</p>
                  ) : null}
                  <p className={cn("mt-1.5 text-[var(--joballa-fg-subtle)]", entryBodyClass)}>{formatWorkHistoryMeta(entry)}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className={sectionGridClass("4")}>
          <p className={sectionLabelClass}>{tProfile("preview.educationLabel")}</p>
          <div className={cn(compact ? "space-y-4" : "space-y-6", "text-[var(--joballa-fg)]")}>
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
                    <p className={entryTitleClass}>{entry.degree}</p>
                  ) : null}
                  {entry.institution?.trim() ? (
                    <p className={cn("mt-1", entryBodyClass)}>{entry.institution}</p>
                  ) : null}
                  {entry.fieldOfStudy?.trim() ? (
                    <p className={cn("mt-1 text-[var(--joballa-fg-subtle)]", entryBodyClass)}>{entry.fieldOfStudy}</p>
                  ) : null}
                  {formatEducationMeta(entry) ? (
                    <p className={cn("mt-1.5 text-[var(--joballa-fg-subtle)]", entryBodyClass)}>{formatEducationMeta(entry)}</p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </section>

        <section className={sectionGridClass("4")}>
          <p className={sectionLabelClass}>{tProfile("preview.certificationsLabel")}</p>
          <div className={cn(compact ? "space-y-4" : "space-y-6", "text-[var(--joballa-fg)]")}>
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
                        className={cn(entryTitleClass, "underline-offset-2 hover:underline")}
                      >
                        {entry.name}
                      </a>
                    ) : (
                      <p className={entryTitleClass}>{entry.name}</p>
                    )
                  ) : null}
                  {formatCertificationMeta(entry) ? (
                    <p className={cn("mt-1.5 text-[var(--joballa-fg-subtle)]", entryBodyClass)}>{formatCertificationMeta(entry)}</p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </section>

        <section className={sectionGridClass("4", true)}>
          <p className={sectionLabelClass}>{tProfile("preview.documentsLabel")}</p>
          <div className={cn("min-w-0", compact ? "space-y-2" : "space-y-3")}>
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
                    className={cn(
                      "flex shrink-0 flex-col overflow-hidden rounded-[8px] bg-[#e5e5e5]",
                      compact ? "size-10" : "size-12",
                    )}
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
                        <span className={cn("min-w-0 truncate font-bold text-[var(--joballa-primary)]", compact ? "text-xs" : "text-sm")}>
                          {label}
                        </span>
                      </a>
                    ) : (
                      <>
                        {fileIcon}
                        <p className={cn("min-w-0 truncate font-bold text-[var(--joballa-fg)]", compact ? "text-xs" : "text-sm")}>
                          {label}
                        </p>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {paymentMethods.length > 0 ? (
          <section className={cn(sectionGridClass("4", true), "border-b-0")}>
            <div>
              <p className={sectionLabelClass}>{tProfile("preview.paymentLabel")}</p>
              <p className={cn("mt-1 italic text-[var(--joballa-muted)]", compact ? "text-[10px]" : "text-xs")}>
                {tProfile("preview.paymentPrivate")}
              </p>
            </div>
            <div className={cn("flex flex-wrap", compact ? "gap-4" : "gap-6")}>
              {paymentMethods.map((method) => {
                const phone = method.phoneNumber ?? method.phone;
                const provider = String(method.provider ?? "").includes("ORANGE") ? "Orange Money" : "MTN MoMo";
                return (
                  <div key={method.id}>
                    <p className={cn("font-semibold text-[var(--joballa-fg)]", compact ? "text-xs" : "text-sm")}>{phone}</p>
                    <p className={cn("text-[var(--joballa-muted)]", compact ? "text-[10px]" : "text-xs")}>
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
