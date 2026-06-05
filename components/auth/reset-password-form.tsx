"use client";

import { Suspense, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
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
  authLeadClassName,
  authPrimaryButtonClassName,
  authSecondaryLinkClassName,
  authTitleClassName,
} from "@/lib/auth-ui";
import { postLogin, postResendOtp, postResetPassword } from "@/features/auth/api/auth";
import { establishSessionAndNavigate } from "@/lib/auth/establish-session";
import { JoballaApiError } from "@/lib/joballa/request";
import { AuthMobileHeader } from "@/components/auth/auth-mobile-header";
import {
  clearPendingPasswordReset,
  readPendingPasswordReset,
  writePendingPasswordReset,
} from "@/lib/password-reset-state";

function normalizeIdentifier(raw: string) {
  const id = raw.trim();
  return id.includes("@") ? id.toLowerCase() : id;
}

type ResetStep = "otp" | "password";

function ResetPasswordFormInner() {
  const t = useTranslations("auth.resetPassword");
  const tm = useTranslations("auth.mobile");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<ResetStep>("otp");
  const [identifier, setIdentifier] = useState("");
  const [identifierFromForgot, setIdentifierFromForgot] = useState(false);
  const [showSentHint, setShowSentHint] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);

  useEffect(() => {
    const idParam = searchParams.get("identifier");
    if (idParam) {
      try {
        setIdentifier(normalizeIdentifier(decodeURIComponent(idParam)));
      } catch {
        setIdentifier(normalizeIdentifier(idParam));
      }
      setIdentifierFromForgot(true);
    }
    if (searchParams.get("sent") === "1") {
      setShowSentHint(true);
    }
    const pending = readPendingPasswordReset();
    if (pending) {
      setIdentifier(pending.identifier);
      setOtp(pending.otp);
      setStep("password");
    }
  }, [searchParams]);

  function canonicalId() {
    return normalizeIdentifier(identifier);
  }

  function backToOtpStep() {
    clearPendingPasswordReset();
    setStep("otp");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setInfo(null);
  }

  async function onResend() {
    const id = canonicalId();
    if (!id) {
      setError(t("errors.needIdentifier"));
      return;
    }
    setError(null);
    setInfo(null);
    setResendBusy(true);
    try {
      await postResendOtp({ identifier: id, purpose: "password_reset" });
      setInfo(t("resendSuccess"));
    } catch (e: unknown) {
      if (e instanceof JoballaApiError) setError(e.message);
      else setError(t("errors.resend"));
    } finally {
      setResendBusy(false);
    }
  }

  async function onVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const id = canonicalId();
    if (!id) {
      setError(t("errors.needIdentifier"));
      return;
    }

    const code = otp.trim();
    if (!/^[0-9]{6}$/.test(code)) {
      setError(t("errors.codeFormat"));
      return;
    }

    writePendingPasswordReset({ identifier: id, otp: code });
    setStep("password");
  }

  async function onSubmitPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const pending = readPendingPasswordReset();
    const id = pending?.identifier ?? canonicalId();
    const code = pending?.otp ?? otp.trim();

    if (!id) {
      setError(t("errors.needIdentifier"));
      setStep("otp");
      return;
    }

    if (!/^[0-9]{6}$/.test(code)) {
      setError(t("errors.codeFormat"));
      backToOtpStep();
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 128) {
      setError(t("errors.passwordLength"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("errors.passwordMismatch"));
      return;
    }

    setBusy(true);
    try {
      await postResetPassword({
        identifier: id,
        code,
        newPassword,
      });
    } catch (e: unknown) {
      if (e instanceof JoballaApiError) {
        setError(e.message);
        if (/otp|code/i.test(e.message)) backToOtpStep();
      } else {
        setError(t("errors.generic"));
      }
      setBusy(false);
      return;
    }

    clearPendingPasswordReset();

    try {
      const tokens = await postLogin({
        identifier: id,
        password: newPassword,
      });
      await establishSessionAndNavigate(router, tokens);
    } catch {
      router.replace("/sign-in?reset=1");
    } finally {
      setBusy(false);
    }
  }

  const isOtpStep = step === "otp";

  return (
    <div className="text-[color:var(--auth-fg)]">
      <AuthMobileHeader
        backHref={isOtpStep ? "/forgot-password" : undefined}
        backLabel={tm("back")}
        onBack={isOtpStep ? undefined : backToOtpStep}
      />
      <h1 className={authTitleClassName}>{isOtpStep ? t("verify.title") : t("password.title")}</h1>
      <p className={cn("mt-4", authLeadClassName)}>{isOtpStep ? t("verify.description") : t("password.description")}</p>

      {isOtpStep && showSentHint ? <div className={cn(authBannerSuccessClassName, "mt-6")}>{t("sentHint")}</div> : null}

      {isOtpStep ? (
        <form className="mt-8 flex flex-col gap-4" onSubmit={(e) => void onVerifyOtp(e)}>
          <div className="flex flex-col gap-1">
            <div className={authLabelClassName}>{t("fields.identifier")}</div>
            <input
              type="text"
              required
              readOnly={identifierFromForgot}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className={cn(
                authInputClassName,
                identifierFromForgot && "cursor-not-allowed bg-[color:var(--auth-surface-muted)] text-[color:var(--auth-fg-muted)]",
              )}
              placeholder={t("placeholders.identifier")}
            />
            {identifierFromForgot ? (
              <span className="px-1 text-xs text-[color:var(--auth-fg-muted)]">{t("identifierLockedHint")}</span>
            ) : null}
          </div>
          <div className="flex flex-col gap-1">
            <div className={authLabelClassName}>{t("fields.code")}</div>
            <input
              type="text"
              inputMode="numeric"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className={authInputClassName}
              placeholder={t("placeholders.code")}
            />
          </div>

          {info ? <div className={authBannerSuccessClassName}>{info}</div> : null}
          {error ? (
            <p role="alert" className={authBannerErrorClassName}>
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={busy} className={authPrimaryButtonClassName}>
            {busy ? t("actions.verifying") : t("actions.verify")}
          </button>

          <button
            type="button"
            disabled={resendBusy || busy}
            onClick={() => void onResend()}
            className={authOutlineButtonClassName}
          >
            {resendBusy ? t("actions.resending") : t("actions.resend")}
          </button>

          <p className={cn("text-sm text-[color:var(--auth-fg-muted)]", "text-left lg:text-center")}>
            <Link href="/forgot-password" className={authSecondaryLinkClassName}>
              {t("backToForgot")}
            </Link>
            {" · "}
            <Link href="/sign-in" className={authLinkClassName}>
              {t("backToSignIn")}
            </Link>
          </p>
        </form>
      ) : (
        <form className="mt-8 flex flex-col gap-4" onSubmit={(e) => void onSubmitPassword(e)}>
          <div className="rounded-md border border-[color:var(--auth-border)] bg-[color:var(--auth-surface-muted)] px-3 py-2.5 text-sm text-[color:var(--auth-fg-muted)]">
            <span className="font-medium text-[color:var(--auth-fg)]">{canonicalId()}</span>
            <span className="mx-2 text-[color:var(--auth-fg-muted)]" aria-hidden>
              ·
            </span>
            <span>{t("password.codeConfirmed")}</span>
          </div>

          <div className="flex flex-col gap-1">
            <div className={authLabelClassName}>{t("fields.newPassword")}</div>
            <PasswordInput
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={authInputClassName}
              placeholder={t("placeholders.newPassword")}
              disabled={busy}
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className={authLabelClassName}>{t("fields.confirmPassword")}</div>
            <PasswordInput
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={authInputClassName}
              placeholder={t("placeholders.confirmPassword")}
              disabled={busy}
            />
          </div>

          {info ? <div className={authBannerSuccessClassName}>{info}</div> : null}
          {error ? (
            <p role="alert" className={authBannerErrorClassName}>
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={busy} className={authPrimaryButtonClassName}>
            {busy ? t("actions.saving") : t("actions.submit")}
          </button>

          <button type="button" disabled={busy} onClick={backToOtpStep} className={authOutlineButtonClassName}>
            {t("actions.changeCode")}
          </button>

          <p className={cn("text-sm text-[color:var(--auth-fg-muted)]", "text-left lg:text-center")}>
            <Link href="/sign-in" className={authLinkClassName}>
              {t("backToSignIn")}
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordFormInner />
    </Suspense>
  );
}
