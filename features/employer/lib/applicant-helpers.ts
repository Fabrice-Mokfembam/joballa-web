import type { EmployerApplicantListItem } from "@/features/employer/types/employer-portal";

export function applicantId(item: EmployerApplicantListItem): string {
  return String(item.applicationId ?? item.id ?? "");
}

export function applicantName(item: EmployerApplicantListItem): string {
  return String(item.applicantName ?? item.name ?? "Applicant");
}

export function applicantRole(item: EmployerApplicantListItem): string {
  return String(item.jobTitle ?? item.role ?? "—");
}

export function formatStatValue(stat?: { count?: number | string }): string {
  if (!stat?.count && stat?.count !== 0) return "—";
  return String(stat.count);
}

export function formatStatHint(stat?: { trend?: string; label?: string }): string {
  return stat?.trend ?? stat?.label ?? "";
}
