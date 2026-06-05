"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  archiveWorkerApplication,
  getWorkerApplication,
  getWorkerApplications,
} from "@/features/worker/api";
import { toastApiError, toastSuccess } from "@/features/employer/lib/mutation-feedback";
import { workerKeys } from "@/features/worker/query-keys";
import { useAuthSessionReady } from "@/lib/auth/use-auth-session-ready";

export function useWorkerApplications(params?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  const sessionReady = useAuthSessionReady();
  return useQuery({
    queryKey: workerKeys.applications(params),
    queryFn: () => getWorkerApplications(params),
    enabled: sessionReady,
  });
}

export function useWorkerApplication(applicationId: string) {
  const sessionReady = useAuthSessionReady();
  return useQuery({
    queryKey: workerKeys.application(applicationId),
    queryFn: () => getWorkerApplication(applicationId),
    enabled: sessionReady && !!applicationId,
  });
}

export function useArchiveWorkerApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) => archiveWorkerApplication(applicationId),
    onSuccess: () => {
      toastSuccess("Application archived.");
      void qc.invalidateQueries({ queryKey: workerKeys.applications() });
    },
    onError: (e) => toastApiError(e, "Could not archive application."),
  });
}
