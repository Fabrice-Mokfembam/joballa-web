"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  authBannerErrorClassName,
  authBannerSuccessClassName,
  authLabelClassName,
  authLinkClassName,
  authFooterTextClassName,
  authLeadClassName,
  authPrimaryButtonClassName,
  authTitleClassName,
} from "@/lib/auth-ui";
import { getAuthMe, postResendOtp, postSelectRole, postVerify } from "@/features/auth/api/auth";
import { establishSessionFromTokens, refreshAuthSessionInStore } from "@/lib/auth/establish-session";
import { normalizeApiRole } from "@/lib/auth/normalize-api-auth";
import { intlPathFromDashboardRoute } from "@/lib/joballa/dashboard-route";
import { JoballaApiError } from "@/lib/joballa/request";
import { toLanguagePreference } from "@/lib/joballa/names";
import {
  clearPendingSignUp,
  readOnboardingRole,
  readPendingSignUp,
  readSignupDisplayName,
  writeSignupDisplayName,
  type SignupChannel,
} from "@/lib/onboarding-signup-state";
import { AuthMobileHeader } from "@/components/auth/auth-mobile-header";

const cellClass =
  "h-11 min-w-0 flex-1 border-0 border-r border-[color:var(--auth-border)] bg-transparent text-center text-base font-medium text-[color:var(--auth-fg)] outline-none transition last:border-r-0 focus:relative focus:z-10 focus:ring-2 focus:ring-inset focus:ring-[color:var(--auth-focus-ring)]";

const groupShellClass =
  "flex flex-1 overflow-hidden rounded-md border border-[color:var(--auth-border)] bg-[color:var(--auth-surface)] shadow-[var(--auth-shadow-input)]";

type Props = {
  expectedChannel: SignupChannel;
};

export function SignUpOtpForm({ expectedChannel }: Props) {
  const t = useTranslations("auth.signUpOtp");
  const tm = useTranslations("auth.mobile");
  const locale = useLocale();
  const router = useRouter();
  const lang = toLanguagePreference(locale);

  const [channel, setChannel] = useState<SignupChannel | null>(null);
  const [display, setDisplay] = useState("");
  const [digits, setDigits] = useState(() => Array.from({ length: 6 }, () => ""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);

  useEffect(() => {
    const p = readPendingSignUp();
    if (!p?.identifier) {
      router.replace(readOnboardingRole() ? "/sign-up/phone" : "/sign-up/role");
      return;
    }
    if (p.channel !== expectedChannel) {
      router.replace(p.channel === "email" ? "/sign-up/verify/email" : "/sign-up/verify/phone");
      return;
    }
    setChannel(p.channel);
    setDisplay(p.channel === "email" ? (p.email ?? "") : (p.phone ?? ""));
  }, [expectedChannel, router]);

  function setDigit(i: number, v: string) {
    const d = v.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = d;
      return next;
    });
    if (d && i < 5) inputsRef.current[i + 1]?.focus();
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputsRef.current[i - 1]?.focus();
  }

  function onPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const raw = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = Array.from({ length: 6 }, (_, j) => raw[j] ?? "");
    setDigits(next);
    const focusIdx = Math.min(raw.length, 5);
    inputsRef.current[focusIdx]?.focus();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const p = readPendingSignUp();
    if (!p?.identifier) {
      router.replace(readOnboardingRole() ? "/sign-up/phone" : "/sign-up/role");
      return;
    }
    const code = digits.join("");
    if (!/^[0-9]{6}$/.test(code)) {
      setError(t("errors.format"));
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const tokens = await postVerify({
        identifier: p.identifier,
        otp: code,
        purpose: "registration",
      });
      const role = tokens.user.role
        ? normalizeApiRole(tokens.user.role)
        : (readOnboardingRole() ?? "WORKER");
      if (p.name.trim()) writeSignupDisplayName(p.name.trim());
      clearPendingSignUp();
      await establishSessionFromTokens(tokens);
      if (role === "EMPLOYER") {
        const name = readSignupDisplayName() ?? (p.name.trim() || undefined);
        try {
          await postSelectRole({ role: "EMPLOYER", name, preferredLanguage: lang });
          await refreshAuthSessionInStore();
        } catch {
          /* Optional per API: name/language may already be set at verify; continue to dashboard. */
        }
        const me = await getAuthMe();
        router.replace(intlPathFromDashboardRoute(me.dashboardRoute, normalizeApiRole(me.user.role)));
      } else {
        router.push("/sign-up/interests");
      }
    } catch (err: unknown) {
      if (err instanceof JoballaApiError) setError(err.message);
      else setError(t("errors.verify"));
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    const p = readPendingSignUp();
    if (!p?.identifier) return;
    setError(null);
    setResendBusy(true);
    try {
      await postResendOtp({ identifier: p.identifier, purpose: "registration" });
      setInfo(t("resent"));
    } catch (err: unknown) {
      if (err instanceof JoballaApiError) setError(err.message);
      else setError(t("errors.resend"));
    } finally {
      setResendBusy(false);
    }
  }

  const titleKey = channel === "phone" ? "titlePhone" : "titleEmail";
  const leadKey = channel === "phone" ? "leadPhone" : "leadEmail";
  const backHref = expectedChannel === "email" ? "/sign-up/email" : "/sign-up/phone";

  function renderTriplet(start: number) {
    return (
      <div className={groupShellClass}>
        {[0, 1, 2].map((j) => {
          const i = start + j;
          return (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digits[i]}
              onChange={(ev) => setDigit(i, ev.target.value)}
              onKeyDown={(ev) => onKeyDown(i, ev)}
              onPaste={onPaste}
              className={cellClass}
              disabled={busy || resendBusy}
              aria-label={t("digitAria", { n: i + 1 })}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="text-[color:var(--auth-fg)]">
      <AuthMobileHeader backHref={backHref} backLabel={tm("back")} />
      <h1 className={authTitleClassName}>{channel ? t(titleKey) : "\u00a0"}</h1>
      <p className={cn("mt-5", authLeadClassName)}>
        {channel ? (
          <>
            <span className="text-[color:var(--auth-fg-muted)]">{t(leadKey)} </span>
            <span className="font-bold text-[color:var(--auth-fg)]">{display}</span>
          </>
        ) : null}
      </p>

      <form className="mt-8 flex flex-col gap-6" onSubmit={(ev) => void onSubmit(ev)}>
        <div className="flex flex-col gap-1">
          <div className={authLabelClassName}>{t("codeLabel")}</div>
          <div className="flex h-11 items-center gap-2">
            {renderTriplet(0)}
            <span className="flex w-6 shrink-0 items-center justify-center text-lg font-light text-[color:var(--auth-fg-subtle)]" aria-hidden>
              —
            </span>
            {renderTriplet(3)}
          </div>
        </div>

        {info ? <div className={authBannerSuccessClassName}>{info}</div> : null}
        {error ? <p role="alert" className={authBannerErrorClassName}>{error}</p> : null}

        <button type="submit" disabled={busy || resendBusy} className={authPrimaryButtonClassName}>
          {busy ? t("actions.verifying") : t("actions.signUp")}
        </button>

        <button
          type="button"
          disabled={busy || resendBusy}
          onClick={() => void resend()}
          className={cn(authLinkClassName, "text-sm text-[color:var(--auth-fg-muted)]", "text-left lg:text-center")}
        >
          {resendBusy ? t("actions.sending") : t("actions.resend")}
        </button>

        <p className={authFooterTextClassName}>
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
