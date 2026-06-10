import type { QueryClient } from "@tanstack/react-query";
import type { WorkerJobListItem } from "@/features/worker/types/worker-portal";
import { workerKeys } from "@/features/worker/query-keys";

function setJobSavedFlag(job: WorkerJobListItem, saved: boolean): WorkerJobListItem {
  return { ...job, saved, isSaved: saved };
}

export function patchJobSavedInCache(qc: QueryClient, jobId: string, saved: boolean) {
  qc.setQueriesData<{ items: WorkerJobListItem[]; total?: number; page?: number; limit?: number }>(
    { queryKey: workerKeys.jobs() },
    (prev) => {
      if (!prev?.items) return prev;
      return {
        ...prev,
        items: prev.items.map((job) =>
          job.id === jobId || job.slug === jobId ? setJobSavedFlag(job, saved) : job,
        ),
      };
    },
  );

  qc.setQueryData<WorkerJobListItem>(workerKeys.job(jobId), (prev) =>
    prev ? setJobSavedFlag(prev, saved) : prev,
  );
}
