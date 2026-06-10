"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";
import {
  authBannerErrorClassName,
  authInputClassName,
  authLabelClassName,
  authLinkClassName,
  authOutlineButtonClassName,
  authFooterTextClassName,
  authLeadClassName,
  authPrimaryButtonClassName,
  authTitleClassName,
} from "@/lib/auth-ui";
import { postRegister } from "@/features/auth/api/auth";
import { JoballaApiError } from "@/lib/joballa/request";
import { toLanguagePreference } from "@/lib/joballa/names";
import { readOnboardingRole, writePendingSignUp, writeSignupDisplayName, type PendingSignUpState } from "@/lib/onboarding-signup-state";
import { AuthGoogleButton } from "@/components/auth/auth-google-button";
import { AuthMobileHeader } from "@/components/auth/auth-mobile-header";

export function SignUpPhoneForm() {
  const t = useTranslations("auth.signUpPhone");
  const tm = useTranslations("auth.mobile");
  const locale = useLocale();
  const router = useRouter();
  const lang = toLanguagePreference(locale);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!readOnboardingRole()) router.replace("/sign-up/role");
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const role = readOnboardingRole();
    if (!role) {
      router.replace("/sign-up/role");
      return;
    }
    setBusy(true);
    try {
      const res = await postRegister({
        phone: phone.trim(),
        password,
        role,
        fullName: name.trim(),
        preferredLanguage: lang,
      });
      writeSignupDisplayName(name.trim());
      const pending: PendingSignUpState = {
        channel: "phone",
        name: name.trim(),
        phone: phone.trim(),
        password,
        identifier: res.identifier,
      };
      writePendingSignUp(pending);
      router.push("/sign-up/verify/phone");
    } catch (err: unknown) {
      if (err instanceof JoballaApiError) setError(err.message);
      else setError(t("errors.submit"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="text-[color:var(--auth-fg)]">
      <AuthMobileHeader backHref="/sign-up/role" backLabel={tm("back")} />
      <h1 className={authTitleClassName}>{t("title")}</h1>
      <p className={cn("mt-5", authLeadClassName)}>
        <span className="text-[color:var(--auth-fg-muted)]">{t("intro")}</span>{" "}
        <Link href="/sign-in" className={authLinkClassName}>
          {t("loginHere")}
        </Link>
      </p>

      <form className="mt-8 flex flex-col gap-3" onSubmit={(ev) => void onSubmit(ev)}>
        <div className="flex flex-col gap-1">
          <div className={authLabelClassName}>{t("fields.name")}</div>
          <input
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            className={authInputClassName}
            placeholder={t("placeholders.name")}
            disabled={busy}
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className={authLabelClassName}>{t("fields.phone")}</div>
          <input
            type="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(ev) => setPhone(ev.target.value)}
            className={authInputClassName}
            placeholder={t("placeholders.phone")}
            disabled={busy}
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className={authLabelClassName}>{t("fields.password")}</div>
          <PasswordInput
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={128}
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            className={authInputClassName}
            placeholder={t("placeholders.password")}
            disabled={busy}
          />
        </div>

        {error ? <p role="alert" className={authBannerErrorClassName}>{error}</p> : null}

        <button type="submit" disabled={busy} className={authPrimaryButtonClassName}>
          {busy ? t("actions.creating") : t("actions.signUp")}
        </button>

        <div className="flex items-center gap-[26px] px-1 py-1">
          <div className="h-px flex-1 bg-[color:var(--auth-divider)]" />
          <span className="text-sm font-medium text-[color:var(--auth-fg-muted)]">{t("or")}</span>
          <div className="h-px flex-1 bg-[color:var(--auth-divider)]" />
        </div>

        <AuthGoogleButton label={t("google")} title={t("googleSoon")} />

        <Link href="/sign-up/email" className={cn(authOutlineButtonClassName, "text-center")}>
          {t("useEmail")}
        </Link>

        <p className={cn("pt-2", authFooterTextClassName)}>
          {t("legal.prefix")}
          <Link href="/" className={cn(authLinkClassName, "text-[color:var(--auth-fg-subtle)]")}>
            {t("legal.privacy")}
          </Link>
          {t("legal.and")}
          <Link href="/" className={cn(authLinkClassName, "text-[color:var(--auth-fg-subtle)]")}>
            {t("legal.terms")}
          </Link>
        </p>
      </form>
    </div>
  );
}
