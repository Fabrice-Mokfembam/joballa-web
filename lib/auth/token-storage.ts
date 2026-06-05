/** Client session storage keys — shared across tabs via `localStorage`. See `docs/auth.md` §7.1 */

export const JOBALLA_ACCESS_TOKEN_KEY = "joballa_access_token";
export const JOBALLA_REFRESH_TOKEN_KEY = "joballa_refresh_token";

export function readStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(JOBALLA_ACCESS_TOKEN_KEY);
}

export function readStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(JOBALLA_REFRESH_TOKEN_KEY);
}

export function writeStoredTokens(accessToken: string, refreshToken?: string | null): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(JOBALLA_ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(JOBALLA_REFRESH_TOKEN_KEY, refreshToken);
  else localStorage.removeItem(JOBALLA_REFRESH_TOKEN_KEY);
}

export function clearStoredTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(JOBALLA_ACCESS_TOKEN_KEY);
  localStorage.removeItem(JOBALLA_REFRESH_TOKEN_KEY);
}
