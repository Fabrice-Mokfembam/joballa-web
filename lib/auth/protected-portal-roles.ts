import type { Role } from "@/lib/types/enums";

/** Stable arrays for `RequireAuth` (avoid new `[]` each render). */
export const WORKER_PORTAL_ROLES: readonly Role[] = ["WORKER"];
export const EMPLOYER_PORTAL_ROLES: readonly Role[] = ["EMPLOYER"];
export const ADMIN_PORTAL_ROLES: readonly Role[] = ["ADMIN", "SUPER_ADMIN"];
