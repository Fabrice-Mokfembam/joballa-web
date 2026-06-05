"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteEmployerCompanyDocument,
  getEmployerCompany,
  patchEmployerCompany,
  uploadEmployerCompanyDocument,
  uploadEmployerCompanyLogo,
} from "@/features/employer/api";
import { toastApiError, toastSuccess } from "@/features/employer/lib/mutation-feedback";
import { employerKeys } from "@/features/employer/query-keys";
import type { UpdateEmployerCompanyBody } from "@/features/employer/types/employer-portal";
import { useAuthStore } from "@/lib/stores/auth-store";

export function useEmployerCompany() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: employerKeys.company(),
    queryFn: getEmployerCompany,
    enabled: !!token,
  });
}

export function usePatchEmployerCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateEmployerCompanyBody) => patchEmployerCompany(body),
    onSuccess: async (company) => {
      toastSuccess("Company profile updated.");
      qc.setQueryData(employerKeys.company(), company);
      await qc.invalidateQueries({ queryKey: employerKeys.company() });
      void qc.invalidateQueries({ queryKey: employerKeys.me() });
    },
    onError: (e) => toastApiError(e, "Could not update company profile."),
  });
}

export function useUploadEmployerCompanyLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadEmployerCompanyLogo(file),
    onSuccess: (company) => {
      toastSuccess("Logo uploaded.");
      qc.setQueryData(employerKeys.company(), company);
      void qc.invalidateQueries({ queryKey: employerKeys.me() });
    },
    onError: (e) => toastApiError(e, "Could not upload logo."),
  });
}

export function useUploadEmployerCompanyDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, documentName }: { file: File; documentName?: string }) =>
      uploadEmployerCompanyDocument(file, documentName),
    onSuccess: (company) => {
      toastSuccess("Business document uploaded.");
      qc.setQueryData(employerKeys.company(), company);
    },
    onError: (e) => toastApiError(e, "Could not upload business document."),
  });
}

export function useDeleteEmployerCompanyDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => deleteEmployerCompanyDocument(documentId),
    onSuccess: async () => {
      toastSuccess("Business document removed.");
      await qc.invalidateQueries({ queryKey: employerKeys.company() });
    },
    onError: (e) => toastApiError(e, "Could not remove business document."),
  });
}
