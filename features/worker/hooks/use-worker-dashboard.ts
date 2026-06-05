"use client";

import { useQuery } from "@tanstack/react-query";
import { getWorkerDashboard } from "@/features/worker/api";
import { workerKeys } from "@/features/worker/query-keys";
import { useAuthSessionReady } from "@/lib/auth/use-auth-session-ready";

export function useWorkerDashboard() {
  const sessionReady = useAuthSessionReady();
  return useQuery({
    queryKey: workerKeys.dashboard(),
    queryFn: getWorkerDashboard,
    enabled: sessionReady,
  });
}
