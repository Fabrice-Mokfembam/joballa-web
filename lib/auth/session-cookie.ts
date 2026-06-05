import { normalizeApiRole } from "@/lib/auth/normalize-api-auth";
import type { Role } from "@/lib/types/enums";

/** First-party hint cookie for middleware routing only — not used for API auth. */
export const SESSION_COOKIE_NAME = "joballa.session";

const MAX_AGE_SEC = 60 * 60 * 24 * 7;

type SessionCookiePayload = {
  role: Role;
};

export function parseSessionCookie(value: string | undefined): SessionCookiePayload | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Partial<SessionCookiePayload>;
    if (parsed.role) {
      return { role: normalizeApiRole(String(parsed.role)) };
    }
    return null;
  } catch {
    return null;
  }
}

/** Client-only: mirror Zustand session for middleware redirects. */
export function writeSessionCookie(role: Role) {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(JSON.stringify({ role } satisfies SessionCookiePayload));
  document.cookie = `${SESSION_COOKIE_NAME}=${value}; path=/; max-age=${MAX_AGE_SEC}; SameSite=Lax`;
}

export function clearSessionCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}
