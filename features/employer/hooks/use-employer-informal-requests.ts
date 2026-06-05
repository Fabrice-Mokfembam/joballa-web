"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createEmployerInformalRequest, getEmployerInformalRequests } from "@/features/employer/api";
import type { CreateInformalJobRequest } from "@/features/employer/types/employer-portal";
import { useAuthSessionReady } from "@/lib/auth/use-auth-session-ready";

const informalKeys = {
  all: ["employer", "informal-requests"] as const,
  list: (params?: { page?: number; limit?: number }) =>
    [...informalKeys.all, "list", params] as const,
};

export function useEmployerInformalRequests(params?: { page?: number; limit?: number }) {
  const sessionReady = useAuthSessionReady();
  return useQuery({
    queryKey: informalKeys.list(params),
    queryFn: () => getEmployerInformalRequests(params),
    enabled: sessionReady,
  });
}

export function useCreateEmployerInformalRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateInformalJobRequest) => createEmployerInformalRequest(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: informalKeys.all });
    },
  });
}
