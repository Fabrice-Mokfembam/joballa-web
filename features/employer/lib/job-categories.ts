import type { EmployerJobDepartment } from "@/features/employer/types/employer-portal";
import { mergeJobDepartments } from "@/features/employer/lib/job-departments";

/** Values sent to the API via `departments.category` / job department FK lookup. */
export const JOB_POST_CATEGORY_VALUES = [
  "education",
  "domestic",
  "logistics",
  "events",
  "agriculture",
  "construction",
  "software_tech",
  "other",
] as const;

export type JobPostCategory = (typeof JOB_POST_CATEGORY_VALUES)[number];

export function isJobPostCategory(value: string): value is JobPostCategory {
  return (JOB_POST_CATEGORY_VALUES as readonly string[]).includes(value);
}

export function resolveDepartmentIdForCategory(
  category: string,
  departments: EmployerJobDepartment[],
): string | undefined {
  const slug = category.trim().toLowerCase();
  if (!slug) return undefined;

  const match = departments.find((dept) => String(dept.category ?? "").toLowerCase() === slug);
  if (match?.id) return match.id;

  if (slug === "other") {
    const otherDept = departments.find(
      (dept) =>
        String(dept.slug ?? "").toLowerCase() === "other" ||
        String(dept.category ?? "").toLowerCase() === "other",
    );
    if (otherDept?.id) return otherDept.id;
  }

  return undefined;
}

export function categoryLabelKey(category: string): string {
  return isJobPostCategory(category) ? category : "other";
}

export function displayCategoryLabel(
  category: string,
  categoryCustom: string,
  translate: (key: string) => string,
): string {
  if (category === "other") {
    return categoryCustom.trim() || translate("options.category.other");
  }
  if (isJobPostCategory(category)) {
    return translate(`options.category.${category}`);
  }
  return categoryCustom.trim() || category;
}

export function syncDepartmentForCategory(
  category: string,
  departments: EmployerJobDepartment[],
): string {
  return resolveDepartmentIdForCategory(category, mergeJobDepartments(departments)) ?? "";
}

export function inferCategoryFromJob(
  department?: EmployerJobDepartment | null,
  departmentId?: string,
): { category: JobPostCategory | ""; categoryCustom: string } {
  const slug = String(department?.category ?? "").toLowerCase();
  if (isJobPostCategory(slug)) {
    return { category: slug, categoryCustom: "" };
  }
  if (department?.name && departmentId) {
    return { category: "other", categoryCustom: department.name };
  }
  return { category: "", categoryCustom: "" };
}
