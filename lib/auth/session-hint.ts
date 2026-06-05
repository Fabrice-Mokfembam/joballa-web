import { readStoredRefreshToken } from "@/lib/auth/token-storage";
import { parseSessionCookie, SESSION_COOKIE_NAME } from "@/lib/auth/session-cookie";
import { useAuthStore } from "@/lib/stores/auth-store";

/** Read the first-party session hint cookie (client-only). */
export function readSessionHintFromDocument() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${SESSION_COOKIE_NAME.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`),
  );
  if (!match?.[1]) return null;
  try {
    return parseSessionCookie(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

/** True when we should attempt `POST /auth/refresh` (access, refresh token, or routing hint cookie). */
export function hasRecoverableSessionHint(accessToken: string | null): boolean {
  if (accessToken) return true;
  if (useAuthStore.getState().refreshToken) return true;
  if (readStoredRefreshToken()) return true;
  return readSessionHintFromDocument() !== null;
}
