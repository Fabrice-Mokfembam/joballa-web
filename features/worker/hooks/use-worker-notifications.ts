"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getWorkerNotificationSettings,
  getWorkerNotifications,
  patchWorkerNotificationRead,
  patchWorkerNotificationSettings,
} from "@/features/worker/api";
import { toastApiError } from "@/features/employer/lib/mutation-feedback";
import { workerKeys } from "@/features/worker/query-keys";
import type { WorkerNotificationSettings } from "@/features/worker/types/worker-portal";
import { useAuthSessionReady } from "@/lib/auth/use-auth-session-ready";

export function useWorkerNotifications(params?: { filter?: string; page?: number; limit?: number }) {
  const sessionReady = useAuthSessionReady();
  return useQuery({
    queryKey: workerKeys.notifications(params),
    queryFn: () => getWorkerNotifications(params),
    enabled: sessionReady,
  });
}

export function useWorkerNotificationSettings() {
  const sessionReady = useAuthSessionReady();
  return useQuery({
    queryKey: workerKeys.notificationSettings(),
    queryFn: getWorkerNotificationSettings,
    enabled: sessionReady,
  });
}

export function usePatchWorkerNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => patchWorkerNotificationRead(notificationId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: workerKeys.notifications() });
    },
    onError: (e) => toastApiError(e, "Could not mark notification as read."),
  });
}

export function usePatchWorkerNotificationSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: WorkerNotificationSettings) => patchWorkerNotificationSettings(body),
    onSuccess: (data) => {
      qc.setQueryData(workerKeys.notificationSettings(), data);
    },
    onError: (e) => toastApiError(e, "Could not update notification settings."),
  });
}
