"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bulkDeleteSavedJobs, deleteSavedJob, getSavedJobs } from "@/features/worker/api";
import { toastApiError, toastSuccess } from "@/features/employer/lib/mutation-feedback";
import { workerKeys } from "@/features/worker/query-keys";
import type { JobSearchParams } from "@/features/worker/types/worker-portal";
import { useAuthSessionReady } from "@/lib/auth/use-auth-session-ready";

export function useSavedJobs(params?: JobSearchParams) {
  const sessionReady = useAuthSessionReady();
  return useQuery({
    queryKey: workerKeys.savedJobs(params),
    queryFn: () => getSavedJobs(params),
    enabled: sessionReady,
  });
}

export function useDeleteSavedJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => deleteSavedJob(jobId),
    onSuccess: () => {
      toastSuccess("Removed from saved jobs.");
      void qc.invalidateQueries({ queryKey: workerKeys.savedJobs() });
      void qc.invalidateQueries({ queryKey: workerKeys.jobs() });
    },
    onError: (e) => toastApiError(e, "Could not remove saved job."),
  });
}

export function useBulkDeleteSavedJobs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobIds: string[]) => bulkDeleteSavedJobs({ jobIds }),
    onSuccess: () => {
      toastSuccess("Saved jobs updated.");
      void qc.invalidateQueries({ queryKey: workerKeys.savedJobs() });
    },
    onError: (e) => toastApiError(e, "Could not update saved jobs."),
  });
}
