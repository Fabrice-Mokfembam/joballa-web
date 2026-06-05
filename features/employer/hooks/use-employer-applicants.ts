"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getEmployerApplicant,
  getEmployerApplicantFilters,
  getEmployerApplicantShare,
  getEmployerApplicants,
  patchEmployerApplicantNotes,
  patchEmployerApplicantStatus,
} from "@/features/employer/api";
import { toastApiError, toastSuccess } from "@/features/employer/lib/mutation-feedback";
import { employerKeys, type ApplicantsListParams } from "@/features/employer/query-keys";
import type { EmployerApplicantStatus } from "@/features/employer/types/employer-portal";
import { useAuthStore } from "@/lib/stores/auth-store";
import { toast } from "@/lib/toast";

export function useEmployerApplicantFilters() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: employerKeys.applicantFilters(),
    queryFn: getEmployerApplicantFilters,
    enabled: !!token,
  });
}

export function useEmployerApplicants(params: ApplicantsListParams & { enabled?: boolean }) {
  const token = useAuthStore((s) => s.accessToken);
  const queryParams = {
    search: params.search || undefined,
    jobId: params.jobId || undefined,
    status: params.status || undefined,
    sort: params.sort,
    page: params.page,
    limit: params.limit,
    view: params.view,
  };
  return useQuery({
    queryKey: employerKeys.applicants(queryParams),
    queryFn: () => getEmployerApplicants(queryParams),
    enabled: !!token && params.enabled !== false,
  });
}

export function useEmployerApplicant(applicationId: string) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: employerKeys.applicant(applicationId),
    queryFn: () => getEmployerApplicant(applicationId),
    enabled: !!token && !!applicationId,
  });
}

export function useEmployerApplicantShare(applicationId: string) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: employerKeys.applicantShare(applicationId),
    queryFn: () => getEmployerApplicantShare(applicationId),
    enabled: !!token && !!applicationId,
  });
}

export function usePatchEmployerApplicantStatus(applicationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: EmployerApplicantStatus) => patchEmployerApplicantStatus(applicationId, status),
    onSuccess: () => {
      toastSuccess("Applicant status updated.");
      void qc.invalidateQueries({ queryKey: employerKeys.applicant(applicationId) });
      void qc.invalidateQueries({ queryKey: employerKeys.applicants() });
      void qc.invalidateQueries({ queryKey: employerKeys.dashboard() });
      void qc.invalidateQueries({ queryKey: employerKeys.workforce() });
    },
    onError: (e) => toastApiError(e, "Could not update applicant."),
  });
}

export function usePatchEmployerApplicantNotes(applicationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (employerNotes: string) => patchEmployerApplicantNotes(applicationId, { employerNotes }),
    onSuccess: () => {
      toastSuccess("Notes saved.");
      void qc.invalidateQueries({ queryKey: employerKeys.applicant(applicationId) });
    },
    onError: (e) => toastApiError(e, "Could not save notes."),
  });
}

export function useCopyApplicantShareLink(applicationId: string) {
  const share = useEmployerApplicantShare(applicationId);
  return useMutation({
    mutationFn: async () => {
      const url = share.data?.shareUrl ?? (await getEmployerApplicantShare(applicationId)).shareUrl;
      if (!url) throw new Error("No share link");
      await navigator.clipboard.writeText(url);
      return url;
    },
    onSuccess: () => toast.success("Share link copied."),
    onError: (e) => toastApiError(e, "Could not copy share link."),
  });
}
