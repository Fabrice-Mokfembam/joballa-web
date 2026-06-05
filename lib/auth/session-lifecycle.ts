"use client";

import type { QueryClient } from "@tanstack/react-query";
import { postLogout } from "@/features/auth/api/auth";
import { hasRecoverableSessionHint } from "@/lib/auth/session-hint";
import { refreshAccessToken, resetTokenRefreshState, SessionExpiredError } from "@/lib/auth/token-refresh";
import { useAuthStore } from "@/lib/stores/auth-store";

export const SESSION_EXPIRED_EVENT = "joballa:session-expired";

export type SessionExpiredDetail = {
  reason: "session_expired";
  callbackUrl?: string;
};

export type SessionHydrationResult =
  | { ok: true }
  | { ok: false; reason: "none" | "expired" };

function dispatchSessionExpired(detail: SessionExpiredDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<SessionExpiredDetail>(SESSION_EXPIRED_EVENT, { detail }));
}

/**
 * End the client session after refresh failure or forced sign-out.
 * Optionally notifies {@link AuthSessionListener} to redirect protected routes.
 */
export function terminateSession(options?: {
  notify?: boolean;
  callbackUrl?: string;
}): void {
  useAuthStore.getState().clearSession();
  if (options?.notify) {
    dispatchSessionExpired({
      reason: "session_expired",
      callbackUrl: options.callbackUrl,
    });
  }
}

/** User-initiated logout: revoke server session when possible, then clear client state. */
export async function signOut(options: {
  router: { replace: (href: string) => void };
  queryClient: QueryClient;
  accessToken?: string | null;
}): Promise<void> {
  const { accessToken, refreshToken } = useAuthStore.getState();
  const token = options.accessToken ?? accessToken;
  try {
    if (token) {
      await postLogout(token, refreshToken);
    }
  } catch {
    /* still clear local session */
  } finally {
    resetTokenRefreshState();
    useAuthStore.getState().clearSession();
    options.queryClient.clear();
    options.router.replace("/sign-in");
  }
}

/**
 * @deprecated Do not call outside the Axios 401 interceptor. Refresh is only attempted after a failed request.
 */
export async function tryRefreshAccessToken(): Promise<string | null> {
  const token = useAuthStore.getState().accessToken;
  if (!hasRecoverableSessionHint(token)) {
    return null;
  }

  try {
    return await refreshAccessToken();
  } catch (e) {
    if (e instanceof SessionExpiredError) {
      terminateSession();
    }
    return null;
  }
}
