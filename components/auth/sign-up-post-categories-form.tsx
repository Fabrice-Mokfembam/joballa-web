"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { authBannerErrorClassName, authLeadClassName, authPrimaryButtonClassName, authTitleClassName } from "@/lib/auth-ui";
import { getAuthMe } from "@/features/auth/api/auth";
import { patchWorkerProfessionalSummary } from "@/features/worker/api";
import { intlPathFromDashboardRoute } from "@/lib/joballa/dashboard-route";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  clearOnboardingExtras,
  clearSignupDisplayName,
  readOnboardingInterests,
  writeOnboardingPostingCategories,
} from "@/lib/onboarding-signup-state";
import {
  WORKER_SIGN_UP_CATEGORY_SLUGS,
  WORKER_SIGN_UP_JOB_TYPE_SLUGS,
  categorySlugsToLabels,
  jobTypeSlugsToEnums,
  type WorkerSignUpCategorySlug,
  type WorkerSignUpJobTypeSlug,
} from "@/lib/worker/sign-up-categories";
import { AuthMobileHeader } from "@/components/auth/auth-mobile-header";
import { WorkerCategoryChips } from "@/components/auth/worker-category-chips";
import { JoballaApiError } from "@/lib/joballa/request";

export function SignUpPostCategoriesForm() {
  const t = useTranslations("auth.signUpPostCategories");
  const tInterests = useTranslations("auth.signUpInterests");
  const tm = useTranslations("auth.mobile");
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);

  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(() => new Set());
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(() => new Set());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace("/sign-up/role");
      return;
    }
    if (readOnboardingInterests().length < 3) {
      router.replace("/sign-up/interests");
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const me = await getAuthMe();
        if (cancelled) return;
        if (me.user.role !== "WORKER") {
          router.replace(intlPathFromDashboardRoute(me.dashboardRoute, me.user.role));
        }
      } catch {
        if (!cancelled) router.replace("/sign-in");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, token]);

  function toggleCategory(slug: string) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
    setError(null);
  }

  function toggleType(slug: string) {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
    setError(null);
  }

  const categoryLabel = (slug: string) => tInterests(`options.${slug as WorkerSignUpCategorySlug}`);
  const typeLabel = (slug: string) => t(`jobTypes.${slug as WorkerSignUpJobTypeSlug}`);

  async function onContinue() {
    if (selectedCategories.size < 3) {
      setError(t("errors.minCategories"));
      return;
    }
    if (selectedTypes.size < 1) {
      setError(t("errors.minTypes"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const interestSlugs = readOnboardingInterests();
      const postSlugs = [...selectedCategories];
      writeOnboardingPostingCategories(postSlugs);

      const interestLabels = categorySlugsToLabels(interestSlugs, (s) => tInterests(`options.${s}`));
      const postLabels = categorySlugsToLabels(postSlugs, (s) => tInterests(`options.${s}`));
      const industries = [...new Set([...interestLabels, ...postLabels])];
      const preferredJobTypes = jobTypeSlugsToEnums([...selectedTypes]);

      await patchWorkerProfessionalSummary({ industries, preferredJobTypes });
      clearSignupDisplayName();
      clearOnboardingExtras();
      const me = await getAuthMe();
      router.replace(intlPathFromDashboardRoute(me.dashboardRoute, me.user.role));
    } catch (err: unknown) {
      if (err instanceof JoballaApiError) setError(err.message);
      else setError(t("errors.generic"));
      setBusy(false);
    }
  }

  return (
    <div className="text-[color:var(--auth-fg)]">
      <AuthMobileHeader backHref="/sign-up/interests" backLabel={tm("back")} />
      <h1 className={authTitleClassName}>{t("title")}</h1>
      <p className={cn("mt-4 max-w-md lg:mx-auto", authLeadClassName)}>{t("subtitle")}</p>

      <p className="mt-8 text-sm font-semibold text-[color:var(--auth-fg)]">{t("sections.categories")}</p>
      <div className="mt-3">
        <WorkerCategoryChips
          slugs={WORKER_SIGN_UP_CATEGORY_SLUGS}
          selected={selectedCategories}
          onToggle={toggleCategory}
          labelForSlug={categoryLabel}
        />
      </div>

      <p className="mt-8 text-sm font-semibold text-[color:var(--auth-fg)]">{t("sections.kinds")}</p>
      <p className="mt-1 text-sm text-[color:var(--auth-muted-fg,var(--auth-pill-inactive-fg))]">{t("sections.kindsHint")}</p>
      <div className="mt-3">
        <WorkerCategoryChips
          slugs={WORKER_SIGN_UP_JOB_TYPE_SLUGS}
          selected={selectedTypes}
          onToggle={toggleType}
          labelForSlug={typeLabel}
        />
      </div>

      {error ? <p role="alert" className={cn(authBannerErrorClassName, "mt-4")}>{error}</p> : null}

      <button type="button" disabled={busy} onClick={() => void onContinue()} className={cn(authPrimaryButtonClassName, "mt-8")}>
        {busy ? t("actions.working") : t("actions.continue")}
      </button>
    </div>
  );
}
