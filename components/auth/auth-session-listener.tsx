"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { isGuestOnlyPath } from "@/lib/auth/route-protection";
import { logoutAndRedirectToSignIn } from "@/lib/auth/sign-in-redirect";
import { SESSION_EXPIRED_EVENT, type SessionExpiredDetail } from "@/lib/auth/session-lifecycle";

/**
 * Redirects to sign-in when refresh fails on a protected route (Axios interceptor).
 */
export function AuthSessionListener() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function onSessionExpired(event: Event) {
      const detail = (event as CustomEvent<SessionExpiredDetail>).detail;
      if (!detail || detail.reason !== "session_expired") return;
      if (isGuestOnlyPath(pathname)) return;

      logoutAndRedirectToSignIn(router, {
        pathname,
        callbackUrl: detail.callbackUrl,
      });
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
  }, [pathname, router]);

  return null;
}
