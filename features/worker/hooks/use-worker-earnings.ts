"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getEarningsStatement,
  getEarningsSummary,
  getEarningsTransaction,
  getEarningsTransactions,
} from "@/features/worker/api";
import { workerKeys } from "@/features/worker/query-keys";
import type { EarningsTransactionsParams } from "@/features/worker/types/worker-portal";
import { useAuthSessionReady } from "@/lib/auth/use-auth-session-ready";

export function useEarningsSummary() {
  const sessionReady = useAuthSessionReady();
  return useQuery({
    queryKey: workerKeys.earningsSummary(),
    queryFn: getEarningsSummary,
    enabled: sessionReady,
  });
}

export function useEarningsTransactions(params?: EarningsTransactionsParams) {
  const sessionReady = useAuthSessionReady();
  return useQuery({
    queryKey: workerKeys.earningsTransactions(params),
    queryFn: () => getEarningsTransactions(params),
    enabled: sessionReady,
  });
}

export function useEarningsTransaction(transactionId: string) {
  const sessionReady = useAuthSessionReady();
  return useQuery({
    queryKey: workerKeys.earningsTransaction(transactionId),
    queryFn: () => getEarningsTransaction(transactionId),
    enabled: sessionReady && !!transactionId,
  });
}

export function useEarningsStatement(params: { from: string; to: string }, enabled = true) {
  const sessionReady = useAuthSessionReady();
  return useQuery({
    queryKey: workerKeys.earningsStatement(params),
    queryFn: () => getEarningsStatement(params),
    enabled: sessionReady && enabled && !!params.from && !!params.to,
  });
}
