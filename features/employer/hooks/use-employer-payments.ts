"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getEmployerPayment,
  getEmployerPaymentHistory,
  getEmployerPaymentsSummary,
  getEmployerPaymentStatement,
  getEmployerPaymentWorkers,
  payEmployerWorker,
} from "@/features/employer/api";
import { toastApiError, toastSuccess } from "@/features/employer/lib/mutation-feedback";
import { employerKeys } from "@/features/employer/query-keys";
import type { PayWorkerBody } from "@/features/employer/types/employer-portal";
import { useAuthStore } from "@/lib/stores/auth-store";

export function useEmployerPaymentsSummary(params?: { month?: number; year?: number }) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: employerKeys.payments(params),
    queryFn: () => getEmployerPaymentsSummary(params),
    enabled: !!token,
  });
}

export function useEmployerPaymentWorkers(params?: { month?: number; year?: number }) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: employerKeys.paymentWorkers(params),
    queryFn: () => getEmployerPaymentWorkers(params),
    enabled: !!token,
  });
}

export function useEmployerPaymentHistory(params?: { search?: string; page?: number; limit?: number }) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: employerKeys.paymentHistory(params),
    queryFn: () => getEmployerPaymentHistory(params),
    enabled: !!token,
  });
}

export function useEmployerPayment(paymentId: string) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: employerKeys.payment(paymentId),
    queryFn: () => getEmployerPayment(paymentId),
    enabled: !!token && !!paymentId,
  });
}

export function useEmployerPaymentStatement(params: { from: string; to: string }, enabled = true) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: employerKeys.paymentStatement(params),
    queryFn: () => getEmployerPaymentStatement(params),
    enabled: !!token && enabled && !!params.from && !!params.to,
  });
}

export function usePayEmployerWorker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PayWorkerBody) => payEmployerWorker(body),
    onSuccess: (data) => {
      toastSuccess(data.message || "Payment initiated.");
      void qc.invalidateQueries({ queryKey: employerKeys.payments() });
      void qc.invalidateQueries({ queryKey: employerKeys.paymentWorkers() });
      void qc.invalidateQueries({ queryKey: employerKeys.paymentHistory() });
    },
    onError: (e) => toastApiError(e, "Could not initiate payment."),
  });
}
