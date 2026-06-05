"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { getAuthMe } from "@/features/auth/api/auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { AuthMeResponse } from "@/lib/types/auth";

type AuthMeQueryKey = ["auth", "me"];

export function useAuthMe(
  options?: Omit<
    UseQueryOptions<AuthMeResponse, Error, AuthMeResponse, AuthMeQueryKey>,
    "queryKey" | "queryFn"
  >
) {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    ...options,
    queryKey: ["auth", "me"],
    queryFn: () => getAuthMe(),
    enabled: !!accessToken && (options?.enabled ?? true),
  });
}
