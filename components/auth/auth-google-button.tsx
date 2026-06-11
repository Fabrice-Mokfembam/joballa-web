"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { postAuthGoogle } from "@/features/auth/api/auth";
import { mapGoogleAuthError } from "@/features/auth/lib/map-google-auth-error";
import { establishSessionAndNavigate } from "@/lib/auth/establish-session";
import { isGoogleSignInEnabled } from "@/lib/auth/google-client-id";
import {
  clearOnboardingRole,
  clearPendingSignUp,
  readOnboardingRole,
} from "@/lib/onboarding-signup-state";
import { toLanguagePreference } from "@/lib/joballa/names";
import { cn } from "@/lib/utils";

export type AuthGoogleSignInButtonProps = {
  mode: "signup" | "signin";
  disabled?: boolean;
  onError?: (message: string) => void;
  className?: string;
  callbackUrl?: string | null;
};

export function AuthGoogleSignInButton({
  mode,
  disabled = false,
  onError,
  className,
  callbackUrl = null,
}: AuthGoogleSignInButtonProps) {
  const t = useTranslations("auth.google");
  const locale = useLocale();
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [buttonWidth, setButtonWidth] = useState(320);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => setButtonWidth(Math.max(240, Math.floor(el.offsetWidth)));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleError = useCallback(
    (message: string) => {
      onError?.(message);
    },
    [onError],
  );

  const handleSuccess = useCallback(
    async (response: CredentialResponse) => {
      const idToken = response.credential;
      if (!idToken || disabled || busy) return;

      setBusy(true);
      try {
        if (mode === "signup") {
          const role = readOnboardingRole();
          if (!role) {
            router.push("/sign-up/role");
            return;
          }

          const tokens = await postAuthGoogle({
            idToken,
            mode: "signup",
            role: role.toLowerCase() as "worker" | "employer",
            preferredLanguage: toLanguagePreference(locale),
          });

          clearOnboardingRole();
          clearPendingSignUp();
          await establishSessionAndNavigate(router, tokens, { callbackUrl });
          return;
        }

        const tokens = await postAuthGoogle({ idToken, mode: "signin" });
        await establishSessionAndNavigate(router, tokens, { callbackUrl });
      } catch (err) {
        handleError(mapGoogleAuthError(err, (key) => t(`errors.${key}`)));
      } finally {
        setBusy(false);
      }
    },
    [busy, callbackUrl, disabled, handleError, locale, mode, router, t],
  );

  if (!isGoogleSignInEnabled()) {
    return null;
  }

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "flex w-full justify-center overflow-hidden",
        (disabled || busy) && "pointer-events-none opacity-60",
        className,
      )}
      aria-busy={busy}
    >
      <GoogleLogin
        onSuccess={(credential) => void handleSuccess(credential)}
        onError={() => handleError(t("errors.cancelled"))}
        text={mode === "signup" ? "signup_with" : "signin_with"}
        shape="rectangular"
        theme="outline"
        size="large"
        width={buttonWidth}
      />
    </div>
  );
}

