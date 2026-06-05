"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { authBannerErrorClassName, authLeadClassName, authPrimaryButtonClassName, authTitleClassName } from "@/lib/auth-ui";
import { getAuthMe } from "@/features/auth/api/auth";
import { patchWorkerProfessionalSummary } from "@/features/worker/api";
import { normalizeApiRole } from "@/lib/auth/normalize-api-auth";
import { intlPathFromDashboardRoute } from "@/lib/joballa/dashboard-route";
import { useAuthStore } from "@/lib/stores/auth-store";
import { writeOnboardingInterests } from "@/lib/onboarding-signup-state";
import {
  WORKER_SIGN_UP_CATEGORY_SLUGS,
  categorySlugsToLabels,
  type WorkerSignUpCategorySlug,
} from "@/lib/worker/sign-up-categories";
import { AuthMobileHeader } from "@/components/auth/auth-mobile-header";
import { WorkerCategoryChips } from "@/components/auth/worker-category-chips";
import { JoballaApiError } from "@/lib/joballa/request";

export function SignUpInterestsForm() {
  const t = useTranslations("auth.signUpInterests");
  const tm = useTranslations("auth.mobile");
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);

  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace("/sign-up/role");
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const me = await getAuthMe();
        if (cancelled) return;
        if (normalizeApiRole(me.user.role) !== "WORKER") {
          router.replace(
            intlPathFromDashboardRoute(me.dashboardRoute, normalizeApiRole(me.user.role)),
          );
        }
      } catch {
        if (!cancelled) router.replace("/sign-in");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, token]);

  function toggle(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
    setError(null);
  }

  const labelForSlug = (slug: string) => t(`options.${slug as WorkerSignUpCategorySlug}`);

  async function onContinue() {
    if (selected.size < 3) {
      setError(t("errors.min"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const slugs = [...selected];
      writeOnboardingInterests(slugs);
      const industries = categorySlugsToLabels(slugs, (s) => t(`options.${s}`));
      await patchWorkerProfessionalSummary({ industries });
      router.push("/sign-up/post-categories");
    } catch (err: unknown) {
      if (err instanceof JoballaApiError) setError(err.message);
      else setError(t("errors.generic"));
      setBusy(false);
    }
  }

  return (
    <div className="text-[color:var(--auth-fg)]">
      <AuthMobileHeader backHref="/sign-up/verify/phone" backLabel={tm("back")} />
      <h1 className={authTitleClassName}>{t("title")}</h1>
      <p className={cn("mt-4 max-w-md lg:mx-auto", authLeadClassName)}>{t("subtitle")}</p>

      <div className="mt-8">
        <WorkerCategoryChips
          slugs={WORKER_SIGN_UP_CATEGORY_SLUGS}
          selected={selected}
          onToggle={toggle}
          labelForSlug={labelForSlug}
        />
      </div>

      {error ? <p role="alert" className={cn(authBannerErrorClassName, "mt-4")}>{error}</p> : null}

      <button type="button" disabled={busy} onClick={() => void onContinue()} className={cn(authPrimaryButtonClassName, "mt-8")}>
        {busy ? t("actions.working") : t("actions.continue")}
      </button>
    </div>
  );
}
