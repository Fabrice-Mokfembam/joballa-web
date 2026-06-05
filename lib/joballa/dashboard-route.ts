import { normalizeApiRole } from "@/lib/auth/normalize-api-auth";
import type { Role } from "@/lib/types/enums";

const ROLE_HOME: Partial<Record<Role, string>> = {
  WORKER: "/worker",
  EMPLOYER: "/employer",
  ADMIN: "/admin",
  /** Web app has no `/super-admin` route yet; API may still return that path in `dashboardRoute`. */
  SUPER_ADMIN: "/admin",
};

function normalizeDashboardPath(p: string): string {
  if (p === "/super-admin") {
    /** API `dashboardRoute` can be `/super-admin`; this app serves admin UI at `/admin` only. */
    return "/admin";
  }
  return p;
}

/**
 * Maps backend `dashboardRoute` to a path for `next-intl`'s `Link` / `useRouter`:
 * **no locale segment** — next-intl adds `[locale]` automatically.
 *
 * Backend returns `/worker`, `/employer`, `/admin`, `/super-admin`, or `null`
 * (see `docs/BACKEND_AUTH_REPLY.md`). Trailing `/dashboard` is stripped if present.
 */
export function intlPathFromDashboardRoute(
  dashboardRoute: string | null | undefined,
  role: Role | string,
): string {
  const normalizedRole = normalizeApiRole(typeof role === "string" ? role : role);
  const raw = dashboardRoute?.trim();
  if (raw) {
    let p = raw.startsWith("/") ? raw : `/${raw}`;
    p = p.replace(/\/dashboard\/?$/, "") || "/";
    if (p !== "/") return normalizeDashboardPath(p);
  }
  return ROLE_HOME[normalizedRole] ?? "/";
}
