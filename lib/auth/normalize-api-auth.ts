import type { Language, Role } from "@/lib/types/enums";

const ROLES = new Set<Role>(["WORKER", "EMPLOYER", "ADMIN", "SUPER_ADMIN"]);

/** v2 auth responses use `worker` / `employer`; portal code expects uppercase `Role`. */
export function normalizeApiRole(value: string | undefined | null): Role {
  if (!value) return "WORKER";
  const upper = value.toUpperCase();
  if (ROLES.has(upper as Role)) return upper as Role;
  return "WORKER";
}

/** v2 uses `eng` / `fre`; internal store uses `EN` / `FR`. */
export function normalizeApiLanguage(value: string | undefined | null): Language {
  const v = (value ?? "").toLowerCase();
  if (v === "fre" || v === "fr") return "FR";
  if (v === "eng" || v === "en") return "EN";
  return "EN";
}
