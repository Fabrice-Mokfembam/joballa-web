"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEmployerDepartments } from "@/features/employer/api";
import { CANONICAL_JOB_DEPARTMENTS } from "@/features/employer/lib/canonical-job-departments";
import { mergeJobDepartments } from "@/features/employer/lib/job-departments";
import { employerKeys } from "@/features/employer/query-keys";
import { useAuthStore } from "@/lib/stores/auth-store";

/** Active department catalog for worker post-job (shared `GET /employer/departments`). */
export function useWorkerDepartmentOptions() {
  const token = useAuthStore((s) => s.accessToken);
  const query = useQuery({
    queryKey: employerKeys.departments({ isActive: true }),
    queryFn: () => getEmployerDepartments({ isActive: true }),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const departments = useMemo(() => {
    const merged = mergeJobDepartments(CANONICAL_JOB_DEPARTMENTS, query.data?.items ?? []);
    return [...merged].sort((a, b) =>
      (a.name ?? "").localeCompare(b.name ?? "", undefined, { sensitivity: "base" }),
    );
  }, [query.data?.items]);

  return {
    departments,
    isLoading: query.isLoading && departments.length === 0,
  };
}
