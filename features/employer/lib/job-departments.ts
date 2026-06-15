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

function normalizeDepartmentLabel(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s*&\s*/g, " and ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Map a UI department label (or slug/category) to the department UUID for API filters. */
export function resolveDepartmentIdByLabel(
  label: string,
  departments: EmployerJobDepartment[],
): string | undefined {
  const trimmed = label.trim();
  if (!trimmed) return undefined;

  const byId = departments.find((dept) => dept.id === trimmed);
  if (byId?.id) return byId.id;

  const lower = trimmed.toLowerCase();
  const byName = departments.find((dept) => String(dept.name ?? "").toLowerCase() === lower);
  if (byName?.id) return byName.id;

  const normalized = normalizeDepartmentLabel(trimmed);
  const byNormalized = departments.find(
    (dept) => normalizeDepartmentLabel(String(dept.name ?? "")) === normalized,
  );
  if (byNormalized?.id) return byNormalized.id;

  for (const slug of [
    lower.replace(/\s+/g, "-"),
    lower.replace(/&/g, "").replace(/\s+/g, "-").replace(/-+/g, "-"),
    lower.replace(/[\s&]+/g, "-").replace(/-+/g, "-"),
  ]) {
    const bySlug = departments.find((dept) => String(dept.slug ?? "").toLowerCase() === slug);
    if (bySlug?.id) return bySlug.id;
  }

  const categorySlug = lower.replace(/[\s&]+/g, "_").replace(/_+/g, "_");
  const byCategory = departments.find(
    (dept) => String(dept.category ?? "").toLowerCase() === categorySlug,
  );
  return byCategory?.id;
}
