import type { QueryClient } from "@tanstack/react-query";
import type { WorkerJobDetail, WorkerJobListItem } from "@/features/worker/types/worker-portal";
import { workerKeys } from "@/features/worker/query-keys";

export function matchesWorkerJobId(
  job: { id?: string; slug?: string } | null | undefined,
  jobId: string,
): boolean {
  if (!job || !jobId) return false;
  return job.id === jobId || job.slug === jobId;
}

function matchesJobId(job: WorkerJobListItem, jobId: string): boolean {
  return matchesWorkerJobId(job, jobId);
}

function findInPagedQueries(
  qc: QueryClient,
  queryKeyPrefix: readonly unknown[],
  jobId: string,
): WorkerJobDetail | undefined {
  const entries = qc.getQueriesData<{ items?: WorkerJobListItem[] }>({ queryKey: queryKeyPrefix });
  for (const [, data] of entries) {
    const match = data?.items?.find((job) => matchesJobId(job, jobId));
    if (match) return match as WorkerJobDetail;
  }
  return undefined;
}

export function findWorkerJobInListCache(qc: QueryClient, jobId: string): WorkerJobDetail | undefined {
  return (
    findInPagedQueries(qc, workerKeys.jobs(), jobId) ??
    findInPagedQueries(qc, workerKeys.savedJobs(), jobId)
  );
}
