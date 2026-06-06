"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteWorkerCertification,
  deleteWorkerDocument,
  deleteWorkerEducation,
  deleteWorkerWorkHistory,
  getWorkerDocuments,
  getWorkerCvExport,
  getWorkerCvExportStatus,
  getWorkerFullProfile,
  getWorkerKyc,
  getWorkerPublicProfile,
  patchWorkerCertification,
  patchWorkerEducation,
  patchWorkerPaymentDetails,
  patchWorkerPersonalInfo,
  patchWorkerProfessionalSummary,
  patchWorkerSkills,
  patchWorkerWorkHistory,
  postWorkerAvatar,
  postWorkerCvExport,
  postWorkerCertification,
  postWorkerDocument,
  postWorkerEducation,
  postWorkerKyc,
  postWorkerWorkHistory,
} from "@/features/worker/api";
import { toastApiError, toastSuccess } from "@/features/employer/lib/mutation-feedback";
import { workerKeys } from "@/features/worker/query-keys";
import type {
  CreateCertificationBody,
  CreateEducationBody,
  CreateWorkHistoryBody,
  PatchPaymentDetailsBody,
  PatchPersonalInfoBody,
  PatchProfessionalSummaryBody,
  PatchSkillsBody,
  SubmitKycBody,
  WorkerDocument,
  WorkerCvDownload,
  WorkerFullProfile,
  WorkerWorkHistory,
} from "@/features/worker/types/worker-portal";
import { useAuthSessionReady } from "@/lib/auth/use-auth-session-ready";

function setProfileCache(qc: ReturnType<typeof useQueryClient>, profile: WorkerFullProfile) {
  qc.setQueryData(workerKeys.profile(), (prev: WorkerFullProfile | undefined) => ({
    ...profile,
    avatarUrl: profile.avatarUrl ?? prev?.avatarUrl ?? null,
  }));
}

function syncMeFromProfile(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: workerKeys.me() });
}

function appendWorkHistory(qc: ReturnType<typeof useQueryClient>, entry: WorkerWorkHistory) {
  qc.setQueryData(workerKeys.profile(), (prev: WorkerFullProfile | undefined) =>
    prev ? { ...prev, workHistories: [...(prev.workHistories ?? []), entry] } : prev,
  );
}

function removeWorkHistory(qc: ReturnType<typeof useQueryClient>, workId: string) {
  qc.setQueryData(workerKeys.profile(), (prev: WorkerFullProfile | undefined) =>
    prev
      ? { ...prev, workHistories: (prev.workHistories ?? []).filter((w) => w.id !== workId) }
      : prev,
  );
}

function appendDocument(qc: ReturnType<typeof useQueryClient>, doc: WorkerDocument) {
  qc.setQueryData(workerKeys.documents(), (prev: WorkerDocument[] | undefined) => [...(prev ?? []), doc]);
  qc.setQueryData(workerKeys.profile(), (prev: WorkerFullProfile | undefined) =>
    prev ? { ...prev, documents: [...(prev.documents ?? []), doc] } : prev,
  );
}

function removeDocument(qc: ReturnType<typeof useQueryClient>, documentId: string) {
  qc.setQueryData(workerKeys.documents(), (prev: WorkerDocument[] | undefined) =>
    (prev ?? []).filter((d) => d.id !== documentId),
  );
  qc.setQueryData(workerKeys.profile(), (prev: WorkerFullProfile | undefined) =>
    prev
      ? { ...prev, documents: (prev.documents ?? []).filter((d) => d.id !== documentId) }
      : prev,
  );
}

export function useWorkerFullProfile(options?: { enabled?: boolean }) {
  const sessionReady = useAuthSessionReady();
  return useQuery({
    queryKey: workerKeys.profile(),
    queryFn: getWorkerFullProfile,
    enabled: sessionReady && (options?.enabled ?? true),
  });
}

export function useWorkerPublicProfile(workerId: string) {
  const sessionReady = useAuthSessionReady();
  return useQuery({
    queryKey: workerKeys.profilePublic(workerId),
    queryFn: () => getWorkerPublicProfile(workerId),
    enabled: sessionReady && !!workerId,
  });
}

export function useWorkerDocuments() {
  const sessionReady = useAuthSessionReady();
  return useQuery({
    queryKey: workerKeys.documents(),
    queryFn: getWorkerDocuments,
    enabled: sessionReady,
  });
}

export function useWorkerKyc() {
  const sessionReady = useAuthSessionReady();
  return useQuery({
    queryKey: workerKeys.kyc(),
    queryFn: getWorkerKyc,
    enabled: sessionReady,
  });
}

function downloadWorkerCv({ blob, fileName }: WorkerCvDownload) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function useWorkerCvExportStatus() {
  const sessionReady = useAuthSessionReady();
  return useQuery({
    queryKey: workerKeys.cvExportStatus(),
    queryFn: getWorkerCvExportStatus,
    enabled: sessionReady,
  });
}

export function useGenerateWorkerCvExport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postWorkerCvExport,
    onSuccess: (download) => {
      downloadWorkerCv(download);
      toastSuccess("CV exported.");
      void qc.invalidateQueries({ queryKey: workerKeys.cvExportStatus() });
    },
    onError: (error) => toastApiError(error, "Could not export your CV."),
  });
}

export function useDownloadWorkerCvExport() {
  return useMutation({
    mutationFn: getWorkerCvExport,
    onSuccess: downloadWorkerCv,
    onError: (error) => toastApiError(error, "Could not download your CV."),
  });
}

export function usePatchWorkerPersonalInfo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PatchPersonalInfoBody) => patchWorkerPersonalInfo(body),
    onSuccess: (profile) => {
      setProfileCache(qc, profile);
      syncMeFromProfile(qc);
    },
    onError: (e) => toastApiError(e, "Could not update profile."),
  });
}

export function usePatchWorkerProfessionalSummary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PatchProfessionalSummaryBody) => patchWorkerProfessionalSummary(body),
    onSuccess: (profile) => {
      setProfileCache(qc, profile);
    },
    onError: (e) => toastApiError(e, "Could not update profile."),
  });
}

export function usePatchWorkerSkills() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PatchSkillsBody) => patchWorkerSkills(body),
    onSuccess: (profile) => {
      setProfileCache(qc, profile);
    },
    onError: (e) => toastApiError(e, "Could not update skills."),
  });
}

export function usePostWorkerAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => postWorkerAvatar(file),
    onSuccess: (profile) => {
      toastSuccess("Photo updated.");
      setProfileCache(qc, profile);
      syncMeFromProfile(qc);
    },
    onError: (e) => toastApiError(e, "Could not upload photo."),
  });
}

export function usePatchWorkerPaymentDetails() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PatchPaymentDetailsBody) => patchWorkerPaymentDetails(body),
    onSuccess: (profile) => {
      setProfileCache(qc, profile);
    },
    onError: (e) => toastApiError(e, "Could not save payment details."),
  });
}

export function usePostWorkerWorkHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateWorkHistoryBody) => postWorkerWorkHistory(body),
    onSuccess: () => {
      toastSuccess("Work history added.");
      void qc.invalidateQueries({ queryKey: workerKeys.profile() });
    },
    onError: (e) => toastApiError(e, "Could not add work history."),
  });
}

export function usePatchWorkerWorkHistory(workId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<CreateWorkHistoryBody>) => patchWorkerWorkHistory(workId, body),
    onSuccess: (entry) => {
      toastSuccess("Work history updated.");
      qc.setQueryData(workerKeys.profile(), (prev: WorkerFullProfile | undefined) =>
        prev
          ? {
              ...prev,
              workHistories: (prev.workHistories ?? []).map((w) => (w.id === entry.id ? entry : w)),
            }
          : prev,
      );
    },
    onError: (e) => toastApiError(e, "Could not update work history."),
  });
}

export function useDeleteWorkerWorkHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (workId: string) => deleteWorkerWorkHistory(workId),
    onSuccess: (_data, workId) => {
      toastSuccess("Work history removed.");
      removeWorkHistory(qc, workId);
    },
    onError: (e) => toastApiError(e, "Could not remove work history."),
  });
}

export function usePostWorkerEducation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateEducationBody) => postWorkerEducation(body),
    onSuccess: () => {
      toastSuccess("Education added.");
      void qc.invalidateQueries({ queryKey: workerKeys.profile() });
    },
    onError: (e) => toastApiError(e, "Could not add education."),
  });
}

export function usePatchWorkerEducation(educationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<CreateEducationBody>) => patchWorkerEducation(educationId, body),
    onSuccess: () => {
      toastSuccess("Education updated.");
      void qc.invalidateQueries({ queryKey: workerKeys.profile() });
    },
    onError: (e) => toastApiError(e, "Could not update education."),
  });
}

export function useDeleteWorkerEducation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (educationId: string) => deleteWorkerEducation(educationId),
    onSuccess: () => {
      toastSuccess("Education removed.");
      void qc.invalidateQueries({ queryKey: workerKeys.profile() });
    },
    onError: (e) => toastApiError(e, "Could not remove education."),
  });
}

export function usePostWorkerCertification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCertificationBody) => postWorkerCertification(body),
    onSuccess: () => {
      toastSuccess("Certification added.");
      void qc.invalidateQueries({ queryKey: workerKeys.profile() });
    },
    onError: (e) => toastApiError(e, "Could not add certification."),
  });
}

export function usePatchWorkerCertification(certId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<CreateCertificationBody>) => patchWorkerCertification(certId, body),
    onSuccess: () => {
      toastSuccess("Certification updated.");
      void qc.invalidateQueries({ queryKey: workerKeys.profile() });
    },
    onError: (e) => toastApiError(e, "Could not update certification."),
  });
}

export function useDeleteWorkerCertification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (certId: string) => deleteWorkerCertification(certId),
    onSuccess: () => {
      toastSuccess("Certification removed.");
      void qc.invalidateQueries({ queryKey: workerKeys.profile() });
    },
    onError: (e) => toastApiError(e, "Could not remove certification."),
  });
}

export function usePostWorkerDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, type }: { file: File; type: string }) => postWorkerDocument(file, type),
    onSuccess: (doc) => {
      toastSuccess("Document uploaded.");
      appendDocument(qc, doc);
    },
    onError: (e) => toastApiError(e, "Could not upload document."),
  });
}

export function useDeleteWorkerDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => deleteWorkerDocument(documentId),
    onSuccess: (_data, documentId) => {
      toastSuccess("Document removed.");
      removeDocument(qc, documentId);
    },
    onError: (e) => toastApiError(e, "Could not remove document."),
  });
}

export function usePostWorkerKyc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SubmitKycBody) => postWorkerKyc(body),
    onSuccess: () => {
      toastSuccess("KYC submitted.");
      void qc.invalidateQueries({ queryKey: workerKeys.kyc() });
      void qc.invalidateQueries({ queryKey: workerKeys.profile() });
    },
    onError: (e) => toastApiError(e, "Could not submit KYC."),
  });
}
