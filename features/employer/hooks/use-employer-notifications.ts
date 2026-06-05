"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getEmployerNotificationSettings,
  getEmployerNotifications,
  patchEmployerNotificationRead,
  patchEmployerNotificationSettings,
} from "@/features/employer/api";
import { toastApiError } from "@/features/employer/lib/mutation-feedback";
import { employerKeys } from "@/features/employer/query-keys";
import type { EmployerNotificationSettings } from "@/features/employer/types/employer-portal";
import { useAuthSessionReady } from "@/lib/auth/use-auth-session-ready";

export function useEmployerNotifications(params?: {
  filter?: string;
  page?: number;
  limit?: number;
}) {
  const sessionReady = useAuthSessionReady();
  return useQuery({
    queryKey: employerKeys.notifications(params),
    queryFn: () => getEmployerNotifications(params),
    enabled: sessionReady,
  });
}

export function useEmployerNotificationSettings() {
  const sessionReady = useAuthSessionReady();
  return useQuery({
    queryKey: employerKeys.notificationSettings(),
    queryFn: getEmployerNotificationSettings,
    enabled: sessionReady,
  });
}

export function usePatchEmployerNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => patchEmployerNotificationRead(notificationId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: employerKeys.notifications() });
    },
    onError: (e) => toastApiError(e, "Could not mark notification as read."),
  });
}

export function usePatchEmployerNotificationSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: EmployerNotificationSettings) => patchEmployerNotificationSettings(body),
    onSuccess: (data) => {
      qc.setQueryData(employerKeys.notificationSettings(), data);
    },
    onError: (e) => toastApiError(e, "Could not update notification settings."),
  });
}
