import type { EmployerJobDepartment } from "@/features/employer/types/employer-portal";

/** Optional dev fallback when `GET /employer/departments` is unavailable. */
function parseEnvDepartments(): EmployerJobDepartment[] {
  const raw = process.env.NEXT_PUBLIC_JOB_DEPARTMENTS_JSON;
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const rows: EmployerJobDepartment[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      const id = String(row.id ?? "").trim();
      if (!id) continue;
      rows.push({
        id,
        name: String(row.name ?? id),
        slug: row.slug != null ? String(row.slug) : undefined,
        category: row.category != null ? String(row.category) : undefined,
      });
    }
    return rows;
  } catch {
    return [];
  }
}

export function mergeJobDepartments(
  ...sources: Array<EmployerJobDepartment[] | undefined>
): EmployerJobDepartment[] {
  const map = new Map<string, EmployerJobDepartment>();
  for (const list of [parseEnvDepartments(), ...sources]) {
    for (const dept of list ?? []) {
      if (dept.id) map.set(dept.id, dept);
    }
  }
  return [...map.values()];
}

export function findJobDepartment(
  departments: EmployerJobDepartment[],
  id: string,
): EmployerJobDepartment | undefined {
  return departments.find((dept) => dept.id === id);
}
