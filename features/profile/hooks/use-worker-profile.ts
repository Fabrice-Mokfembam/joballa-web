"use client";

import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { useWorkerFullProfile, usePatchWorkerPersonalInfo } from "@/features/worker/hooks";
import { workerKeys } from "@/features/worker/query-keys";
import { mapPortalProfileToLegacy } from "@/features/profile/lib/map-worker-portal-profile";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { WorkerProfile } from "@/lib/types";

type ProfileQueryKey = ["worker-profile", string | null];

/** @deprecated Prefer `useWorkerFullProfile` from `@/features/worker/hooks`. */
export function useWorkerProfile(options?: { token?: string | null; enabled?: boolean }) {
  const storeToken = useAuthStore((s) => s.accessToken);
  const token = options?.token ?? storeToken;
  const portal = useWorkerFullProfile({ enabled: !!token && (options?.enabled ?? true) });

  return {
    ...portal,
    queryKey: ["worker-profile", token] as ProfileQueryKey,
    data: portal.data ? mapPortalProfileToLegacy(portal.data) : undefined,
  };
}

/** @deprecated Prefer granular portal patch hooks from `@/features/worker/hooks`. */
export function usePatchWorkerProfile(
  options?: Omit<
    UseMutationOptions<WorkerProfile, Error, { body: Record<string, unknown>; token?: string | null }>,
    "mutationFn"
  >,
) {
  const qc = useQueryClient();
  const patchPersonal = usePatchWorkerPersonalInfo();
  const { onSuccess, ...rest } = options ?? {};

  return useMutation({
    ...rest,
    mutationFn: async ({ body }) => {
      if ("skills" in body && Array.isArray(body.skills)) {
        const { patchWorkerSkills } = await import("@/features/worker/api");
        const updated = await patchWorkerSkills({ skills: body.skills as string[] });
        return mapPortalProfileToLegacy(updated);
      }
      const updated = await patchPersonal.mutateAsync({
        firstName: typeof body.firstName === "string" ? body.firstName : undefined,
        lastName: typeof body.lastName === "string" ? body.lastName : undefined,
        city: typeof body.city === "string" ? body.city : undefined,
        region: typeof body.region === "string" ? body.region : undefined,
        languages: Array.isArray(body.languagesSpoken)
          ? (body.languagesSpoken as string[])
          : undefined,
      });
      return mapPortalProfileToLegacy(updated);
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      void qc.invalidateQueries({ queryKey: workerKeys.profile() });
      void qc.invalidateQueries({ queryKey: ["worker-profile"] });
      onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
