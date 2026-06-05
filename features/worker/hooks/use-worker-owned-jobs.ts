"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createWorkerJob,
  deleteWorkerOwnedJob,
  getWorkerIncomingApplication,
  getWorkerIncomingApplications,
  getWorkerOwnedJob,
  getWorkerOwnedJobs,
  patchWorkerOwnedJob,
  patchWorkerOwnedJobStatus,
} from "@/features/worker/api";
import { toastApiError, toastSuccess } from "@/features/employer/lib/mutation-feedback";
import { workerKeys } from "@/features/worker/query-keys";
import type { CreateWorkerJobBody, UpdateWorkerJobBody } from "@/features/worker/types/worker-portal";
import { useAuthSessionReady } from "@/lib/auth/use-auth-session-ready";

export function useWorkerOwnedJobs(params?: { status?: string; page?: number; limit?: number }) {
  const sessionReady = useAuthSessionReady();
  return useQuery({
    queryKey: workerKeys.ownedJobs(params),
    queryFn: () => getWorkerOwnedJobs(params),
    enabled: sessionReady,
  });
}

export function useWorkerOwnedJob(jobId: string) {
  const sessionReady = useAuthSessionReady();
  return useQuery({
    queryKey: workerKeys.ownedJob(jobId),
    queryFn: () => getWorkerOwnedJob(jobId),
    enabled: sessionReady && !!jobId,
  });
}

export function useCreateWorkerJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateWorkerJobBody) => createWorkerJob(body),
    onSuccess: (data) => {
      if (data.message) toastSuccess(data.message);
      void qc.invalidateQueries({ queryKey: workerKeys.ownedJobs() });
    },
    onError: (e) => toastApiError(e, "Could not create job."),
  });
}

export function usePatchWorkerOwnedJob(jobId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateWorkerJobBody) => patchWorkerOwnedJob(jobId, body),
    onSuccess: () => {
      toastSuccess("Job updated.");
      void qc.invalidateQueries({ queryKey: workerKeys.ownedJob(jobId) });
      void qc.invalidateQueries({ queryKey: workerKeys.ownedJobs() });
    },
    onError: (e) => toastApiError(e, "Could not update job."),
  });
}

export function usePatchWorkerOwnedJobStatus(jobId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: string) => patchWorkerOwnedJobStatus(jobId, status),
    onSuccess: () => {
      toastSuccess("Job status updated.");
      void qc.invalidateQueries({ queryKey: workerKeys.ownedJob(jobId) });
      void qc.invalidateQueries({ queryKey: workerKeys.ownedJobs() });
    },
    onError: (e) => toastApiError(e, "Could not update job status."),
  });
}

export function useDeleteWorkerOwnedJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => deleteWorkerOwnedJob(jobId),
    onSuccess: () => {
      toastSuccess("Job deleted.");
      void qc.invalidateQueries({ queryKey: workerKeys.ownedJobs() });
    },
    onError: (e) => toastApiError(e, "Could not delete job."),
  });
}

export function useWorkerIncomingApplications(params?: {
  status?: string;
  keyword?: string;
  jobId?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}) {
  const sessionReady = useAuthSessionReady();
  const queryParams = {
    status: params?.status,
    keyword: params?.keyword,
    jobId: params?.jobId,
    page: params?.page,
    limit: params?.limit,
  };
  return useQuery({
    queryKey: workerKeys.incomingApplications(queryParams),
    queryFn: () => getWorkerIncomingApplications(queryParams),
    enabled: sessionReady && params?.enabled !== false,
  });
}

export function useWorkerIncomingApplication(applicationId: string) {
  const sessionReady = useAuthSessionReady();
  return useQuery({
    queryKey: workerKeys.incomingApplication(applicationId),
    queryFn: () => getWorkerIncomingApplication(applicationId),
    enabled: sessionReady && !!applicationId,
  });
}
