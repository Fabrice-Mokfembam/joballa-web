import type { EmployerJobDepartment } from "@/features/employer/types/employer-portal";

export function normalizeEmployerJobDepartment(raw: unknown): EmployerJobDepartment | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = String(row.id ?? "").trim();
  if (!id) return null;
  return {
    id,
    name: String(row.name ?? id),
    slug: row.slug != null ? String(row.slug) : undefined,
    category: row.category != null ? String(row.category) : undefined,
  };
}
