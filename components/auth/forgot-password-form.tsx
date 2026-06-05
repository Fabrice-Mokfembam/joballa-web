"use client";

import { Suspense, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  authBannerErrorClassName,
  authInputClassName,
  authLabelClassName,
  authLeadClassName,
  authPrimaryButtonClassName,
  authSecondaryLinkClassName,
  authTitleClassName,
} from "@/lib/auth-ui";
import { postForgotPassword } from "@/features/auth/api/auth";
import { JoballaApiError } from "@/lib/joballa/request";
import { AuthMobileHeader } from "@/components/auth/auth-mobile-header";

function ForgotPasswordFormInner() {
  const t = useTranslations("auth.forgotPassword");
  const tm = useTranslations("auth.mobile");
  const router = useRouter();
  const searchParams = useSearchParams();
  const via = searchParams.get("via") === "email" ? "email" : "phone";

  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const labelKey = via === "email" ? "fields.email" : "fields.phone";
  const placeholderKey = via === "email" ? "placeholders.email" : "placeholders.phone";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const id = identifier.trim();
      const canonical = id.includes("@") ? id.toLowerCase() : id;
      await postForgotPassword({ identifier: canonical });
      const p = new URLSearchParams();
      p.set("identifier", canonical);
      p.set("sent", "1");
      if (via === "email") p.set("via", "email");
      else p.set("via", "phone");
      router.push(`/reset-password?${p.toString()}`);
    } catch (e: unknown) {
      if (e instanceof JoballaApiError) setError(e.message);
      else setError(t("errors.generic"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="text-[color:var(--auth-fg)]">
      <AuthMobileHeader backHref="/sign-in" backLabel={tm("back")} />
      <h1 className={authTitleClassName}>{t("title")}</h1>
      <p className={cn("mt-4", authLeadClassName)}>{t("description")}</p>

      <form className="mt-8 flex flex-col gap-4" onSubmit={(e) => void onSubmit(e)}>
        <div className="flex flex-col gap-1">
          <div className={authLabelClassName}>{t(labelKey)}</div>
          <input
            type={via === "email" ? "email" : "tel"}
            autoComplete={via === "email" ? "email" : "tel"}
            inputMode={via === "phone" ? "tel" : "email"}
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className={authInputClassName}
            placeholder={t(placeholderKey)}
          />
        </div>

        {error ? <p role="alert" className={authBannerErrorClassName}>{error}</p> : null}

        <button type="submit" disabled={busy} className={authPrimaryButtonClassName}>
          {busy ? t("actions.sending") : t("actions.submit")}
        </button>

        <p className={cn("text-sm text-[color:var(--auth-fg-muted)]", "text-left lg:text-center")}>
          <Link href="/reset-password" className={authSecondaryLinkClassName}>
            {t("alreadyHaveCode")}
          </Link>
        </p>
        <p className={cn("text-sm text-[color:var(--auth-fg-muted)]", "text-left lg:text-center")}>
          <Link href="/sign-in" className={authSecondaryLinkClassName}>
            {t("backToSignIn")}
          </Link>
        </p>
      </form>
    </div>
  );
}

export function ForgotPasswordForm() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordFormInner />
    </Suspense>
  );
}
