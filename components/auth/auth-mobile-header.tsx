"use client";

import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { AuthBackLink } from "@/components/auth/auth-back-link";
import { AuthMobileLogo } from "@/components/auth/auth-mobile-logo";
import { cn } from "@/lib/utils";

type AuthMobileHeaderProps = {
  backHref?: string;
  backLabel?: string;
  onBack?: () => void;
};

const backControlClassName =
  "inline-flex shrink-0 items-center gap-1 self-start text-sm font-medium text-[color:var(--auth-fg-muted)] transition hover:text-[color:var(--auth-fg)]";

/** Back link on all breakpoints; logo above the form on mobile only (centered). */
export function AuthMobileHeader({ backHref, backLabel, onBack }: AuthMobileHeaderProps) {
  return (
    <div className="mb-2 flex w-full flex-col gap-5">
      {onBack && backLabel ? (
        <button type="button" onClick={onBack} className={cn(backControlClassName)}>
          <ChevronLeft className="size-4 shrink-0" aria-hidden strokeWidth={1.8} />
          {backLabel}
        </button>
      ) : backHref && backLabel ? (
        <AuthBackLink href={backHref} label={backLabel} />
      ) : null}
      <AuthMobileLogo className="mb-0" />
    </div>
  );
}

/** Login hub: back to marketing home + logo. */
export function LoginMobileHeader() {
  const t = useTranslations("auth.layout");
  return <AuthMobileHeader backHref="/" backLabel={t("backHome")} />;
}
