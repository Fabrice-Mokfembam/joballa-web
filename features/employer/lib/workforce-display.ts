import type { EmployerWorkforceListItem } from "@/features/employer/types/employer-portal";

export const WORKFORCE_EMPLOYMENT_TYPE_SLUGS = [
  "full_time",
  "part_time",
  "contract",
  "casual",
  "seasonal",
  "internship",
] as const;

export const WORKFORCE_STATUS_SELECT_VALUES = ["active", "terminated"] as const;

export type WorkforceStatusSelectValue = (typeof WORKFORCE_STATUS_SELECT_VALUES)[number];

export function workforceEmploymentTypeSlug(raw?: string | null): string {
  if (!raw?.trim()) return "";
  return raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

export function workforceJobTypeRaw(worker: EmployerWorkforceListItem): string {
  return String(
    worker.employmentType ??
      worker.jobType ??
      (worker.job as { employmentType?: string; jobType?: string } | undefined)?.employmentType ??
      (worker.job as { employmentType?: string; jobType?: string } | undefined)?.jobType ??
      "",
  ).trim();
}

export function displayWorkforceJobType(
  worker: EmployerWorkforceListItem,
  translateEmploymentType: (slug: string) => string,
): string {
  const raw = workforceJobTypeRaw(worker);
  if (!raw) return "—";
  const slug = workforceEmploymentTypeSlug(raw);
  if ((WORKFORCE_EMPLOYMENT_TYPE_SLUGS as readonly string[]).includes(slug)) {
    return translateEmploymentType(slug);
  }
  return raw
    .split("_")
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : ""))
    .join(" ");
}

export function workforceStatusSelectValue(status: string | undefined | null): WorkforceStatusSelectValue {
  const value = String(status ?? "active").toLowerCase();
  if (value === "active") return "active";
  return "terminated";
}

export function isWorkforceTerminateStatus(status: string): boolean {
  const value = status.toLowerCase();
  return value === "terminated" || value === "completed" || value === "rejected";
}
