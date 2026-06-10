"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";
import {
  authBannerErrorClassName,
  authBannerSuccessClassName,
  authInputClassName,
  authLabelClassName,
  authLinkClassName,
  authOutlineButtonClassName,
  authPrimaryButtonClassName,
} from "@/lib/auth-ui";
import { postRegister, postResendOtp, postVerify } from "@/features/auth/api/auth";
import { establishSessionAndNavigate } from "@/lib/auth/establish-session";
import { consumePendingSignupRole, peekPendingSignupRole } from "@/components/auth/signup-role-continue";
import { AuthGoogleButton } from "@/components/auth/auth-google-button";
import { JoballaApiError } from "@/lib/joballa/request";
import { toLanguagePreference } from "@/lib/joballa/names";
import type { JoballaRole } from "@/lib/joballa/types";
import type { AuthRegisterBody } from "@/lib/types/auth";

export function EmailSignUpForm() {
  const t = useTranslations("auth.signUpForm");
  const locale = useLocale();
  const router = useRouter();
  const initialRole = useMemo<JoballaRole>(() => peekPendingSignupRole() ?? "WORKER", []);

  const [contact, setContact] = useState<"email" | "phone">("email");
  const [name, setName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role] = useState<JoballaRole>(initialRole);
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"details" | "verify">("details");
  const [canonicalId, setCanonicalId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const lang = toLanguagePreference(locale);

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      const body: AuthRegisterBody =
        contact === "email"
          ? {
              email: emailAddress.trim().toLowerCase(),
              password,
              role,
              fullName: name.trim(),
              preferredLanguage: lang,
            }
          : {
              phone: phone.trim(),
              password,
              role,
              fullName: name.trim(),
              preferredLanguage: lang,
            };
      const res = await postRegister(body);
      setCanonicalId(res.identifier);
      setStep("verify");
      setSuccess(t("verify.sent"));
    } catch (e: unknown) {
      if (e instanceof JoballaApiError) setError(e.message);
      else setError(t("errors.submit"));
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canonicalId) return;
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      const otp = code.trim();
      if (!/^[0-9]{6}$/.test(otp)) {
        setError(t("errors.codeFormat"));
        setBusy(false);
        return;
      }
      const tokens = await postVerify({
        identifier: canonicalId,
        otp,
        purpose: "registration",
      });
      consumePendingSignupRole();
      await establishSessionAndNavigate(router, tokens);
    } catch (e: unknown) {
      if (e instanceof JoballaApiError) setError(e.message);
      else setError(t("errors.code"));
    } finally {
      setBusy(false);
    }
  }

  async function resendCode() {
    if (!canonicalId) return;
    setError(null);
    setBusy(true);
    try {
      await postResendOtp({ identifier: canonicalId, purpose: "registration" });
      setSuccess(t("verify.resent"));
    } catch (e: unknown) {
      if (e instanceof JoballaApiError) setError(e.message);
      else setError(t("errors.verification"));
    } finally {
      setBusy(false);
    }
  }

  const displayIdentifier = canonicalId ?? (contact === "email" ? emailAddress : phone);

  return (
    <div className="text-[color:var(--auth-fg)]">
      {step === "details" ? (
        <>
          <h1 className="text-center text-4xl font-bold leading-[48px] tracking-tight lg:text-left lg:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-5 text-center text-base font-medium leading-6 text-[color:var(--auth-fg-muted)] lg:text-left">
            <span>{t("introLead")}</span>
            <Link href="/sign-in" className={authLinkClassName}>
              {t("introSignIn")}
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-[color:var(--auth-fg-muted)] lg:text-left">
            {t("roleHint", { role: role === "EMPLOYER" ? t("roles.employer") : t("roles.worker") })}
          </p>

          <form className="mt-8 flex flex-col gap-3" onSubmit={(e) => void handleRegister(e)}>
            <div className="flex gap-2 rounded-xl border border-[color:var(--auth-border)] bg-[color:var(--auth-surface)] p-1">
              <button
                type="button"
                className={cn(
                  "flex-1 rounded-lg py-2.5 text-sm font-medium transition",
                  contact === "email"
                    ? "bg-[color:var(--auth-primary)] text-[color:var(--auth-on-primary)]"
                    : "text-[color:var(--auth-fg-muted)] hover:bg-[color:var(--auth-outline-hover)]",
                )}
                onClick={() => setContact("email")}
              >
                {t("contact.email")}
              </button>
              <button
                type="button"
                className={cn(
                  "flex-1 rounded-lg py-2.5 text-sm font-medium transition",
                  contact === "phone"
                    ? "bg-[color:var(--auth-primary)] text-[color:var(--auth-on-primary)]"
                    : "text-[color:var(--auth-fg-muted)] hover:bg-[color:var(--auth-outline-hover)]",
                )}
                onClick={() => setContact("phone")}
              >
                {t("contact.phone")}
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <div className={authLabelClassName}>{t("fields.name")}</div>
              <input
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={authInputClassName}
                placeholder={t("placeholders.name")}
              />
            </div>

            {contact === "email" ? (
              <div className="flex flex-col gap-1">
                <div className={authLabelClassName}>{t("fields.email")}</div>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={emailAddress}
                  onChange={(event) => setEmailAddress(event.target.value)}
                  className={authInputClassName}
                  placeholder={t("placeholders.email")}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <div className={authLabelClassName}>{t("fields.phone")}</div>
                <input
                  type="tel"
                  autoComplete="tel"
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className={authInputClassName}
                  placeholder={t("placeholders.phone")}
                />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <div className={authLabelClassName}>{t("fields.password")}</div>
              <PasswordInput
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={authInputClassName}
                placeholder={t("placeholders.password")}
                disabled={busy}
              />
            </div>

            <p className="px-1 text-xs leading-5 text-[color:var(--auth-fg-muted)]">{t("passwordRules")}</p>

            {error ? <p role="alert" className={authBannerErrorClassName}>{error}</p> : null}

            <button type="submit" disabled={busy} className={authPrimaryButtonClassName}>
              {busy ? t("actions.creating") : t("actions.create")}
            </button>

            <div className="flex items-center gap-4 py-1">
              <div className="h-px flex-1 bg-[color:var(--auth-divider)]" />
              <span className="text-sm font-medium text-[color:var(--auth-fg-muted)]">{t("orDivider")}</span>
              <div className="h-px flex-1 bg-[color:var(--auth-divider)]" />
            </div>

            <AuthGoogleButton label={t("googleContinue")} title={t("googleSoon")} />

            <p className="pt-2 text-center text-sm leading-5 text-[color:var(--auth-fg-subtle)]">
              {t("legalPrefix")}
              <Link href="/" className={cn(authLinkClassName, "text-[color:var(--auth-fg-subtle)]")}>
                {t("legalPrivacy")}
              </Link>
              {t("legalAnd")}
              <Link href="/" className={cn(authLinkClassName, "text-[color:var(--auth-fg-subtle)]")}>
                {t("legalTerms")}
              </Link>
            </p>
          </form>
        </>
      ) : (
        <>
          <h1 className="text-center text-4xl font-bold leading-tight tracking-tight lg:text-left lg:text-5xl">
            {t("verify.title")}
          </h1>
          <p className="mt-4 text-center text-sm leading-6 text-[color:var(--auth-fg-muted)] lg:text-left">
            {t("verify.description", { identifier: displayIdentifier })}
          </p>

          <form className="mt-8 flex flex-col gap-4" onSubmit={(e) => void handleVerify(e)}>
            <div className="flex flex-col gap-1">
              <div className={authLabelClassName}>{t("fields.code")}</div>
              <input
                type="text"
                autoComplete="one-time-code"
                inputMode="numeric"
                required
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                className={authInputClassName}
                placeholder={t("placeholders.code")}
              />
            </div>

            {success ? <div className={authBannerSuccessClassName}>{success}</div> : null}

            {error ? <p role="alert" className={authBannerErrorClassName}>{error}</p> : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="submit" disabled={busy} className={cn(authPrimaryButtonClassName, "sm:flex-1")}>
                {busy ? t("actions.verifying") : t("actions.verify")}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void resendCode()}
                className={cn(authOutlineButtonClassName, "sm:flex-1")}
              >
                {t("actions.resend")}
              </button>
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setStep("details");
                setCode("");
                setCanonicalId(null);
                setError(null);
                setSuccess(null);
              }}
              className="text-center text-sm font-medium text-[color:var(--auth-fg-muted)] underline-offset-4 hover:text-[color:var(--auth-fg)] hover:underline"
            >
              {t("actions.back")}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
