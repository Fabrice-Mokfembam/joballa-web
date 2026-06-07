"use client";

import Image from "next/image";
import { useState } from "react";
import type { EmployerApplicantListItem } from "@/features/employer/types/employer-portal";
import { applicantName } from "@/features/employer/lib/applicant-helpers";
import {
  applicantHeadline,
  applicantIsVerified,
  applicantMatchText,
  applicantSkillsList,
} from "@/features/employer/lib/applicant-profile";
import { IconMoreHorizontal, IconVerified } from "@/components/worker/icons";
import type { JobPostingCardMenuItem } from "@/components/job-posting/job-posting-card";
import { cn } from "@/lib/utils";

/** Figma `ApplicantCard` (node 324:4873) — employer dashboard applicants preview. */
export type EmployerApplicantPostingCardProps = {
  applicant: EmployerApplicantListItem;
  /** e.g. "Applied 2h ago" */
  appliedLabel: string;
  moreMenuAriaLabel: string;
  menuItems?: JobPostingCardMenuItem[];
  className?: string;
  isActive?: boolean;
};

function applicantAvatarUrl(applicant: EmployerApplicantListItem): string | null {
  const raw = applicant as EmployerApplicantListItem & { workerPhotoUrl?: string | null };
  const profile = applicant.submittedProfile as Record<string, unknown> | undefined;
  const candidates = [
    raw.workerPhotoUrl,
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

function SkillPill({ children }: { children: string }) {
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-[26px] border border-[var(--joballa-pill-border)] bg-[var(--joballa-pill-bg)] px-2 py-1.5 text-xs font-semibold leading-4 text-[var(--joballa-muted)]">
      {children}
    </span>
  );
}

export function EmployerApplicantPostingCard({
  applicant,
  appliedLabel,
  moreMenuAriaLabel,
  menuItems,
  className,
  isActive,
}: EmployerApplicantPostingCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const match = applicantMatchText(applicant);
  const skills = applicantSkillsList(applicant).slice(0, 3);
  const location = String(applicant.location ?? "—");
  const verified = applicantIsVerified(applicant);
  const headline = applicantHeadline(applicant);

  return (
    <div
      className={cn(
        "flex min-w-[310px] w-full flex-col gap-6 rounded-[14px] border border-[var(--joballa-pill-border)] bg-[var(--joballa-card)] p-[14px] shadow-[var(--joballa-shadow-card)]",
        isActive && "border-2 border-[var(--joballa-jade-8)] bg-[var(--joballa-row-selected)] shadow-none",
        className,
      )}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <p className="text-xs font-medium leading-4 text-[var(--joballa-muted)]">{appliedLabel}</p>
        <div className="flex shrink-0 items-center gap-3.5">
          {match ? (
            <span className="inline-flex shrink-0 items-center justify-center rounded-[26px] bg-[var(--joballa-highlight-bg)] px-2 py-0.5 text-xs font-semibold leading-4 text-[var(--joballa-match-accent)]">
              {match}
            </span>
          ) : (
            <span className="min-w-[1px] shrink-0" aria-hidden />
          )}
          <div className="relative shrink-0" data-applicant-card-menu>
            <button
              type="button"
              className={cn(
                "inline-flex size-6 items-center justify-center text-[var(--joballa-muted)] transition hover:text-[var(--joballa-fg)]",
                !menuItems?.length && "cursor-default",
              )}
              aria-label={moreMenuAriaLabel}
              aria-expanded={menuOpen}
              disabled={!menuItems?.length}
              onClick={(event) => {
                event.stopPropagation();
                if (menuItems?.length) setMenuOpen((open) => !open);
              }}
            >
              <IconMoreHorizontal className="size-6" />
            </button>
            {menuOpen && menuItems && menuItems.length > 0 ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10 cursor-default bg-transparent"
                  aria-hidden
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-lg border border-[var(--joballa-border)] bg-[var(--joballa-dropdown-bg)] py-1 text-sm shadow-[var(--joballa-shadow-elevated)]">
                  {menuItems.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      className={cn(
                        "block w-full px-3 py-2 text-left text-[var(--joballa-fg)] hover:bg-[var(--joballa-row-hover)]",
                        item.destructive && "text-[var(--joballa-danger-fg)] hover:bg-[var(--joballa-danger-bg)]",
                      )}
                      onClick={(event) => {
                        event.stopPropagation();
                        item.onSelect();
                        setMenuOpen(false);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>
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
          {headline ? (
            <p className="truncate text-xs leading-4 text-[var(--joballa-muted)]">{headline}</p>
          ) : null}
        </div>
      </div>

      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2.5">
          {skills.map((skill) => (
            <SkillPill key={skill}>{skill}</SkillPill>
          ))}
        </div>
      ) : null}

      {location && location !== "—" ? (
        <p className="text-xs leading-4 text-[var(--joballa-muted)]">{location}</p>
      ) : null}
    </div>
  );
}
