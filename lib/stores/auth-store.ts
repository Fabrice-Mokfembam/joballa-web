import { create } from "zustand";
import {
  clearStoredTokens,
  readStoredAccessToken,
  readStoredRefreshToken,
  writeStoredTokens,
} from "@/lib/auth/token-storage";
import { clearSessionCookie, writeSessionCookie } from "@/lib/auth/session-cookie";
import { blockTokenRefresh, resetTokenRefreshState } from "@/lib/auth/token-refresh";
import type { AuthSessionUser } from "@/lib/types/auth";

export type AuthStore = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthSessionUser | null;
  /** True after protected-route session hydration succeeds (not just persisted tokens). */
  portalGateReady: boolean;
  setAccessToken: (token: string | null) => void;
  setTokens: (accessToken: string, refreshToken?: string | null) => void;
  setSession: (accessToken: string, refreshToken: string | null, user: AuthSessionUser | null) => void;
  setPortalGateReady: (ready: boolean) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  portalGateReady: false,
  setAccessToken: (token) => {
    const refresh = get().refreshToken;
    set({ accessToken: token });
    if (token && refresh) writeStoredTokens(token, refresh);
    else if (!token && !refresh) clearStoredTokens();
  },
  setTokens: (accessToken, refreshToken) => {
    writeStoredTokens(accessToken, refreshToken);
    set({ accessToken, refreshToken: refreshToken ?? null });
  },
  setSession: (accessToken, refreshToken, user) => {
    resetTokenRefreshState();
    writeStoredTokens(accessToken, refreshToken);
    if (user) writeSessionCookie(user.role);
    set({ accessToken, refreshToken, user });
  },
  setPortalGateReady: (ready) => set({ portalGateReady: ready }),
  clearSession: () => {
    clearSessionCookie();
    clearStoredTokens();
    blockTokenRefresh();
    set({ accessToken: null, refreshToken: null, user: null, portalGateReady: false });
  },
}));

/** Restore tokens from `localStorage` into Zustand (client-only, on app load). */
export function hydrateAuthStoreFromPersistence(): void {
  if (typeof window === "undefined") return;
  const accessToken = readStoredAccessToken();
  const refreshToken = readStoredRefreshToken();
  if (!accessToken && !refreshToken) return;
  resetTokenRefreshState();
  useAuthStore.setState({
    accessToken,
    refreshToken,
  });
}

/** @deprecated Use {@link hydrateAuthStoreFromPersistence}. */
export const hydrateAuthStoreFromSessionStorage = hydrateAuthStoreFromPersistence;

if (typeof window !== "undefined") {
  hydrateAuthStoreFromPersistence();
}
