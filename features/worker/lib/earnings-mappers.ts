import type { EarningTransaction as ApiTxn, EarningsSummary } from "@/features/worker/types/worker-portal";
import type { EarningTransaction, EarningTransactionStatus } from "@/lib/worker-earnings-data";

const EMPLOYER_COLORS = [
  "bg-teal-600",
  "bg-[var(--joballa-primary)]",
  "bg-violet-600",
  "bg-amber-600",
  "bg-sky-600",
] as const;

function hashColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i)) | 0;
  return EMPLOYER_COLORS[Math.abs(h) % EMPLOYER_COLORS.length]!;
}

function mapPaymentStatus(status?: string): EarningTransactionStatus {
  const s = (status ?? "").toUpperCase();
  if (s === "COMPLETED") return "paid";
  if (s === "PENDING") return "pending";
  if (s === "FAILED") return "overdue";
  return "pending";
}

function formatDateLabel(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function formatAmount(amount: number | string | undefined, currency = "XAF"): string {
  if (amount == null || amount === "") return "";
  const num = typeof amount === "number" ? amount.toLocaleString() : String(amount);
  return `${num} ${currency}`;
}

function stringField(txn: ApiTxn, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = txn[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return undefined;
}

export function earningTransactionFromApi(txn: ApiTxn): EarningTransaction {
  const employer = txn.employerName ?? "";
  const initial = employer.trim() ? employer.trim().charAt(0).toUpperCase() : "";
  return {
    id: txn.id,
    dateLabel: formatDateLabel(txn.completedAt ?? txn.initiatedAt),
    employer,
    employerInitial: initial,
    employerColor: hashColor(employer || txn.id),
    jobTitle: txn.jobTitle ?? "",
    amountPrimary: formatAmount(txn.amount, txn.currency ?? "XAF"),
    status: mapPaymentStatus(String(txn.status ?? "")),
    initiatedAt: txn.initiatedAt ?? null,
    completedAt: txn.completedAt ?? null,
    paymentPlatform: stringField(txn, ["paymentPlatform", "platform", "provider", "mobileMoneyProvider"]) ?? "MTN MoMo",
    paymentMethod: stringField(txn, ["paymentMethod", "recipientNumber", "phone", "mobileMoneyNumber"]),
    reference: stringField(txn, ["reference", "fapshiReference", "transactionReference", "fapshiTransactionId"]) ?? txn.id,
    jobId: stringField(txn, ["jobId"]) ?? null,
    applicationId: stringField(txn, ["applicationId"]) ?? null,
  };
}

export function earningTransactionsFromApi(items: ApiTxn[]): EarningTransaction[] {
  return items.map(earningTransactionFromApi);
}

export function formatEarningsStat(value: number | undefined, currency: string): string {
  if (value == null || Number.isNaN(value)) return "";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return value.toLocaleString();
}

export function earningsSummaryStats(summary: EarningsSummary | undefined) {
  const currency = summary?.currency ?? "XAF";
  return {
    total: formatEarningsStat(summary?.totalEarned, currency),
    month: formatEarningsStat(summary?.thisMonthTotal, currency),
    pending: formatEarningsStat(summary?.pendingAmount, currency),
    jobs: String(summary?.totalPayments ?? 0),
    currency,
  };
}
