"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getEmployerWorkforce,
  getEmployerWorkforceWorker,
  patchEmployerWorkforceStatus,
} from "@/features/employer/api";
import { toastApiError, toastSuccess } from "@/features/employer/lib/mutation-feedback";
import { employerKeys } from "@/features/employer/query-keys";
import type { UpdateWorkforceStatusBody } from "@/features/employer/types/employer-portal";
import { useAuthStore } from "@/lib/stores/auth-store";

export function useEmployerWorkforce(params?: { status?: string; page?: number; limit?: number }) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: employerKeys.workforce(params),
    queryFn: () => getEmployerWorkforce(params),
    enabled: !!token,
  });
}

export function useEmployerWorkforceWorker(workerId: string) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: employerKeys.workforceWorker(workerId),
    queryFn: () => getEmployerWorkforceWorker(workerId),
    enabled: !!token && !!workerId,
  });
}

export function usePatchEmployerWorkforceStatus(workerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateWorkforceStatusBody) => patchEmployerWorkforceStatus(workerId, body),
    onSuccess: () => {
      toastSuccess("Worker status updated.");
      void qc.invalidateQueries({ queryKey: employerKeys.workforceWorker(workerId) });
      void qc.invalidateQueries({ queryKey: employerKeys.workforce() });
      void qc.invalidateQueries({ queryKey: employerKeys.dashboard() });
    },
    onError: (e) => toastApiError(e, "Could not update worker status."),
  });
}
