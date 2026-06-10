export {
  EMPTY_POST_JOB_DRAFT,
  formatPostJobStartPreview,
  normalizePostJobDraft,
  type PostJobDraft,
} from "@/features/employer/lib/job-form-mapper";

import { isDepartmentUuid, toApiStartDate } from "@/features/employer/lib/job-api-fields";
import { findJobDepartment } from "@/features/employer/lib/job-departments";
import {
  mapDraftToCreateJobBody,
  type PostJobDraft,
} from "@/features/employer/lib/job-form-mapper";
import type {
  CreateInformalJobRequest,
  EmployerJobDepartment,
} from "@/features/employer/types/employer-portal";

const INFORMAL_CATEGORIES = new Set<CreateInformalJobRequest["departmentCategory"]>([
  "education",
  "domestic",
  "logistics",
  "events",
  "agriculture",
  "construction",
  "other",
]);

export function toInformalDepartmentCategory(
  raw?: string | null,
): CreateInformalJobRequest["departmentCategory"] {
  const normalized = String(raw ?? "other")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (normalized === "software_tech") return "other";
  if (INFORMAL_CATEGORIES.has(normalized as CreateInformalJobRequest["departmentCategory"])) {
    return normalized as CreateInformalJobRequest["departmentCategory"];
  }
  return "other";
}

export function validateWorkerPostJobDraft(draft: PostJobDraft): string | null {
  if (!draft.department.trim() || !isDepartmentUuid(draft.department)) {
    return "INVALID_DEPARTMENT";
  }
  if (!draft.startNow && draft.startDate.trim() && !toApiStartDate(draft.startDate)) {
    return "INVALID_START_DATE";
  }
  return null;
}

export function mapDraftToCreateWorkerJobBody(
  draft: PostJobDraft,
  asDraft: boolean,
  departments?: EmployerJobDepartment[],
): CreateInformalJobRequest {
  const flat = mapDraftToCreateJobBody(draft, asDraft, departments);
  const dept = findJobDepartment(departments ?? [], flat.departmentId);
  return {
    departmentId: flat.departmentId,
    departmentCategory: toInformalDepartmentCategory(dept?.category),
    paymentManagedByJoballa: true,
    formData: { ...flat },
  };
}
