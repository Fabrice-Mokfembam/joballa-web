"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import type { EmployerApplicantListItem } from "@/features/employer/types/employer-portal";
import { applicantId } from "@/features/employer/lib/applicant-helpers";
import { EmployerApplicantPostingCard } from "@/components/job-posting/employer-applicant-posting-card";
import type { JobPostingCardMenuItem } from "@/components/job-posting/job-posting-card";
import { useRouter } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

type BaseProps = {
  applicant: EmployerApplicantListItem;
  appliedLabel: string;
  moreAriaLabel: string;
  menuItems?: JobPostingCardMenuItem[];
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

const applicantCardInteractiveClass = () =>
  cn(
    "block w-full text-left no-underline transition",
    "hover:[&>div]:border-[color-mix(in_srgb,var(--joballa-primary)_35%,var(--joballa-pill-border))] hover:[&>div]:bg-[var(--joballa-row-hover)]",
  );

export function EmployerApplicantListCard(props: Props) {
  const router = useRouter();
  const isActive = "isActive" in props ? props.isActive : false;

  const card = (
    <EmployerApplicantPostingCard
      applicant={props.applicant}
      appliedLabel={props.appliedLabel}
      moreMenuAriaLabel={props.moreAriaLabel}
      menuItems={props.menuItems}
      isActive={isActive}
    />
  );

  const activate = () => {
    if ("href" in props && props.href) {
      router.push(props.href);
    } else if ("onSelect" in props && props.onSelect) {
      props.onSelect();
    }
  };

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("[data-applicant-card-menu]")) return;
    activate();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    activate();
  };

  return (
    <div
      role={"href" in props && props.href ? "link" : "button"}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(applicantCardInteractiveClass(), "cursor-pointer")}
    >
      {card}
    </div>
  );
}

export { applicantId };
