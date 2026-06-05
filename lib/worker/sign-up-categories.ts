import type { JobType } from "@/lib/types/enums";

/** Sector chips shown during worker sign-up (interests + jobs to post). */
export const WORKER_SIGN_UP_CATEGORY_SLUGS = [
  "retail",
  "hospitality",
  "logistics",
  "healthcare",
  "education",
  "technology",
  "construction",
  "domestic",
  "agriculture",
  "events",
  "sales",
  "security",
] as const;

export type WorkerSignUpCategorySlug = (typeof WORKER_SIGN_UP_CATEGORY_SLUGS)[number];

/** Employment kinds for jobs the worker plans to post. */
export const WORKER_SIGN_UP_JOB_TYPE_SLUGS = [
  "full_time",
  "part_time",
  "contract",
  "casual",
  "seasonal",
  "internship",
] as const;

export type WorkerSignUpJobTypeSlug = (typeof WORKER_SIGN_UP_JOB_TYPE_SLUGS)[number];

const JOB_TYPE_BY_SLUG: Record<WorkerSignUpJobTypeSlug, JobType> = {
  full_time: "FULL_TIME",
  part_time: "PART_TIME",
  contract: "CONTRACT",
  casual: "CASUAL",
  seasonal: "SEASONAL",
  internship: "INTERNSHIP",
};

type CategoryLabelFn = (slug: WorkerSignUpCategorySlug) => string;

export function categorySlugsToLabels(
  slugs: Iterable<string>,
  labelForSlug: CategoryLabelFn,
): string[] {
  const out: string[] = [];
  for (const slug of slugs) {
    if (!WORKER_SIGN_UP_CATEGORY_SLUGS.includes(slug as WorkerSignUpCategorySlug)) continue;
    out.push(labelForSlug(slug as WorkerSignUpCategorySlug));
  }
  return out;
}

export function jobTypeSlugsToEnums(slugs: Iterable<string>): JobType[] {
  const out: JobType[] = [];
  for (const slug of slugs) {
    if (!WORKER_SIGN_UP_JOB_TYPE_SLUGS.includes(slug as WorkerSignUpJobTypeSlug)) continue;
    out.push(JOB_TYPE_BY_SLUG[slug as WorkerSignUpJobTypeSlug]);
  }
  return out;
}
