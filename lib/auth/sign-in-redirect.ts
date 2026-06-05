"use client";

import { isProtectedPortalPath, isSafeCallbackPath } from "@/lib/auth/route-protection";
import { useAuthStore } from "@/lib/stores/auth-store";

export function buildSignInHref(options?: {
  pathname?: string | null;
  callbackUrl?: string | null;
}): string {
  const params = new URLSearchParams();
  const callback =
    options?.callbackUrl && isSafeCallbackPath(options.callbackUrl)
      ? options.callbackUrl
      : options?.pathname && isProtectedPortalPath(options.pathname)
        ? options.pathname
        : null;

  if (callback) params.set("callbackUrl", callback);
  const q = params.toString();
  return q ? `/sign-in?${q}` : "/sign-in";
}

/** Clear client session and navigate to sign-in (no session-expired banner). */
export function logoutAndRedirectToSignIn(
  router: { replace: (href: string) => void },
  options?: { pathname?: string | null; callbackUrl?: string | null },
): void {
  useAuthStore.getState().clearSession();
  router.replace(buildSignInHref(options));
}
