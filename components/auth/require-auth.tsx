"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AuthSessionLoadingScreen } from "@/components/auth/auth-session-loading-screen";
import { ensureSessionHydrated } from "@/lib/auth/establish-session";
import { hasRecoverableSessionHint } from "@/lib/auth/session-hint";
import { homePathForRole, isProtectedPortalPath, roleMayAccessPortalPath } from "@/lib/auth/route-protection";
import { logoutAndRedirectToSignIn } from "@/lib/auth/sign-in-redirect";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { Role } from "@/lib/types/enums";

type RequireAuthProps = {
  children: ReactNode;
  /** If set, users whose role is not listed are redirected to their own portal home. */
  allowedRoles?: readonly Role[];
};

function isRoleAllowed(role: Role, allowed: readonly Role[] | undefined): boolean {
  if (!allowed?.length) {
    return true;
  }
  return allowed.includes(role);
}

/**
 * Client guard for authenticated routes: shows a branded loading screen until
 * session hydration finishes. Failed refresh (401) clears the session and
 * redirects to sign-in without a session-expired banner.
 */
export function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      useAuthStore.getState().setPortalGateReady(false);

      if (!hasRecoverableSessionHint(useAuthStore.getState().accessToken)) {
        if (!cancelled) logoutAndRedirectToSignIn(router, { pathname });
        return;
      }

      const result = await ensureSessionHydrated();
      if (cancelled) return;

      if (!result.ok) {
        logoutAndRedirectToSignIn(router, { pathname });
        return;
      }

      const user = useAuthStore.getState().user;
      if (!user) {
        logoutAndRedirectToSignIn(router, { pathname });
        return;
      }

      if (!isRoleAllowed(user.role, allowedRoles)) {
        router.replace(homePathForRole(user.role));
        return;
      }

      if (pathname && isProtectedPortalPath(pathname) && !roleMayAccessPortalPath(user.role, pathname)) {
        router.replace(homePathForRole(user.role));
        return;
      }

      if (!cancelled) {
        useAuthStore.getState().setPortalGateReady(true);
        setSessionReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [allowedRoles, pathname, router]);

  if (!sessionReady) {
    return <AuthSessionLoadingScreen />;
  }

  return <>{children}</>;
}
