"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  applyToWorkerJob,
  customizeJobApplicationProfile,
  getWorkerJob,
  getWorkerJobShareLink,
  hideWorkerJob,
  reportWorkerJob,
  saveWorkerJob,
  searchWorkerJobs,
  unhideWorkerJob,
  unsaveWorkerJob,
} from "@/features/worker/api";
import { toastApiError, toastSuccess } from "@/features/employer/lib/mutation-feedback";
import { workerKeys } from "@/features/worker/query-keys";
import type {
  ApplyToJobBody,
  CustomizeProfileBody,
  JobReportBody,
  JobSearchParams,
} from "@/features/worker/types/worker-portal";
import { useAuthSessionReady } from "@/lib/auth/use-auth-session-ready";

export function useWorkerJobSearch(params?: JobSearchParams) {
  const sessionReady = useAuthSessionReady();
  return useQuery({
    queryKey: workerKeys.jobs(params),
    queryFn: () => searchWorkerJobs(params),
    enabled: sessionReady,
  });
}

export function useWorkerJob(jobId: string) {
  const sessionReady = useAuthSessionReady();
  return useQuery({
    queryKey: workerKeys.job(jobId),
    queryFn: () => getWorkerJob(jobId),
    enabled: sessionReady && !!jobId,
  });
}

export function useWorkerJobShare(jobId: string) {
  const sessionReady = useAuthSessionReady();
  return useQuery({
    queryKey: workerKeys.jobShare(jobId),
    queryFn: () => getWorkerJobShareLink(jobId),
    enabled: sessionReady && !!jobId,
  });
}

export function useSaveWorkerJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => saveWorkerJob(jobId),
    onSuccess: (_d, jobId) => {
      toastSuccess("Job saved.");
      void qc.invalidateQueries({ queryKey: workerKeys.job(jobId) });
      void qc.invalidateQueries({ queryKey: workerKeys.jobs() });
      void qc.invalidateQueries({ queryKey: workerKeys.savedJobs() });
    },
    onError: (e) => toastApiError(e, "Could not save job."),
  });
}

export function useUnsaveWorkerJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => unsaveWorkerJob(jobId),
    onSuccess: (_d, jobId) => {
      toastSuccess("Removed from saved jobs.");
      void qc.invalidateQueries({ queryKey: workerKeys.job(jobId) });
      void qc.invalidateQueries({ queryKey: workerKeys.jobs() });
      void qc.invalidateQueries({ queryKey: workerKeys.savedJobs() });
    },
    onError: (e) => toastApiError(e, "Could not remove saved job."),
  });
}

export function useHideWorkerJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => hideWorkerJob(jobId),
    onSuccess: () => {
      toastSuccess("Job hidden from your feed.");
      void qc.invalidateQueries({ queryKey: workerKeys.jobs() });
    },
    onError: (e) => toastApiError(e, "Could not hide job."),
  });
}

export function useUnhideWorkerJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => unhideWorkerJob(jobId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: workerKeys.jobs() });
    },
    onError: (e) => toastApiError(e, "Could not unhide job."),
  });
}

export function useReportWorkerJob() {
  return useMutation({
    mutationFn: ({ jobId, body }: { jobId: string; body: JobReportBody }) => reportWorkerJob(jobId, body),
    onSuccess: () => toastSuccess("Report submitted. Thank you."),
    onError: (e) => toastApiError(e, "Could not submit report."),
  });
}

export function useCustomizeJobApplication() {
  return useMutation({
    mutationFn: ({ jobId, body }: { jobId: string; body: CustomizeProfileBody }) =>
      customizeJobApplicationProfile(jobId, body),
    onError: (e) => toastApiError(e, "Could not save application draft."),
  });
}

export function useApplyToJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, body }: { jobId: string; body?: ApplyToJobBody }) => applyToWorkerJob(jobId, body),
    onSuccess: () => {
      toastSuccess("Application submitted.");
      void qc.invalidateQueries({ queryKey: workerKeys.applications() });
      void qc.invalidateQueries({ queryKey: workerKeys.me() });
    },
    onError: (e) => toastApiError(e, "Could not submit application."),
  });
}
