"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { EmployerAsyncState } from "@/components/employer/employer-async-state";
import { EmployerApplicantStatusBadge } from "@/components/employer/employer-applicant-status-badge";
import {
  useEmployerApplicant,
  usePatchEmployerApplicantNotes,
  usePatchEmployerApplicantStatus,
} from "@/features/employer/hooks";
import {
  parseApplicantDetailProfile,
  type ParsedApplicantProfile,
} from "@/features/employer/lib/applicant-profile";
import { toast } from "@/lib/toast";
import { employerJobDurationLabel, employerJobStartDateLabel } from "@/features/employer/lib/employer-job-fields";
import {
  EmployerJobRequiredSkillsBlock,
  employerJobRequiredSkillsList,
} from "@/components/employer/employer-job-required-skills";
import type { EmployerApplicantStatus, EmployerJobDetail } from "@/features/employer/types/employer-portal";
import { useEmployerMe } from "@/features/employer/hooks/use-employer-me";
import { IconClose, IconExpand, IconMoreHorizontal, IconVerified } from "@/components/worker/icons";
import { SimpleDialog } from "@/components/worker/dashboard/simple-dialog";
import {
  portalAvatarPlaceholderClass,
  portalCardClass,
  portalDetailSectionClass,
  portalIconButtonMutedClass,
  portalSectionLabelClass,
} from "@/components/portal/portal-ui";
import { cn } from "@/lib/utils";
import { buttonClassName } from "@/components/ui/button";

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn(portalSectionLabelClass, className)}>{children}</h3>;
}

function DocumentFileRow({
  doc,
  allowDownload = true,
}: {
  doc: ParsedApplicantProfile["documents"][number];
  allowDownload?: boolean;
}) {
  const t = useTranslations("employer.applicantDetail");
  const [downloading, setDownloading] = useState(false);
  const typeLabel = doc.type.toUpperCase().slice(0, 3);
  const isPdf = typeLabel === "PDF";

  const content = (
    <>
      <span
        className={cn(
          "flex h-[52px] w-[52px] shrink-0 items-end justify-end overflow-hidden rounded-sm rounded-tr-lg bg-[var(--joballa-tag-bg)] pl-2",
        )}
      >
        <span className={cn("px-1 py-0.5 text-xs font-bold text-white", isPdf ? "bg-[#cf3897]" : "bg-[#9e6c00]")}>
          {typeLabel}
        </span>
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[var(--joballa-fg)]">{doc.name}</p>
        {doc.size ? <p className="text-xs text-[var(--joballa-muted)]">{doc.size}</p> : null}
      </div>
    </>
  );

  async function handleDownload() {
    const path = doc.downloadUrl ?? doc.url;
    if (!path) return;
    if (doc.downloadUrl) {
      setDownloading(true);
      try {
        const { downloadAuthenticatedFile } = await import("@/lib/http/download-authenticated-file");
        await downloadAuthenticatedFile(doc.downloadUrl, doc.name);
      } catch {
        toast.error(t("profile.downloadFailed"));
      } finally {
        setDownloading(false);
      }
      return;
    }
    window.open(path, "_blank", "noopener,noreferrer");
  }

  if (allowDownload && (doc.downloadUrl || doc.url)) {
    return (
      <li>
        <button
          type="button"
          disabled={downloading}
          onClick={() => void handleDownload()}
          className="flex w-full items-center gap-3 text-left transition hover:opacity-80 disabled:opacity-60"
        >
          {content}
        </button>
      </li>
    );
  }

  return <li className="flex items-center gap-3">{content}</li>;
}

function ProfileSectionRow({
  label,
  children,
  bordered = true,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  bordered?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-16",
        bordered && "border-b border-[var(--joballa-border)] pb-8",
      )}
    >
      <div className="w-full shrink-0 sm:w-[160px]">{label}</div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function WorkHistoryMeta({ period, location }: { period: string; location: string }) {
  let displayPeriod = period;
  let displayLocation = location;

  if (period.includes(" • ") && !location) {
    const [parsedPeriod, ...rest] = period.split(" • ");
    displayPeriod = parsedPeriod ?? period;
    displayLocation = rest.join(" • ");
  }

  if (!displayPeriod && !displayLocation) return null;

  return (
    <div className="flex items-start text-xs text-[var(--joballa-muted)]">
      {displayPeriod ? <span className="whitespace-nowrap">{displayPeriod}</span> : null}
      {displayPeriod && displayLocation ? (
        <span aria-hidden className="mx-0.5 inline-flex size-4 shrink-0 items-center justify-center">
          ·
        </span>
      ) : null}
      {displayLocation ? <span>{displayLocation}</span> : null}
    </div>
  );
}

function ProfileEmptyText({ children }: { children: React.ReactNode }) {
  return <p className="text-sm italic leading-5 text-[var(--joballa-muted)]">{children}</p>;
}

function ApplicantProfilePageCard({
  profile,
  coverNote,
  t,
  allowDocumentDownload = true,
}: {
  profile: ParsedApplicantProfile;
  coverNote?: string | null;
  t: ReturnType<typeof useTranslations>;
  allowDocumentDownload?: boolean;
}) {
  const speaksLine = profile.languages
    ? profile.languages.startsWith("Speaks")
      ? profile.languages
      : `Speaks ${profile.languages}`
    : null;
  const note = coverNote?.trim() ?? "";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-[var(--joballa-border)] pb-8">
        <div className="flex min-w-0 items-center gap-6">
          {profile.avatarUrl ? (
            <span className="relative flex size-24 shrink-0 overflow-hidden rounded-full">
              <Image src={profile.avatarUrl} alt="" fill className="object-cover" sizes="96px" unoptimized />
            </span>
          ) : (
            <span className={cn(portalAvatarPlaceholderClass, "size-24 text-3xl")}>
              {profile.fullName.charAt(0)}
            </span>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1">
              <h2 className="text-2xl font-bold leading-8 text-[var(--joballa-fg)]">{profile.fullName}</h2>
              {profile.verified ? <IconVerified className="size-6 text-[var(--joballa-primary)]" /> : null}
            </div>
            <p className="text-xs leading-4 text-[var(--joballa-muted)]">
              {profile.headline || t("profile.notProvided")}
            </p>
          </div>
        </div>
        <dl className="w-[180px] shrink-0 space-y-0.5 text-right text-sm leading-5 text-[var(--joballa-muted)]">
          <dd>{profile.location || t("profile.notProvided")}</dd>
          <dd>{profile.phone || t("profile.notProvided")}</dd>
          <dd>{speaksLine || t("profile.notProvided")}</dd>
        </dl>
      </div>

      <ProfileSectionRow label={<SectionLabel>{t("profile.summaryTitle")}</SectionLabel>}>
        {profile.summary || profile.industries || profile.availability ? (
          <div className="flex flex-col gap-1 text-sm leading-5">
            {profile.summary ? (
              <p className="text-[var(--joballa-fg)]">{profile.summary}</p>
            ) : (
              <ProfileEmptyText>{t("profile.emptySummary")}</ProfileEmptyText>
            )}
            {profile.industries ? <p className="text-[var(--joballa-muted)]">{profile.industries}</p> : null}
            {profile.availability ? <p className="text-[var(--joballa-muted)]">{profile.availability}</p> : null}
          </div>
        ) : (
          <ProfileEmptyText>{t("profile.emptySummary")}</ProfileEmptyText>
        )}
      </ProfileSectionRow>

      <ProfileSectionRow label={<SectionLabel>{t("profile.skillsTitle")}</SectionLabel>}>
        {profile.skills.length > 0 ? (
          <p className="text-sm leading-5">
            {profile.skills.map((skill, index) => {
              const bold = profile.highlightedSkills.some((h) => h.toLowerCase() === skill.toLowerCase());
              return (
                <span key={skill}>
                  <span className={bold ? "font-semibold text-[var(--joballa-fg)]" : "text-[var(--joballa-muted)]"}>{skill}</span>
                  {index < profile.skills.length - 1 ? ", " : ""}
                </span>
              );
            })}
          </p>
        ) : (
          <ProfileEmptyText>{t("profile.emptySkills")}</ProfileEmptyText>
        )}
      </ProfileSectionRow>

      <ProfileSectionRow label={<SectionLabel>{t("profile.workTitle")}</SectionLabel>}>
        {profile.workHistory.length > 0 ? (
          <ul className="flex flex-col gap-8">
            {profile.workHistory.map((item, index) => (
              <li key={`${item.company}-${index}`} className="flex flex-col gap-1">
                <p className="text-sm font-bold leading-5 text-[var(--joballa-fg)]">{item.company}</p>
                <p className="text-sm leading-5 text-[var(--joballa-fg)]">{item.role}</p>
                {item.description ? (
                  <p className="text-xs leading-4 text-[var(--joballa-fg)]">{item.description}</p>
                ) : null}
                <WorkHistoryMeta period={item.period} location={item.location} />
              </li>
            ))}
          </ul>
        ) : (
          <ProfileEmptyText>{t("profile.emptyWorkHistory")}</ProfileEmptyText>
        )}
      </ProfileSectionRow>

      <ProfileSectionRow label={<SectionLabel>{t("profile.educationTitle")}</SectionLabel>}>
        {profile.education.length > 0 ? (
          <ul className="flex flex-col gap-8">
            {profile.education.map((item, index) => (
              <li key={`${item.institution}-${index}`} className="flex flex-col gap-1">
                <p className="text-sm font-bold leading-5 text-[var(--joballa-fg)]">{item.institution}</p>
                <p className="text-sm leading-5 text-[var(--joballa-fg)]">
                  {[item.degree, item.field].filter(Boolean).join(" · ")}
                </p>
                {item.description ? (
                  <p className="text-xs leading-4 text-[var(--joballa-fg)]">{item.description}</p>
                ) : null}
                {item.period ? <p className="text-xs text-[var(--joballa-muted)]">{item.period}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <ProfileEmptyText>{t("profile.emptyEducation")}</ProfileEmptyText>
        )}
      </ProfileSectionRow>

      <ProfileSectionRow label={<SectionLabel>{t("profile.certificationsTitle")}</SectionLabel>}>
        {profile.certifications.length > 0 ? (
          <ul className="flex flex-col gap-6">
            {profile.certifications.map((item, index) => (
              <li key={`${item.name}-${index}`} className="flex flex-col gap-1">
                <p className="text-sm font-bold leading-5 text-[var(--joballa-fg)]">{item.name}</p>
                {item.issuer ? (
                  <p className="text-sm leading-5 text-[var(--joballa-fg)]">{item.issuer}</p>
                ) : null}
                {item.issueDate || item.expiryDate ? (
                  <p className="text-xs text-[var(--joballa-muted)]">
                    {[item.issueDate, item.expiryDate].filter(Boolean).join(" – ")}
                  </p>
                ) : null}
                {item.credentialUrl ? (
                  <a
                    href={item.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[var(--joballa-primary)]"
                  >
                    {item.credentialUrl}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <ProfileEmptyText>{t("profile.emptyCertifications")}</ProfileEmptyText>
        )}
      </ProfileSectionRow>

      <ProfileSectionRow label={<SectionLabel>{t("profile.documentsTitle")}</SectionLabel>}>
        {profile.documents.length > 0 ? (
          <ul className="flex flex-col gap-8">
            {profile.documents.map((doc) => (
              <DocumentFileRow
                key={`${doc.url ?? ""}:${doc.name}`}
                doc={doc}
                allowDownload={allowDocumentDownload}
              />
            ))}
          </ul>
        ) : (
          <ProfileEmptyText>{t("profile.emptyDocuments")}</ProfileEmptyText>
        )}
      </ProfileSectionRow>

      <ProfileSectionRow label={<SectionLabel>{t("profile.coverNoteTitle")}</SectionLabel>} bordered={false}>
        {note ? (
          <p className="text-sm leading-6 text-[var(--joballa-fg)]">{note}</p>
        ) : (
          <ProfileEmptyText>{t("profile.emptyCoverNote")}</ProfileEmptyText>
        )}
      </ProfileSectionRow>
    </div>
  );
}

export function ProfileSections({
  profile,
  t,
  variant = "panel",
  coverNote,
  allowDocumentDownload = true,
}: {
  profile: ParsedApplicantProfile;
  t: ReturnType<typeof useTranslations>;
  variant?: "panel" | "page";
  coverNote?: string | null;
  allowDocumentDownload?: boolean;
}) {
  if (variant === "page") {
    return (
      <ApplicantProfilePageCard
        profile={profile}
        coverNote={coverNote}
        t={t}
        allowDocumentDownload={allowDocumentDownload}
      />
    );
  }

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

      {profile.education.length > 0 ? (
        <div className="grid gap-4 border-b border-[var(--joballa-border)] py-5 lg:grid-cols-[9rem_minmax(0,1fr)] lg:gap-6">
          <SectionLabel>{t("profile.educationTitle")}</SectionLabel>
          <ul className="space-y-5">
            {profile.education.map((item, index) => (
              <li key={`${item.institution}-${index}`}>
                <p className="text-sm font-bold text-[var(--joballa-fg)]">{item.institution}</p>
                <p className="text-sm text-[var(--joballa-muted)]">
                  {[item.degree, item.field].filter(Boolean).join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {profile.certifications.length > 0 ? (
        <div className="grid gap-4 border-b border-[var(--joballa-border)] py-5 lg:grid-cols-[9rem_minmax(0,1fr)] lg:gap-6">
          <SectionLabel>{t("profile.certificationsTitle")}</SectionLabel>
          <ul className="space-y-4">
            {profile.certifications.map((item, index) => (
              <li key={`${item.name}-${index}`}>
                <p className="text-sm font-bold text-[var(--joballa-fg)]">{item.name}</p>
                {item.issuer ? <p className="text-sm text-[var(--joballa-muted)]">{item.issuer}</p> : null}
                {item.credentialUrl ? (
                  <a
                    href={item.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block text-xs font-semibold text-[var(--joballa-primary)] break-all"
                  >
                    {item.credentialUrl}
                  </a>
                ) : null}
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

export function MetaRow({ label, value }: { label: string; value: string }) {
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

function ApplicantNotesSection({
  applicationId,
  initialNotes,
}: {
  applicationId: string;
  initialNotes?: string | null;
}) {
  const tn = useTranslations("employer.applicantDetail.notes");
  const [notes, setNotes] = useState(initialNotes ?? "");
  const saveNotes = usePatchEmployerApplicantNotes(applicationId);

  return (
    <section className={cn(portalDetailSectionClass, "mt-4 p-4")}>
      <h3 className="text-sm font-bold text-[var(--joballa-fg)]">{tn("title")}</h3>
      <p className="mt-1 text-xs text-[var(--joballa-muted)]">{tn("hint")}</p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        className="mt-3 w-full rounded-[12px] border border-[var(--joballa-border)] bg-[var(--joballa-input-bg)] px-3 py-2 text-sm text-[var(--joballa-fg)] outline-none focus:border-[var(--joballa-primary)] focus:ring-2 focus:ring-[var(--joballa-primary)]"
        placeholder={tn("placeholder")}
      />
      <button
        type="button"
        disabled={saveNotes.isPending}
        onClick={() => saveNotes.mutate(notes.trim())}
        className={cn(buttonClassName("primary"), "mt-3 text-xs")}
      >
        {saveNotes.isPending ? tn("saving") : tn("save")}
      </button>
    </section>
  );
}

function RejectApplicantDialog({
  open,
  onOpenChange,
  onConfirm,
  busy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (note: string) => void;
  busy?: boolean;
}) {
  const tr = useTranslations("employer.applicantDetail.rejectDialog");
  const tc = useTranslations("common.confirm");
  const [note, setNote] = useState("");

  const handleOpenChange = (next: boolean) => {
    if (!next) setNote("");
    onOpenChange(next);
  };

  return (
    <SimpleDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={tr("title")}
      description={tr("description")}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={busy}
            onClick={() => handleOpenChange(false)}
            className="rounded-[10px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] px-4 py-2.5 text-sm font-medium text-[var(--joballa-fg)] hover:bg-[var(--joballa-row-hover)] disabled:opacity-50"
          >
            {tc("cancel")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onConfirm(note.trim())}
            className="rounded-[10px] bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {busy ? "…" : tr("confirm")}
          </button>
        </div>
      }
    >
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[var(--joballa-fg)]">{tr("noteLabel")}</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          className="w-full rounded-[12px] border border-[var(--joballa-border)] bg-[var(--joballa-input-bg)] px-3 py-2 text-sm text-[var(--joballa-fg)] outline-none focus:border-[var(--joballa-primary)] focus:ring-2 focus:ring-[var(--joballa-primary)]"
          placeholder={tr("notePlaceholder")}
        />
      </label>
    </SimpleDialog>
  );
}

function ApplicantPanelChromeButton({
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

function ApplicantPanelActionsMenu({
  open,
  onOpenChange,
  status,
  statusLabels,
  patchStatus,
  ta,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: EmployerApplicantStatus;
  statusLabels: Record<string, string>;
  patchStatus: ReturnType<typeof usePatchEmployerApplicantStatus>;
  ta: ReturnType<typeof useTranslations>;
}) {
  const [rejectOpen, setRejectOpen] = useState(false);

  const runAction = (next: "shortlisted" | "rejected" | "hired") => {
    onOpenChange(false);
    if (next === "rejected") {
      setRejectOpen(true);
      return;
    }
    patchStatus.mutate({ status: next });
  };

  return (
    <>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default bg-transparent"
            aria-hidden
            onClick={() => onOpenChange(false)}
          />
          <div className="absolute right-0 z-20 mt-1 min-w-[168px] overflow-hidden rounded-xl border border-[var(--joballa-border)] bg-[var(--joballa-dropdown-bg)] py-1 text-sm shadow-[var(--joballa-shadow-elevated)]">
            <p className="border-b border-[var(--joballa-border)] px-3 py-2 text-xs font-medium text-[var(--joballa-muted)]">
              {statusLabels[status] ?? status}
            </p>
            {(["shortlisted", "rejected", "hired"] as const).map((next) => (
              <button
                key={next}
                type="button"
                disabled={patchStatus.isPending || status === next}
                onClick={() => runAction(next)}
                className={cn(
                  "block w-full px-3 py-2 text-left capitalize text-[var(--joballa-fg)] hover:bg-[var(--joballa-row-hover)] disabled:cursor-not-allowed disabled:opacity-50",
                  next === "rejected" && "text-[var(--joballa-danger-fg)] hover:bg-[var(--joballa-danger-bg)]",
                )}
              >
                {ta(`actions.${next}`)}
              </button>
            ))}
          </div>
        </>
      ) : null}
      <RejectApplicantDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        busy={patchStatus.isPending}
        onConfirm={(rejectNote) =>
          patchStatus.mutate(
            { status: "rejected", note: rejectNote || undefined },
            { onSuccess: () => setRejectOpen(false) },
          )
        }
      />
    </>
  );
}

export function ApplicantStatusActions({
  status,
  statusLabels,
  patchStatus,
  ta,
}: {
  status: EmployerApplicantStatus;
  statusLabels: Record<string, string>;
  patchStatus: {
    isPending: boolean;
    mutate: (
      body: { status: "shortlisted" | "rejected" | "hired"; note?: string },
      options?: { onSuccess?: () => void },
    ) => void;
  };
  ta: ReturnType<typeof useTranslations>;
}) {
  const [rejectOpen, setRejectOpen] = useState(false);

  const handleStatusClick = (next: "shortlisted" | "rejected" | "hired") => {
    if (next === "rejected") {
      setRejectOpen(true);
      return;
    }
    patchStatus.mutate({ status: next });
  };

  return (
    <>
      <EmployerApplicantStatusBadge status={status} label={statusLabels[status] ?? status} />
      {(["shortlisted", "rejected", "hired"] as const).map((next) => (
        <button
          key={next}
          type="button"
          disabled={patchStatus.isPending || status === next}
          onClick={() => handleStatusClick(next)}
          className={cn(buttonClassName(status === next ? "primary" : "outline"), "text-xs capitalize")}
        >
          {ta(`actions.${next}`)}
        </button>
      ))}
      <RejectApplicantDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        busy={patchStatus.isPending}
        onConfirm={(rejectNote) =>
          patchStatus.mutate(
            { status: "rejected", note: rejectNote || undefined },
            { onSuccess: () => setRejectOpen(false) },
          )
        }
      />
    </>
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
  coverNote,
  companyLogo,
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
  coverNote?: string | null;
  companyLogo?: string | null;
}) {
  const [jobExpanded, setJobExpanded] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const companyName = String(job?.company ?? "—");
  const startDate = job ? employerJobStartDateLabel(job) : "—";
  const duration = job ? employerJobDurationLabel(job) : "—";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-[26px] border border-[var(--joballa-border)] bg-[var(--joballa-page-tint)] p-4">
      <section className={cn(portalDetailSectionClass, "shrink-0 !p-[14px] shadow-[var(--joballa-shadow-card)]")}>
        <div className="flex items-start justify-between gap-2.5 pb-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold leading-7 text-[var(--joballa-fg)]">{job?.title ?? "—"}</h2>
            <div className="mt-1 flex items-center gap-2">
              {companyLogo ? (
                <span className="relative flex size-6 shrink-0 overflow-hidden rounded-full">
                  <Image src={companyLogo} alt="" fill className="object-cover" sizes="24px" unoptimized />
                </span>
              ) : (
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--joballa-fg)] text-[8px] font-bold text-[var(--joballa-on-primary)]">
                  {companyName.charAt(0)}
                </span>
              )}
              <p className="truncate text-xs font-semibold text-[var(--joballa-muted)]">{companyName}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            <Link
              href={`/employer/applicants/${applicationId}`}
              aria-label={t("openFull")}
              className="inline-flex h-8 shrink-0 items-center justify-center rounded-xl bg-[var(--joballa-secondary)] px-3 text-[var(--joballa-muted)] transition hover:text-[var(--joballa-fg)]"
            >
              <IconExpand className="size-4" />
            </Link>
            <div className="relative">
              <ApplicantPanelChromeButton
                aria-label={t("more")}
                aria-expanded={actionsOpen}
                className="px-2"
                onClick={() => setActionsOpen((open) => !open)}
              >
                <IconMoreHorizontal className="size-6" />
              </ApplicantPanelChromeButton>
              <ApplicantPanelActionsMenu
                open={actionsOpen}
                onOpenChange={setActionsOpen}
                status={status}
                statusLabels={statusLabels}
                patchStatus={patchStatus}
                ta={ta}
              />
            </div>
            {onClose ? (
              <ApplicantPanelChromeButton aria-label={t("closePanel")} onClick={onClose}>
                <IconClose className="size-4" />
              </ApplicantPanelChromeButton>
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
            <MetaRow label={t("summary.jobType")} value={String(job.jobType ?? job.employmentType ?? "—")} />
            <MetaRow label={t("summary.location")} value={jobLocationLine(job)} />
            <MetaRow label={t("summary.startDate")} value={startDate} />
            <MetaRow label={t("summary.duration")} value={duration} />
            <MetaRow label={t("summary.applications")} value={String(job.applicantsCount ?? "—")} />
            {employerJobRequiredSkillsList(job).length > 0 ? (
              <MetaRow
                label={t("jobInfo.requiredSkillsTitle")}
                value={employerJobRequiredSkillsList(job).join(", ")}
              />
            ) : null}
          </dl>
        ) : null}
      </section>

      <section className={cn(portalDetailSectionClass, "min-h-0 flex-1 overflow-y-auto p-6")}>
        <ProfileSections profile={profile} t={t} variant="page" coverNote={coverNote} />
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
  const employerMe = useEmployerMe();
  const patchStatus = usePatchEmployerApplicantStatus(applicationId);

  const status = String(applicant.data?.status ?? "pending") as EmployerApplicantStatus;
  const profile = parseApplicantDetailProfile(applicant.data);
  const employerNotes = typeof applicant.data?.employerNotes === "string" ? applicant.data.employerNotes : null;
  const coverNote =
    typeof applicant.data?.coverNote === "string"
      ? applicant.data.coverNote
      : typeof (applicant.data as { jobSpecificNote?: string | null })?.jobSpecificNote === "string"
        ? (applicant.data as { jobSpecificNote?: string | null }).jobSpecificNote
        : null;
  const job = applicant.data?.job as EmployerJobDetail | undefined;
  const requirements = Array.isArray(job?.requirements) ? job.requirements : [];
  const responsibilities = Array.isArray(job?.responsibilities) ? job.responsibilities : [];
  const requiredSkills = employerJobRequiredSkillsList(job);
  const companyName = String(job?.company ?? employerMe.data?.company?.name ?? "—");
  const companyLogo =
    (job as { logoUrl?: string | null; companyLogo?: string | null })?.logoUrl ??
    (job as { companyLogo?: string | null })?.companyLogo ??
    employerMe.data?.company?.logo ??
    null;
  const listedForName = [employerMe.data?.firstName, employerMe.data?.lastName].filter(Boolean).join(" ").trim();
  const startDate = job ? employerJobStartDateLabel(job) : "—";
  const duration = job ? employerJobDurationLabel(job) : "—";

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
            coverNote={coverNote}
            companyLogo={companyLogo}
          />
        ) : (
          <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-[26px]">
            <Link
              href="/employer/applicants"
              className="inline-flex h-8 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-[var(--joballa-muted)] transition hover:text-[var(--joballa-fg)]"
            >
              <span aria-hidden>‹</span> {t("back")}
            </Link>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <ApplicantStatusActions
                status={status}
                statusLabels={statusLabels}
                patchStatus={patchStatus}
                ta={ta}
              />
            </div>

            <div className="grid gap-[26px] xl:grid-cols-[minmax(380px,420px)_minmax(720px,1fr)] xl:items-start">
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

                {job?.description || requiredSkills.length > 0 || requirements.length > 0 || responsibilities.length > 0 ? (
                  <section className={cn(portalCardClass(), "flex flex-col gap-6 p-6")}>
                    {job?.description ? (
                      <div>
                        <h4 className="text-sm font-bold text-[var(--joballa-fg)]">{t("jobInfo.aboutTitle")}</h4>
                        <p className="mt-2 text-sm leading-6 text-[var(--joballa-muted)]">{job.description}</p>
                      </div>
                    ) : null}
                    <EmployerJobRequiredSkillsBlock
                      skills={requiredSkills}
                      title={t("jobInfo.requiredSkillsTitle")}
                    />
                    {requirements.length > 0 ? (
                      <div>
                        <h4 className="text-sm font-bold text-[var(--joballa-fg)]">{t("jobInfo.requirementsTitle")}</h4>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--joballa-muted)]">
                          {requirements.map((item, index) => (
                            <li key={`req-${index}`}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {responsibilities.length > 0 ? (
                      <div>
                        <h4 className="text-sm font-bold text-[var(--joballa-fg)]">{t("jobInfo.doTitle")}</h4>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--joballa-muted)]">
                          {responsibilities.map((item, index) => (
                            <li key={`resp-${index}`}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    <div className="border-t border-[var(--joballa-border)] pt-4">
                      <p className="text-center text-xs text-[var(--joballa-muted)]">{t("jobInfo.listedBy", { company: companyName })}</p>
                      {listedForName ? (
                        <p className="text-center text-xs text-[var(--joballa-muted)]">{t("jobInfo.listedFor", { name: listedForName })}</p>
                      ) : null}
                    </div>
                  </section>
                ) : null}
              </div>

              <section className={cn(portalDetailSectionClass, "flex flex-col gap-8 p-6 xl:p-8")}>
                <div>
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[var(--joballa-muted)]">
                    {t("profile.applicationProfileTitle")}
                  </h3>
                  <ProfileSections profile={profile} t={t} variant="page" coverNote={coverNote} />
                </div>
              </section>
            </div>

            <ApplicantNotesSection key={applicationId} applicationId={applicationId} initialNotes={employerNotes} />
          </div>
        )
      ) : null}
    </EmployerAsyncState>
  );
}
