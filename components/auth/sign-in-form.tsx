"use client";

import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
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
import { AuthMobileHeader } from "@/components/auth/auth-mobile-header";

const AuthGoogleSignInButton = dynamic(
  () => import("@/components/auth/auth-google-button").then((mod) => mod.AuthGoogleSignInButton),
  { ssr: false },
);
import { postLogin } from "@/features/auth/api/auth";
import { establishSessionAndNavigate } from "@/lib/auth/establish-session";
import { JoballaApiError } from "@/lib/joballa/request";

export type SignInFormVariant = "email" | "phone";

type SignInFormInnerProps = {
  variant: SignInFormVariant;
  showAfterResetHint?: boolean;
};

function forgotHref(variant: SignInFormVariant, showReset: boolean) {
  const via = variant === "email" ? "email" : "phone";
  const p = new URLSearchParams();
  p.set("via", via);
  if (showReset) p.set("reset", "1");
  return `/forgot-password?${p.toString()}`;
}

function SignInFormInner({ variant, showAfterResetHint }: SignInFormInnerProps) {
  const t = useTranslations("auth.signInForm");
  const tl = useTranslations("auth.layout");
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetFromUrl = searchParams.get("reset") === "1";
  const showHint = showAfterResetHint ?? resetFromUrl;

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const titleKey = variant === "email" ? "emailTitle" : "phoneTitle";
  const fieldKey = variant === "email" ? "emailField" : "phoneField";
  const placeholderKey = variant === "email" ? "emailPlaceholder" : "phonePlaceholder";
  const resetSuffix = showHint ? "?reset=1" : "";
  const preservedQuery = searchParams.toString();
  const querySuffix = preservedQuery ? `?${preservedQuery}` : resetSuffix;
  const phoneSignInHref = `/sign-in${querySuffix}`;
  const alternateSignInHref = variant === "email" ? phoneSignInHref : `/sign-in/email${querySuffix}`;
  const alternateSignInLabel = variant === "email" ? t("signInWithPhone") : t("signInWithEmail");
  const backHref = variant === "email" ? phoneSignInHref : "/";
  const backLabel = variant === "email" ? t("signInWithPhone") : tl("backHome");

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const raw = identifier.trim();
      const id = variant === "email" ? raw.toLowerCase() : raw;
      const tokens = await postLogin({
        identifier: id,
        password,
      });
      const callbackUrl = searchParams.get("callbackUrl");
      await establishSessionAndNavigate(router, tokens, { callbackUrl });
    } catch (e: unknown) {
      if (e instanceof JoballaApiError) {
        if (e.status === 401) setError(t("errors.invalidCredentials"));
        else if (e.status === 403) setError(t("errors.notVerified"));
        else setError(e.message);
      } else setError(t("errors.submit"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="text-[color:var(--auth-fg)]">
      <AuthMobileHeader backHref={backHref} backLabel={backLabel} />
      <h1 className={authTitleClassName}>{t(titleKey)}</h1>
      <p className={cn("mt-5", authLeadClassName)}>
        {t.rich("subheadInvite", {
          create: (chunks) => (
            <Link href="/sign-up/role" className={cn(authLinkClassName, "text-sm")}>
              {chunks}
            </Link>
          ),
        })}
      </p>

      {showHint ? <div className={cn(authBannerSuccessClassName, "mt-6")}>{t("afterPasswordResetHint")}</div> : null}

      <form className="mt-8 flex flex-col gap-3" onSubmit={(e) => void handleSignIn(e)}>
        <div className="flex flex-col gap-1">
          <div className={authLabelClassName}>{t(fieldKey)}</div>
          <input
            type={variant === "email" ? "email" : "tel"}
            autoComplete={variant === "email" ? "email" : "tel"}
            inputMode={variant === "phone" ? "tel" : undefined}
            required
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            className={authInputClassName}
            placeholder={t(placeholderKey)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className={authLabelClassName}>{t("passwordField")}</div>
          <PasswordInput
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={authInputClassName}
            placeholder={t("passwordPlaceholder")}
            disabled={busy}
          />
        </div>

        <div className="text-right">
          <Link href={forgotHref(variant, showHint)} className={cn(authSecondaryLinkClassName, "text-sm")}>
            {t("forgotPassword")}
          </Link>
        </div>

        {error ? <p role="alert" className={authBannerErrorClassName}>{error}</p> : null}

        <button type="submit" disabled={busy} className={authPrimaryButtonClassName}>
          {busy ? t("actions.signingIn") : t("actions.signIn")}
        </button>

        <div className="flex items-center gap-[26px] px-1 py-1">
          <div className="h-px flex-1 bg-[color:var(--auth-divider)]" />
          <span className="text-sm font-medium text-[color:var(--auth-fg-muted)]">{t("or")}</span>
          <div className="h-px flex-1 bg-[color:var(--auth-divider)]" />
        </div>

        <AuthGoogleSignInButton
          mode="signin"
          disabled={busy}
          onError={setError}
          callbackUrl={searchParams.get("callbackUrl")}
        />

        <Link href={alternateSignInHref} className={cn(authOutlineButtonClassName, "text-center")}>
          {alternateSignInLabel}
        </Link>
      </form>
    </div>
  );
}

export function SignInForm(props: SignInFormInnerProps) {
  return (
    <Suspense fallback={null}>
      <SignInFormInner {...props} />
    </Suspense>
  );
}
