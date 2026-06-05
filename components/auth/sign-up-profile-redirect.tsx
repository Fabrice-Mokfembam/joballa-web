"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { getAuthMe } from "@/features/auth/api/auth";
import { intlPathFromDashboardRoute } from "@/lib/joballa/dashboard-route";
import { useAuthStore } from "@/lib/stores/auth-store";

/** Legacy `/sign-up/profile` URL: workers → interests; employers/admins → dashboard. */
export function SignUpProfileRedirect() {
  const router = useRouter();
  const t = useTranslations("auth.signUpOtp");
  const token = useAuthStore((s) => s.accessToken);

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
        if (me.user.role === "WORKER") {
          router.replace("/sign-up/interests");
        } else {
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

  return (
    <div className="py-16 text-center text-sm font-medium text-[color:var(--auth-fg-muted)]">{t("redirecting")}</div>
  );
}
