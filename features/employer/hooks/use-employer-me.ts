"use client";

import { useQuery } from "@tanstack/react-query";
import { getEmployerMe } from "@/features/employer/api";
import { employerKeys } from "@/features/employer/query-keys";
import { useAuthStore } from "@/lib/stores/auth-store";

export function useEmployerMe() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: employerKeys.me(),
    queryFn: getEmployerMe,
    enabled: !!token,
  });
}
