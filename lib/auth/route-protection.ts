import { normalizeApiRole } from "@/lib/auth/normalize-api-auth";
import type { Role } from "@/lib/types/enums";
import { intlPathFromDashboardRoute } from "@/lib/joballa/dashboard-route";

const LOCALES = ["en", "fr"] as const;

/** Portal paths (no locale prefix). */
export const PROTECTED_PORTAL_PREFIXES = ["/worker", "/employer", "/admin"] as const;

/** Auth flows — redirect to portal when already signed in. */
export const GUEST_ONLY_PREFIXES = [
  "/sign-in",
  "/login",
  "/forgot-password",
  "/reset-password",
] as const;

export function splitLocalePath(pathname: string): { locale: string; path: string } {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (first && (LOCALES as readonly string[]).includes(first)) {
    const rest = segments.slice(1);
    return { locale: first, path: rest.length ? `/${rest.join("/")}` : "/" };
  }
  return { locale: "en", path: pathname || "/" };
}

export function isProtectedPortalPath(path: string): boolean {
  return PROTECTED_PORTAL_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function isGuestOnlyPath(path: string): boolean {
  return GUEST_ONLY_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function portalPrefixForRole(role: Role | string): string | null {
  switch (normalizeApiRole(role)) {
    case "WORKER":
      return "/worker";
    case "EMPLOYER":
      return "/employer";
    case "ADMIN":
    case "SUPER_ADMIN":
      return "/admin";
    default:
      return null;
  }
}

export function roleMayAccessPortalPath(role: Role | string, path: string): boolean {
  const prefix = portalPrefixForRole(role);
  if (!prefix) return false;
  return path === prefix || path.startsWith(`${prefix}/`);
}

export function homePathForRole(role: Role | string): string {
  return intlPathFromDashboardRoute(null, role);
}

/** Open redirect guard for post-login return URLs. */
export function isSafeCallbackPath(path: string): boolean {
  if (!path.startsWith("/") || path.startsWith("//")) return false;
  if (path.includes("://")) return false;
  return PROTECTED_PORTAL_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

/**
 * Post-login / post-hydration destination: honor `callbackUrl` only when the user's role may access that portal.
 */
export function resolveAuthDestination(
  callbackUrl: string | null | undefined,
  role: Role | string,
  dashboardRoute: string | null | undefined,
): string {
  const normalizedRole = normalizeApiRole(role);
  const callback = callbackUrl?.trim();
  if (callback && isSafeCallbackPath(callback) && roleMayAccessPortalPath(normalizedRole, callback)) {
    return callback;
  }
  return intlPathFromDashboardRoute(dashboardRoute, normalizedRole);
}
