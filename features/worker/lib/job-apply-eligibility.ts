import type { WorkerJobCard } from "@/lib/worker-job-data";

export function isWorkerOwnJobCard(job: Pick<WorkerJobCard, "isOwnJob">): boolean {
  return !!job.isOwnJob;
}

export function canShowWorkerJobApply(job: WorkerJobCard, applied: boolean): boolean {
  return !applied && !isWorkerOwnJobCard(job);
}
