"use client";

import Image from "next/image";
import type { EmployerApplicantListItem } from "@/features/employer/types/employer-portal";
import {
  applicantId,
  applicantName,
  applicantRole,
} from "@/features/employer/lib/applicant-helpers";
import {
  applicantHeadline,
  applicantIsVerified,
  applicantMatchText,
  applicantSkillsList,
} from "@/features/employer/lib/applicant-profile";
import { Link } from "@/lib/i18n/navigation";
import { IconMoreHorizontal, IconVerified } from "@/components/worker/icons";
import { cn } from "@/lib/utils";

type BaseProps = {
  applicant: EmployerApplicantListItem;
  appliedLabel: string;
  moreAriaLabel: string;
};

type LinkProps = BaseProps & {
  href: string;
  onSelect?: never;
  isActive?: never;
};

type SelectProps = BaseProps & {
  href?: never;
  onSelect: () => void;
  isActive?: boolean;
};

type Props = LinkProps | SelectProps;

function applicantAvatarUrl(applicant: EmployerApplicantListItem): string | null {
  const profile = applicant.submittedProfile as Record<string, unknown> | undefined;
  const candidates = [
    applicant.photoUrl,
    applicant.avatarUrl,
    applicant.applicantAvatarUrl,
    profile?.photoUrl,
    profile?.avatarUrl,
    profile?.profilePhotoUrl,
    profile?.photo,
    profile?.avatar,
  ];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function ApplicantAvatar({ applicant }: { applicant: EmployerApplicantListItem }) {
  const name = applicantName(applicant);
  const avatarUrl = applicantAvatarUrl(applicant);

  if (avatarUrl) {
    return (
      <span className="relative flex size-12 shrink-0 overflow-hidden rounded-full">
        <Image src={avatarUrl} alt="" fill className="object-cover" sizes="48px" unoptimized />
      </span>
    );
  }

  return (
    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--joballa-primary)] text-base font-bold text-[var(--joballa-on-primary)]">
      {name.charAt(0)}
    </span>
  );
}

function ApplicantCardContent({ applicant, appliedLabel, moreAriaLabel }: BaseProps) {
  const match = applicantMatchText(applicant);
  const skills = applicantSkillsList(applicant).slice(0, 3);
  const location = String(applicant.location ?? "—");
  const verified = applicantIsVerified(applicant);
  const headline = applicantHeadline(applicant);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-[var(--joballa-muted)]">{appliedLabel}</p>
        <div className="flex items-center gap-3.5">
          {match ? (
            <span className="rounded-full bg-[var(--joballa-highlight-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--joballa-match-accent)]">
              {match}
            </span>
          ) : null}
          <span
            role="presentation"
            aria-hidden
            className="inline-flex size-6 shrink-0 items-center justify-center text-[var(--joballa-muted)]"
            title={moreAriaLabel}
          >
            <IconMoreHorizontal className="size-6" />
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ApplicantAvatar applicant={applicant} />
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <span className="truncate text-xl font-semibold leading-7 text-[var(--joballa-fg)]">
              {applicantName(applicant)}
            </span>
            {verified ? <IconVerified className="size-6 shrink-0 text-[var(--joballa-primary)]" /> : null}
          </div>
          <p className="truncate text-xs text-[var(--joballa-muted)]">{headline}</p>
        </div>
      </div>

      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2.5">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex rounded-full border border-[var(--joballa-pill-border)] bg-[var(--joballa-pill-bg)] px-2 py-1.5 text-xs font-semibold text-[var(--joballa-muted)]"
            >
              {skill}
            </span>
          ))}
        </div>
      ) : null}

      <p className="text-xs text-[var(--joballa-muted)]">{location}</p>
    </div>
  );
}

const applicantCardClass = (isActive?: boolean) =>
  cn(
    "w-full rounded-[14px] border border-[var(--joballa-pill-border)] bg-[var(--joballa-card)] p-[14px] text-left shadow-[var(--joballa-shadow-card)] transition",
    "hover:border-[color-mix(in_srgb,var(--joballa-primary)_35%,var(--joballa-pill-border))] hover:bg-[var(--joballa-row-hover)]",
    isActive && "border-2 border-[var(--joballa-jade-8)] bg-[var(--joballa-row-selected)] shadow-none",
  );

export function EmployerApplicantListCard(props: Props) {
  const isActive = "isActive" in props ? props.isActive : false;

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={cn(applicantCardClass(), "block no-underline")}>
        <ApplicantCardContent
          applicant={props.applicant}
          appliedLabel={props.appliedLabel}
          moreAriaLabel={props.moreAriaLabel}
        />
      </Link>
    );
  }

  return (
    <button type="button" onClick={props.onSelect} className={applicantCardClass(isActive)}>
      <ApplicantCardContent
        applicant={props.applicant}
        appliedLabel={props.appliedLabel}
        moreAriaLabel={props.moreAriaLabel}
      />
    </button>
  );
}

export { applicantId };
