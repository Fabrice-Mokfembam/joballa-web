"use client";

import { getAuthMe } from "@/features/auth/api/auth";
import { hasRecoverableSessionHint } from "@/lib/auth/session-hint";
import { type SessionHydrationResult } from "@/lib/auth/session-lifecycle";
import { refreshAccessToken, SessionExpiredError } from "@/lib/auth/token-refresh";
import { normalizeApiLanguage, normalizeApiRole } from "@/lib/auth/normalize-api-auth";
import { resolveAuthDestination } from "@/lib/auth/route-protection";
import { hydrateAuthStoreFromPersistence, useAuthStore } from "@/lib/stores/auth-store";
import { JoballaApiError } from "@/lib/joballa/request";
import type { AuthMeResponse, AuthSessionUser, AuthTokensResponse } from "@/lib/types/auth";

function sessionUserFromMeUser(u: {
  id: string;
  role: string;
  email: string | null;
  phone?: string | null;
  languagePreference?: string | null;
  verificationStatus?: AuthSessionUser["verificationStatus"];
}): AuthSessionUser {
  return {
    id: u.id,
    role: normalizeApiRole(u.role),
    email: u.email,
    phone: u.phone ?? null,
    languagePreference: normalizeApiLanguage(u.languagePreference ?? null),
    verificationStatus: u.verificationStatus,
  };
}

/** Persist tokens, load `/auth/me`, update the client store. Does not navigate. */
export async function establishSessionFromTokens(tokens: AuthTokensResponse): Promise<AuthMeResponse> {
  useAuthStore.getState().setTokens(tokens.accessToken, tokens.refreshToken);
  const me = await getAuthMe();
  useAuthStore.getState().setSession(tokens.accessToken, tokens.refreshToken ?? null, sessionUserFromMeUser(me.user));
  return me;
}

/** Re-fetch `/auth/me` and sync the Zustand session (e.g. after `POST /auth/select-role`). */
export async function refreshAuthSessionInStore(): Promise<AuthMeResponse> {
  const { accessToken, refreshToken } = useAuthStore.getState();
  if (!accessToken) throw new Error("Missing access token");
  const me = await getAuthMe();
  useAuthStore.getState().setSession(accessToken, refreshToken, sessionUserFromMeUser(me.user));
  return me;
}

/** After login or verify: persist tokens, load `/auth/me`, then client-navigate to the dashboard. */
export async function establishSessionAndNavigate(
  router: { replace: (href: string) => void },
  tokens: AuthTokensResponse,
  options?: { callbackUrl?: string | null },
) {
  const me = await establishSessionFromTokens(tokens);
  router.replace(
    resolveAuthDestination(options?.callbackUrl, me.user.role, me.dashboardRoute),
  );
}

/**
 * Restore session via `GET /auth/me`, refreshing first when only the refresh token is available.
 */
export async function ensureSessionHydrated(): Promise<SessionHydrationResult> {
  hydrateAuthStoreFromPersistence();
  const { accessToken, refreshToken, user } = useAuthStore.getState();
  const hadHint = hasRecoverableSessionHint(accessToken);

  if (!hadHint) {
    return { ok: false, reason: "none" };
  }

  if (user && accessToken) {
    return { ok: true };
  }

  if (!accessToken && hadHint) {
    try {
      await refreshAccessToken();
    } catch {
      useAuthStore.getState().clearSession();
      return { ok: false, reason: "expired" };
    }
  }

  try {
    const me = await getAuthMe();
    const activeAccess = useAuthStore.getState().accessToken;
    const activeRefresh = useAuthStore.getState().refreshToken;
    if (!activeAccess) {
      return { ok: false, reason: "expired" };
    }
    useAuthStore.getState().setSession(activeAccess, activeRefresh, sessionUserFromMeUser(me.user));
    return { ok: true };
  } catch (e) {
    if (e instanceof SessionExpiredError || (e instanceof JoballaApiError && e.status === 401)) {
      useAuthStore.getState().clearSession();
      return { ok: false, reason: "expired" };
    }
    return { ok: false, reason: "none" };
  }
}
