import type { JoballaRole, LanguagePreference } from "@/lib/joballa/types";

export function toLanguagePreference(locale: string): LanguagePreference {
  return locale === "fr" ? "fre" : "eng";
}

export function defaultDisplayNameForRole(
  role: JoballaRole,
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  fullName: string | null | undefined
): string {
  const fromParts =
    fullName?.trim() ||
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    "";
  if (fromParts) return fromParts;
  return role === "EMPLOYER" ? "Employer" : "Worker";
}
