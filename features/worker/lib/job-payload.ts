export {
  EMPTY_POST_JOB_DRAFT,
  formatPostJobStartPreview,
  normalizePostJobDraft,
  type PostJobDraft,
} from "@/features/employer/lib/job-form-mapper";

import { isDepartmentUuid, toApiStartDate } from "@/features/employer/lib/job-api-fields";
import {
  mapDraftToCreateJobBody,
  type PostJobDraft,
} from "@/features/employer/lib/job-form-mapper";
import type { CreateEmployerJobBody, EmployerJobDepartment } from "@/features/employer/types/employer-portal";

export function validateWorkerPostJobDraft(
  draft: PostJobDraft,
  options?: { asDraft?: boolean },
): string | null {
  if (options?.asDraft) {
    if (!draft.startNow && draft.startDate.trim() && !toApiStartDate(draft.startDate)) {
      return "INVALID_START_DATE";
    }
    return null;
  }
  if (!draft.department.trim() || !isDepartmentUuid(draft.department)) {
    return "INVALID_DEPARTMENT";
  }
  if (!draft.startNow && draft.startDate.trim() && !toApiStartDate(draft.startDate)) {
    return "INVALID_START_DATE";
  }
  return null;
}

/** Flat job body for `POST /worker/posted-jobs` (mirrors employer `POST /employer/jobs`). */
export function mapDraftToCreateWorkerJobBody(
  draft: PostJobDraft,
  asDraft: boolean,
  departments?: EmployerJobDepartment[],
): CreateEmployerJobBody {
  return mapDraftToCreateJobBody(draft, asDraft, departments);
}
