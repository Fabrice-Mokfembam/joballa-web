"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  getEmployerProfile,
  patchEmployerProfile,
} from "@/features/profile/api/employer-profile";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { EmployerProfile } from "@/lib/types";

type ProfileQueryKey = ["employer-profile", string | null];

export function useEmployerProfile(
  options?: {
    token?: string | null;
  } & Omit<
    UseQueryOptions<EmployerProfile, Error, EmployerProfile, ProfileQueryKey>,
    "queryKey" | "queryFn"
  >
) {
  const storeToken = useAuthStore((s) => s.accessToken);
  const { token: tokenFromOptions, ...queryOptions } = options ?? {};
  const token = tokenFromOptions ?? storeToken;

  return useQuery({
    ...queryOptions,
    queryKey: ["employer-profile", token],
    queryFn: () => getEmployerProfile(token),
    enabled: !!token && (queryOptions.enabled ?? true),
  });
}

export function usePatchEmployerProfile(
  options?: Omit<
    UseMutationOptions<EmployerProfile, Error, { body: Record<string, unknown>; token?: string | null }>,
    "mutationFn"
  >
) {
  const storeToken = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};

  return useMutation({
    ...rest,
    mutationFn: async ({ body, token }) => {
      const t = token ?? storeToken;
      return patchEmployerProfile(t, body);
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      void qc.invalidateQueries({ queryKey: ["employer-profile"] });
      onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
