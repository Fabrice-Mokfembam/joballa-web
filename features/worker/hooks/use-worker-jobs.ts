"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  applyToWorkerJob,
  customizeJobApplicationProfile,
  getJobApplicationProfileDraft,
  getWorkerJob,
  getWorkerJobShareLink,
  hideWorkerJob,
  putJobApplicationProfileDraft,
  reportWorkerJob,
  saveWorkerJob,
  searchWorkerJobs,
  unhideWorkerJob,
  unsaveWorkerJob,
} from "@/features/worker/api";
import { toastApiError, toastSuccess } from "@/features/employer/lib/mutation-feedback";
import { patchJobSavedInCache } from "@/features/worker/lib/saved-jobs-cache";
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
    onMutate: async (jobId) => {
      patchJobSavedInCache(qc, jobId, true);
    },
    onSuccess: (_d, jobId) => {
      toastSuccess("Job saved.");
      void qc.invalidateQueries({ queryKey: workerKeys.savedJobs() });
    },
    onError: (e, jobId) => {
      patchJobSavedInCache(qc, jobId, false);
      toastApiError(e, "Could not save job.");
    },
  });
}

export function useUnsaveWorkerJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => unsaveWorkerJob(jobId),
    onMutate: async (jobId) => {
      patchJobSavedInCache(qc, jobId, false);
    },
    onSuccess: (_d, jobId) => {
      toastSuccess("Removed from saved jobs.");
      void qc.invalidateQueries({ queryKey: workerKeys.savedJobs() });
    },
    onError: (e, jobId) => {
      patchJobSavedInCache(qc, jobId, true);
      toastApiError(e, "Could not remove saved job.");
    },
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

export function useJobApplicationProfileDraft(jobId: string) {
  const sessionReady = useAuthSessionReady();
  return useQuery({
    queryKey: workerKeys.applicationProfileDraft(jobId),
    queryFn: () => getJobApplicationProfileDraft(jobId),
    enabled: sessionReady && !!jobId,
  });
}

export function usePutJobApplicationProfileDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, body }: { jobId: string; body: CustomizeProfileBody }) =>
      putJobApplicationProfileDraft(jobId, body),
    onSuccess: (_data, { jobId }) => {
      void qc.invalidateQueries({ queryKey: workerKeys.applicationProfileDraft(jobId) });
    },
    onError: (e) => toastApiError(e, "Could not save application draft."),
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
    onSuccess: (_data, { jobId }) => {
      toastSuccess("Application submitted.");
      void qc.invalidateQueries({ queryKey: workerKeys.applications() });
      void qc.invalidateQueries({ queryKey: workerKeys.applicationProfileDraft(jobId) });
      void qc.invalidateQueries({ queryKey: workerKeys.me() });
      void qc.invalidateQueries({ queryKey: workerKeys.notifications() });
      void qc.invalidateQueries({ queryKey: workerKeys.notificationsUnreadCount() });
    },
    onError: (e) => toastApiError(e, "Could not submit application."),
  });
}
