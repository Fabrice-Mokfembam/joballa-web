import { JoballaApiError } from "@/lib/joballa/request";

export function mapGoogleAuthError(
  err: unknown,
  t: (key: "noAccount" | "conflict" | "invalid" | "suspended" | "generic" | "cancelled") => string,
): string {
  if (err instanceof JoballaApiError) {
    if (err.status === 404) return t("noAccount");
    if (err.status === 409) return err.message || t("conflict");
    if (err.status === 403) return err.message || t("suspended");
    if (err.status === 400) return err.message || t("invalid");
  }
  return t("generic");
}
