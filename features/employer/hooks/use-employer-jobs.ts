"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEmployerJob,
  deleteEmployerJob,
  getEmployerJob,
  getEmployerJobs,
  patchEmployerJob,
  patchEmployerJobStatus,
  saveEmployerJobDraft,
} from "@/features/employer/api";
import { toastApiError, toastSuccess } from "@/features/employer/lib/mutation-feedback";
import { employerKeys } from "@/features/employer/query-keys";
import type { CreateEmployerJobBody, UpdateEmployerJobBody } from "@/features/employer/types/employer-portal";
import { useAuthStore } from "@/lib/stores/auth-store";

export function useEmployerJobs(params?: { status?: string; page?: number; limit?: number }) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: employerKeys.jobs(params),
    queryFn: () => getEmployerJobs(params),
    enabled: !!token,
  });
}

export function useEmployerJob(jobId: string) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: employerKeys.job(jobId),
    queryFn: () => getEmployerJob(jobId),
    enabled: !!token && !!jobId,
  });
}

export function useCreateEmployerJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateEmployerJobBody) => createEmployerJob(body),
    onSuccess: (data) => {
      if (data.message) {
        toastSuccess(data.message);
      }
      void qc.invalidateQueries({ queryKey: employerKeys.jobs() });
      void qc.invalidateQueries({ queryKey: employerKeys.dashboard() });
    },
    onError: (e) => toastApiError(e, "Could not create job."),
  });
}

export function usePatchEmployerJob(jobId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateEmployerJobBody) => patchEmployerJob(jobId, body),
    onSuccess: (data) => {
      toastSuccess("Job updated.");
      qc.setQueryData(employerKeys.job(jobId), data);
      void qc.invalidateQueries({ queryKey: employerKeys.jobs() });
      void qc.invalidateQueries({ queryKey: employerKeys.dashboard() });
    },
    onError: (e) => toastApiError(e, "Could not update job."),
  });
}

export function usePatchEmployerJobStatus(jobId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: string) => patchEmployerJobStatus(jobId, status),
    onSuccess: (data) => {
      toastSuccess("Job status updated.");
      qc.setQueryData(employerKeys.job(jobId), data);
      void qc.invalidateQueries({ queryKey: employerKeys.jobs() });
      void qc.invalidateQueries({ queryKey: employerKeys.dashboard() });
    },
    onError: (e) => toastApiError(e, "Could not update job status."),
  });
}

export function useSaveEmployerJobDraft(jobId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateEmployerJobBody) => saveEmployerJobDraft(jobId, body),
    onSuccess: () => {
      toastSuccess("Draft saved.");
      void qc.invalidateQueries({ queryKey: employerKeys.job(jobId) });
      void qc.invalidateQueries({ queryKey: employerKeys.jobs() });
    },
    onError: (e) => toastApiError(e, "Could not save draft."),
  });
}

export function useDeleteEmployerJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => deleteEmployerJob(jobId),
    onSuccess: () => {
      toastSuccess("Job deleted.");
      void qc.invalidateQueries({ queryKey: employerKeys.jobs() });
      void qc.invalidateQueries({ queryKey: employerKeys.dashboard() });
    },
    onError: (e) => toastApiError(e, "Could not delete job."),
  });
}
