"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { readPendingSignUp } from "@/lib/onboarding-signup-state";

/** Sends users from `/sign-up/verify` to the channel-specific OTP URL. */
export function SignUpVerifyRedirect() {
  const router = useRouter();
  const t = useTranslations("auth.signUpOtp");

  useEffect(() => {
    const p = readPendingSignUp();
    if (!p?.identifier) {
      router.replace("/sign-up/role");
      return;
    }
    router.replace(p.channel === "email" ? "/sign-up/verify/email" : "/sign-up/verify/phone");
  }, [router]);

  return (
    <div className="py-16 text-center text-sm font-medium text-[color:var(--auth-fg-muted)]">{t("redirecting")}</div>
  );
}
