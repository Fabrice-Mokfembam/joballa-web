"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEmployerDepartments } from "@/features/employer/api";
import { useEmployerJobs } from "@/features/employer/hooks/use-employer-jobs";
import { mergeJobDepartments } from "@/features/employer/lib/job-departments";
import { employerKeys } from "@/features/employer/query-keys";
import type { EmployerJobDepartment, EmployerJobListItem } from "@/features/employer/types/employer-portal";
import { useAuthStore } from "@/lib/stores/auth-store";

type JobWithDepartment = EmployerJobListItem & {
  departmentId?: string;
  department?: EmployerJobDepartment;
};

export function useEmployerDepartmentOptions() {
  const token = useAuthStore((s) => s.accessToken);
  const catalogQuery = useQuery({
    queryKey: employerKeys.departments({ isActive: true }),
    queryFn: () => getEmployerDepartments({ isActive: true }),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
  const jobs = useEmployerJobs({ page: 1, limit: 100 });

  const departments = useMemo(() => {
    const fromApi = catalogQuery.data?.items ?? [];
    const fromJobs: EmployerJobDepartment[] = [];
    for (const job of (jobs.data?.items ?? []) as JobWithDepartment[]) {
      const id = job.departmentId ?? job.department?.id;
      if (!id) continue;
      fromJobs.push({
        id,
        name: job.department?.name ?? id,
        slug: job.department?.slug,
        category: job.department?.category,
      });
    }
    return mergeJobDepartments(fromApi, fromJobs);
  }, [catalogQuery.data?.items, jobs.data?.items]);

  return {
    departments,
    isLoading: catalogQuery.isLoading || jobs.isLoading,
  };
}
