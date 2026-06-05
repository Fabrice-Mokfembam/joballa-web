"use client";

import { useQuery } from "@tanstack/react-query";
import { getEmployerDashboard } from "@/features/employer/api";
import { employerKeys } from "@/features/employer/query-keys";
import { useAuthStore } from "@/lib/stores/auth-store";

export function useEmployerDashboard() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: employerKeys.dashboard(),
    queryFn: getEmployerDashboard,
    enabled: !!token,
  });
}
