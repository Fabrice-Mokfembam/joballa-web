/** Display helpers for employer job timing / duration fields (API uses `startNow` + `duration` string). */

type JobTimingFields = {
  startDate?: string | null;
  startNow?: boolean;
  /** @deprecated demo-only — prefer `startNow` */
  startAsap?: boolean;
};

type JobDurationFields = {
  duration?: string | null;
  /** @deprecated demo-only — API returns a single `duration` string */
  durationValue?: number;
  durationUnit?: string;
};

export function employerJobStartNow(job: JobTimingFields): boolean {
  return Boolean(job.startNow ?? job.startAsap);
}

export function employerJobStartDateLabel(job: JobTimingFields): string {
  if (employerJobStartNow(job)) return "As soon as possible";
  if (job.startDate) return String(job.startDate);
  return "—";
}

export function employerJobDurationLabel(job: JobDurationFields): string {
  const duration = typeof job.duration === "string" ? job.duration.trim() : "";
  if (duration) return duration;
  if (job.durationValue != null && job.durationUnit) {
    return `${job.durationValue} ${String(job.durationUnit).toLowerCase()}`;
  }
  return "—";
}
