"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { EmployerAsyncState } from "@/components/employer/employer-async-state";
import {
  useEmployerPaymentHistory,
  useEmployerPaymentsSummary,
  useEmployerPaymentWorkers,
  usePayEmployerWorker,
} from "@/features/employer/hooks";
import type { EmployerPayWorkerRow } from "@/features/employer/types/employer-portal";
import { useEmployerPortalStore } from "@/lib/stores/employer-portal-store";
import { formatStatValue } from "@/features/employer/lib/applicant-helpers";
import { portalCardClass, portalInputClass, portalPageShellClass, PortalStatCard, portalStatGridClass } from "@/components/portal/portal-ui";
import { cn } from "@/lib/utils";
import { buttonClassName } from "@/components/ui/button";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function EmployerPayrollView() {
  const t = useTranslations("employer.payroll");
  const month = useEmployerPortalStore((s) => s.paymentsMonth);
  const year = useEmployerPortalStore((s) => s.paymentsYear);
  const setPaymentsPeriod = useEmployerPortalStore((s) => s.setPaymentsPeriod);
  const historySearch = useEmployerPortalStore((s) => s.paymentHistorySearch);
  const setPaymentHistorySearch = useEmployerPortalStore((s) => s.setPaymentHistorySearch);

  const period = useMemo(() => ({ month, year }), [month, year]);
  const summary = useEmployerPaymentsSummary(period);
  const workers = useEmployerPaymentWorkers(period);
  const history = useEmployerPaymentHistory({ search: historySearch || undefined, page: 1, limit: 10 });

  const summaryEntries = useMemo(() => {
    const data = summary.data ?? {};
    const keys = ["totalPayroll", "pending", "paidThisMonth", "outstanding", "totalDue"];
    const ordered = keys.filter((k) => k in data);
    const rest = Object.keys(data).filter((k) => !ordered.includes(k));
    return [...ordered, ...rest].slice(0, 3).map((key) => ({
      key,
      value: data[key],
    }));
  }, [summary.data]);

  const workerRows = workers.data?.items ?? workers.data?.workers ?? [];

  return (
    <div className={cn(portalPageShellClass, "gap-6")}>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--joballa-fg)]">{t("title")}</h1>
          <p className="mt-1 text-sm text-[var(--joballa-muted)]">{t("description")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="payroll-month">
            {t("month")}
          </label>
          <select
            id="payroll-month"
            value={month}
            onChange={(e) => setPaymentsPeriod(Number(e.target.value), year)}
            className={cn(portalInputClass, "h-11 w-auto rounded-[10px]")}
          >
            {MONTHS.map((label, index) => (
              <option key={label} value={index + 1}>
                {label}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="payroll-year">
            {t("year")}
          </label>
          <select
            id="payroll-year"
            value={year}
            onChange={(e) => setPaymentsPeriod(month, Number(e.target.value))}
            className={cn(portalInputClass, "h-11 w-auto rounded-[10px]")}
          >
            {[year - 1, year, year + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </header>

      <EmployerAsyncState
        isLoading={summary.isLoading}
        isError={summary.isError}
        error={summary.error}
        onRetry={() => void summary.refetch()}
      >
        <div className={portalStatGridClass}>
          {summaryEntries.length > 0 ? (
            summaryEntries.map(({ key, value }) => (
              <PortalStatCard
                key={key}
                label={
                  ["totalPayroll", "pending", "paidThisMonth", "outstanding", "totalDue"].includes(key)
                    ? t(`summary.${key as "totalPayroll" | "pending" | "paidThisMonth" | "outstanding" | "totalDue"}`)
                    : key
                }
                value={formatStatValue(value as { count?: number | string })}
                hint=""
                hintTone="positive"
              />
            ))
          ) : (
            <PortalStatCard label={t("summary.outstanding")} value="—" hint="" hintTone="positive" />
          )}
        </div>
      </EmployerAsyncState>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--joballa-fg)]">{t("workersTitle")}</h2>
        <EmployerAsyncState
          isLoading={workers.isLoading}
          isError={workers.isError}
          error={workers.error}
          onRetry={() => void workers.refetch()}
        >
          <div className={cn(portalCardClass(), "overflow-hidden")}>
            <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)_auto] gap-3 border-b border-[var(--joballa-border)] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--joballa-muted)] sm:grid">
              <span>{t("table.worker")}</span>
              <span>{t("table.role")}</span>
              <span>{t("table.amount")}</span>
              <span className="text-right">{t("table.action")}</span>
            </div>
            {workerRows.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-[var(--joballa-muted)]">{t("workersEmpty")}</p>
            ) : (
              workerRows.map((row) => (
                <PayWorkerRow
                  key={String(row.workerId ?? row.id)}
                  row={row}
                  period={`${year}-${String(month).padStart(2, "0")}`}
                />
              ))
            )}
          </div>
        </EmployerAsyncState>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--joballa-fg)]">{t("history.title")}</h2>
        <input
          type="search"
          value={historySearch}
          onChange={(e) => setPaymentHistorySearch(e.target.value)}
          placeholder={t("historySearch")}
          className={cn(portalInputClass, "max-w-md")}
        />
        <EmployerAsyncState
          isLoading={history.isLoading}
          isError={history.isError}
          error={history.error}
          onRetry={() => void history.refetch()}
        >
          <ul className={cn(portalCardClass(), "divide-y divide-[var(--joballa-border)] overflow-hidden")}>
            {(history.data?.items ?? []).length === 0 ? (
              <li className="px-4 py-10 text-center text-sm text-[var(--joballa-muted)]">{t("history.empty")}</li>
            ) : (
              (history.data?.items ?? []).map((payment) => {
                const id = String(payment.paymentId ?? payment.id ?? "");
                return (
                  <li
                    key={id}
                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-3.5 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-[var(--joballa-fg)]">
                        {id ? (
                          <Link href={`/employer/payroll/${id}`} className="hover:underline">
                            {payment.workerName ?? id}
                          </Link>
                        ) : (
                          (payment.workerName ?? "Payment")
                        )}
                      </p>
                      <p className="text-xs text-[var(--joballa-muted)]">{payment.period ?? payment.createdAt}</p>
                    </div>
                    <p className="font-medium text-[var(--joballa-fg)]">
                      {payment.amount?.toLocaleString()} {payment.currency ?? "XAF"} ·{" "}
                      <span className="capitalize">{payment.status}</span>
                    </p>
                  </li>
                );
              })
            )}
          </ul>
        </EmployerAsyncState>
      </section>
    </div>
  );
}

function PayWorkerRow({ row, period }: { row: EmployerPayWorkerRow; period: string }) {
  const t = useTranslations("employer.payroll");
  const pay = usePayEmployerWorker();
  const engagementId = String(row.engagementId ?? "");
  const workerId = String(row.workerId ?? row.id ?? "");
  const [phone, setPhone] = useState(String(row.recipientNumber ?? "+237"));
  const amount = Number(row.amountDue ?? row.amount ?? 0);
  const currency = String(row.currency ?? "XAF");
  const paid = row.alreadyPaid === true || row.paid === true || row.status === "paid";
  const provider = row.provider === "orange_money" ? "orange_money" : "mtn_momo";
  const workerName = row.workerName ?? row.name ?? "Worker";

  return (
    <div className="grid gap-3 border-b border-[var(--joballa-border)] px-4 py-4 last:border-0 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)_auto] sm:items-center">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--joballa-primary)] text-sm font-bold text-[var(--joballa-on-primary)]">
          {workerName.charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-[var(--joballa-fg)]">{workerName}</p>
          <p className="text-xs text-[var(--joballa-muted)] sm:hidden">{String(row.role ?? "—")}</p>
        </div>
      </div>
      <p className="hidden text-sm text-[var(--joballa-muted)] sm:block">{String(row.role ?? "—")}</p>
      <p className="text-sm font-semibold text-[var(--joballa-primary)]">{amount.toLocaleString()} {currency}</p>
      <div className="flex flex-wrap items-center justify-end gap-2 sm:justify-end">
        {paid ? (
          <span className="rounded-full bg-[var(--joballa-jade-3)] px-3 py-1 text-xs font-semibold text-[var(--joballa-primary)]">{t("paid")}</span>
        ) : (
          <>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-10 min-w-[8rem] flex-1 rounded-lg border border-[var(--joballa-border)] px-3 text-sm sm:max-w-[9rem] sm:flex-none"
              aria-label={t("phoneLabel")}
            />
            <button
              type="button"
              disabled={pay.isPending || !engagementId || !workerId || amount <= 0}
              onClick={() =>
                pay.mutate({
                  engagementId,
                  workerId,
                  amount,
                  provider,
                  recipientNumber: phone,
                  payPeriod: period,
                  idempotencyKey: `pay-${engagementId}-${period}`,
                })
              }
              className={cn(buttonClassName("primary"), "text-sm")}
            >
              {pay.isPending ? t("paying") : t("pay")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
