import axios from "axios";
import { hasRecoverableSessionHint } from "@/lib/auth/session-hint";
import {
  JOBALLA_ACCESS_TOKEN_KEY,
  JOBALLA_REFRESH_TOKEN_KEY,
  readStoredRefreshToken,
} from "@/lib/auth/token-storage";
import { getApiBaseUrl } from "@/lib/joballa/config";
import { hydrateAuthStoreFromPersistence, useAuthStore } from "@/lib/stores/auth-store";
import type { AuthRefreshResponse } from "@/lib/types/auth";

/** Thrown when refresh is missing, invalid, or already failed for this browser session. */
export class SessionExpiredError extends Error {
  readonly status = 401;

  constructor(message = "Session expired") {
    super(message);
    this.name = "SessionExpiredError";
  }
}

let refreshPromise: Promise<string> | null = null;
let refreshBlocked = false;

export function resetTokenRefreshState(): void {
  refreshPromise = null;
  refreshBlocked = false;
}

/** After a failed refresh, block further attempts until the next successful login. */
export function blockTokenRefresh(): void {
  refreshBlocked = true;
  refreshPromise = null;
}

export function isSessionRefreshInProgress(): boolean {
  return refreshPromise != null;
}

function resolveRefreshToken(): string | null {
  hydrateAuthStoreFromPersistence();
  return useAuthStore.getState().refreshToken ?? readStoredRefreshToken();
}

async function requestRefresh(refreshToken: string | null): Promise<AuthRefreshResponse> {
  const base = getApiBaseUrl();
  const headers = { Accept: "application/json", "Content-Type": "application/json" };
  const config = { withCredentials: true, headers, validateStatus: (s: number) => s < 500 };

  if (refreshToken) {
    const bodyRes = await axios.post<AuthRefreshResponse>(`${base}/auth/refresh`, { refreshToken }, config);
    if (bodyRes.status === 200 && bodyRes.data?.accessToken) {
      return bodyRes.data;
    }
  }

  const cookieRes = await axios.post<AuthRefreshResponse>(`${base}/auth/refresh`, {}, config);
  if (cookieRes.status === 200 && cookieRes.data?.accessToken) {
    return cookieRes.data;
  }

  throw new SessionExpiredError();
}

async function performRefresh(): Promise<string> {
  hydrateAuthStoreFromPersistence();

  const refreshToken = resolveRefreshToken();
  if (!refreshToken && !hasRecoverableSessionHint(null)) {
    blockTokenRefresh();
    throw new SessionExpiredError();
  }

  try {
    const data = await requestRefresh(refreshToken);
    useAuthStore.getState().setTokens(data.accessToken, data.refreshToken ?? refreshToken);
    return data.accessToken;
  } catch (err) {
    blockTokenRefresh();
    if (err instanceof SessionExpiredError) throw err;
    throw new SessionExpiredError();
  }
}

/**
 * Single in-flight refresh shared within a tab; coordinated across tabs via `navigator.locks`.
 * Concurrent 401s share one request. Tokens persist in `localStorage` for new tabs.
 */
export function refreshAccessToken(): Promise<string> {
  if (refreshBlocked) {
    return Promise.reject(new SessionExpiredError());
  }

  hydrateAuthStoreFromPersistence();

  const refreshToken = resolveRefreshToken();
  if (!refreshToken && !hasRecoverableSessionHint(null)) {
    blockTokenRefresh();
    return Promise.reject(new SessionExpiredError());
  }

  if (!refreshPromise) {
    const run = async () => {
      if (typeof navigator !== "undefined" && "locks" in navigator) {
        return navigator.locks.request("joballa-token-refresh", performRefresh);
      }
      return performRefresh();
    };

    refreshPromise = run().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

/** Sync Zustand when another tab writes or clears auth tokens. */
export function initAuthCrossTabSync(): void {
  if (typeof window === "undefined") return;

  window.addEventListener("storage", (event) => {
    if (event.key !== JOBALLA_ACCESS_TOKEN_KEY && event.key !== JOBALLA_REFRESH_TOKEN_KEY) return;

    if (!event.newValue && event.key === JOBALLA_ACCESS_TOKEN_KEY) {
      const refreshStillPresent = readStoredRefreshToken();
      if (!refreshStillPresent) {
        useAuthStore.getState().clearSession();
      } else {
        hydrateAuthStoreFromPersistence();
        resetTokenRefreshState();
      }
      return;
    }

    hydrateAuthStoreFromPersistence();
    resetTokenRefreshState();
  });
}
