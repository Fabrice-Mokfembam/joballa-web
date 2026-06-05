"use client";

import { useTranslations } from "next-intl";
import { Building2, User } from "lucide-react";
import { useRouter } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { authTitleClassName } from "@/lib/auth-ui";
import type { JoballaRole } from "@/lib/joballa/types";
import { writeOnboardingRole } from "@/lib/onboarding-signup-state";
import { setPendingSignupIntent } from "@/components/auth/signup-role-continue";
import { AuthMobileHeader } from "@/components/auth/auth-mobile-header";

type CardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  onSelect: () => void;
};

function RoleCard({ title, description, icon, onSelect }: CardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full cursor-pointer items-start gap-3 rounded-xl border border-[color:var(--auth-role-inactive-border)] bg-[color:var(--auth-role-inactive-surface)] p-4 text-left shadow-none transition",
        "hover:border-[color:var(--auth-role-active-border)] hover:bg-[color:var(--auth-role-active-surface)] hover:shadow-[var(--auth-shadow-input)]",
        "focus-visible:border-[color:var(--auth-role-active-border)] focus-visible:bg-[color:var(--auth-role-active-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--auth-focus-ring)]",
      )}
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--auth-role-inactive-icon-bg)] text-[color:var(--auth-role-inactive-fg)]">
        {icon}
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-base font-bold leading-6 text-[color:var(--auth-fg)]">{title}</p>
        <p className="text-sm font-medium leading-5 text-[color:var(--auth-role-inactive-fg)]">{description}</p>
      </div>
    </button>
  );
}

export function SignUpRolePicker() {
  const t = useTranslations("auth.signUpRole");
  const tl = useTranslations("auth.layout");
  const router = useRouter();

  function selectRole(role: JoballaRole) {
    writeOnboardingRole(role);
    setPendingSignupIntent(role);
    router.push("/sign-up/phone");
  }

  return (
    <div className="text-[color:var(--auth-fg)]">
      <AuthMobileHeader backHref="/" backLabel={tl("backHome")} />

      <h1 className={authTitleClassName}>{t("title")}</h1>
      <p className="mt-3 text-sm text-[color:var(--auth-fg-muted)]">{t("hint")}</p>

      <div className="mt-8 flex flex-col gap-3">
        <RoleCard
          title={t("worker.title")}
          description={t("worker.description")}
          icon={<User className="size-6" aria-hidden strokeWidth={1.7} />}
          onSelect={() => selectRole("WORKER")}
        />
        <RoleCard
          title={t("employer.title")}
          description={t("employer.description")}
          icon={<Building2 className="size-6" aria-hidden strokeWidth={1.7} />}
          onSelect={() => selectRole("EMPLOYER")}
        />
      </div>
    </div>
  );
}
