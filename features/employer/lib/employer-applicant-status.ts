import type { EmployerApplicantStatus } from "@/features/employer/types/employer-portal";

/** UI tab/filter value — `pending` is the label employers see; API uses `submitted`. */
export type EmployerApplicantUiStatus = "pending" | "shortlisted" | "hired" | "rejected";

const UI_STATUSES = new Set<string>(["pending", "shortlisted", "hired", "rejected"]);

/** Maps API / stored status to UI display & tab filtering. */
export function normalizeApplicantStatusForUi(
  status: EmployerApplicantStatus | string | null | undefined,
): EmployerApplicantUiStatus {
  const value = String(status ?? "").toLowerCase();
  if (value === "submitted" || value === "pending" || value === "") return "pending";
  if (value === "shortlisted" || value === "hired" || value === "rejected") return value;
  return "pending";
}

/** Maps UI tab/filter to query param the v2 API accepts. */
export function mapApplicantStatusForApi(
  status: EmployerApplicantStatus | string | null | undefined,
): string | undefined {
  const value = String(status ?? "").trim();
  if (!value) return undefined;
  if (value === "pending") return "submitted";
  if (value === "submitted" || UI_STATUSES.has(value)) return value;
  return undefined;
}
