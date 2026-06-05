"use client";

import { useQuery } from "@tanstack/react-query";
import { getWorkerMe } from "@/features/worker/api";
import { workerKeys } from "@/features/worker/query-keys";
import { useAuthSessionReady } from "@/lib/auth/use-auth-session-ready";

export function useWorkerMe() {
  const sessionReady = useAuthSessionReady();
  return useQuery({
    queryKey: workerKeys.me(),
    queryFn: getWorkerMe,
    enabled: sessionReady,
  });
}

export function useWorkerProfileCompleteness(): number {
  const me = useWorkerMe();
  const v = me.data?.workerProfile?.profileCompleteness;
  return typeof v === "number" ? v : 0;
}
