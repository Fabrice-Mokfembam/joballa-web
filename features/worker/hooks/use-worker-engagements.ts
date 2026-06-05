"use client";

import { useQuery } from "@tanstack/react-query";
import { getWorkerEngagement, getWorkerEngagements } from "@/features/worker/api";
import { workerKeys } from "@/features/worker/query-keys";
import { useAuthSessionReady } from "@/lib/auth/use-auth-session-ready";

export function useWorkerEngagements(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const sessionReady = useAuthSessionReady();
  return useQuery({
    queryKey: workerKeys.engagements(params),
    queryFn: () => getWorkerEngagements(params),
    enabled: sessionReady,
  });
}

export function useWorkerEngagement(engagementId: string) {
  const sessionReady = useAuthSessionReady();
  return useQuery({
    queryKey: workerKeys.engagement(engagementId),
    queryFn: () => getWorkerEngagement(engagementId),
    enabled: sessionReady && !!engagementId,
  });
}
