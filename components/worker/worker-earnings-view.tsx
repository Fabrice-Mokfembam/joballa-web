"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { useEarningsSummary, useEarningsTransactions } from "@/features/worker/hooks";
import { earningTransactionsFromApi, earningsSummaryStats } from "@/features/worker/lib/earnings-mappers";
import type { EarningTransaction, EarningTransactionStatus } from "@/lib/worker-earnings-data";
import { downloadSimplePdf } from "@/lib/pdf-download";
import { JoballaApiError } from "@/lib/joballa/request";
import { WorkerEarningsPageSkeleton } from "@/components/worker/worker-loading-skeletons";
import { cn } from "@/lib/utils";

type TabKey = "all" | EarningTransactionStatus;
type ContextMenuState = { id: string; x: number; y: number } | null;

function statusBadgeClass(status: EarningTransactionStatus) {
  if (status === "paid") return "border border-[#d6f1e3] bg-[var(--joballa-jade-3)] text-[var(--joballa-primary)]";
  if (status === "overdue") return "border border-red-200 bg-[var(--joballa-danger-bg)] text-[var(--joballa-danger-fg)]";
  return "border border-[var(--joballa-match)]/30 bg-[var(--joballa-match)]/14 text-amber-900";
}

function downloadStatement(rows: EarningTransaction[]) {
  downloadSimplePdf(
    "joballa-earnings-statement.pdf",
    "Joballa Earnings Statement",
    rows.flatMap((row) => [
      `${row.dateLabel || "--"} | ${row.employer} | ${row.jobTitle}`,
      `${row.amountPrimary} | ${row.status.toUpperCase()} | ${row.paymentPlatform ?? ""}`,
      "",
    ]),
  );
}

export function WorkerEarningsView() {
  const t = useTranslations("worker.earnings");
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("all");
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

  const summaryQuery = useEarningsSummary();
  const txQuery = useEarningsTransactions({ page: 1, limit: 50 });
  const allTransactions = useMemo(() => earningTransactionsFromApi(txQuery.data?.items ?? []), [txQuery.data?.items]);

  const counts = useMemo(() => {
    const all = allTransactions.length;
    return {
      all,
      paid: allTransactions.filter((r) => r.status === "paid").length,
      pending: allTransactions.filter((r) => r.status === "pending").length,
      overdue: allTransactions.filter((r) => r.status === "overdue").length,
    };
  }, [allTransactions]);

  const rows = useMemo(() => (tab === "all" ? allTransactions : allTransactions.filter((r) => r.status === tab)), [allTransactions, tab]);
  const summaryStats = useMemo(() => earningsSummaryStats(summaryQuery.data), [summaryQuery.data]);
  const statCards = ["total", "month", "pending", "jobs"] as const;
  const statValues = {
    total: summaryStats.total,
    month: summaryStats.month,
    pending: summaryStats.pending,
    jobs: summaryStats.jobs.padStart(2, "0"),
  };

  if (summaryQuery.isLoading || txQuery.isLoading) return <WorkerEarningsPageSkeleton />;

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-8 bg-[var(--joballa-page-tint)]">
      <div className="grid gap-3 min-[480px]:grid-cols-2 sm:gap-5 xl:grid-cols-4">
        {statCards.map((k) => (
          <div key={k} className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)] sm:p-6">
            <p className="text-sm font-bold uppercase text-[var(--joballa-muted)] sm:text-lg">{t(`stats.${k}.label`)}</p>
            <div className="mt-5 flex items-end justify-between gap-3 sm:mt-7">
              <p className="text-4xl font-bold leading-none text-[var(--joballa-fg)] sm:text-6xl">{statValues[k]}</p>
              <p className="pb-1 text-sm font-bold text-[var(--joballa-muted)] sm:pb-2 sm:text-lg">{t(`stats.${k}.hint`)}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-[var(--joballa-muted)]">{t("historyTitle")}</h2>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-8">
            {(["all", "paid", "pending", "overdue"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  "h-10 rounded-[12px] px-3 text-sm font-bold sm:h-11 sm:px-4 sm:text-lg",
                  tab === key ? "border border-[var(--joballa-border)] bg-[var(--joballa-card)] text-[var(--joballa-fg)]" : "text-[var(--joballa-muted)]",
                )}
              >
                {t(`tabs.${key}`, { count: String(counts[key]).padStart(2, "0") })}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => downloadStatement(allTransactions)}
            className="h-10 rounded-[12px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] px-4 text-sm font-medium text-[var(--joballa-fg)] sm:h-11 sm:px-5 sm:text-lg"
          >
            {t("printStatement")}
          </button>
        </div>

        <div className="overflow-x-auto rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <table className="w-full min-w-[900px] border-separate border-spacing-y-0 text-left text-lg">
            <thead>
              <tr className="text-lg font-bold text-[var(--joballa-muted)]">
                <th className="px-4 py-5">{t("table.date")}</th>
                <th className="px-4 py-5">{t("table.employer")}</th>
                <th className="px-4 py-5">{t("table.jobTitle")}</th>
                <th className="px-4 py-5">{t("table.amount")}</th>
                <th className="px-4 py-5 text-right">{t("table.status")}</th>
              </tr>
            </thead>
            <tbody>
              {txQuery.isError ? (
                <tr><td colSpan={5} className="p-6 text-center text-sm text-[var(--joballa-muted)]">{txQuery.error instanceof JoballaApiError ? txQuery.error.message : t("loadError")}</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-sm text-[var(--joballa-muted)]">{t("empty")}</td></tr>
              ) : rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn("cursor-pointer text-[var(--joballa-fg)] hover:bg-[var(--joballa-row-hover)]", contextMenu?.id === row.id && "shadow-[inset_0_0_0_2px_var(--joballa-primary)]")}
                  onClick={() => router.push(`/worker/earnings/${row.id}`)}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    setContextMenu({
                      id: row.id,
                      x: Math.min(event.clientX, window.innerWidth - 188),
                      y: Math.min(event.clientY, window.innerHeight - 112),
                    });
                  }}
                >
                  <td className="rounded-l-[14px] px-4 py-5">{row.dateLabel || "--"}</td>
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-3">
                      <span className="grid size-8 place-items-center rounded-full bg-black text-sm font-bold text-white">{row.employerInitial || "J"}</span>
                      <span>{row.employer}</span>
                    </div>
                  </td>
                  <td className="px-4 py-5">{row.jobTitle}</td>
                  <td className="px-4 py-5">{row.amountPrimary}</td>
                  <td className="rounded-r-[14px] px-4 py-5 text-right">
                    <span className={cn("inline-flex min-w-28 justify-center rounded-full px-4 py-1 text-base font-bold", statusBadgeClass(row.status))}>
                      {t(`status.${row.status}`)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {contextMenu ? (
            <>
              <button type="button" className="fixed inset-0 z-10 cursor-default bg-transparent" aria-hidden onClick={() => setContextMenu(null)} />
              <div className="fixed z-20 w-44 overflow-hidden rounded-lg border border-[var(--joballa-border)] bg-[var(--joballa-card)] py-1 text-lg shadow-md" style={{ left: contextMenu.x, top: contextMenu.y }}>
                <button type="button" className="block w-full px-4 py-2 text-left hover:bg-[var(--joballa-row-hover)]" onClick={() => router.push(`/worker/earnings/${contextMenu.id}`)}>
                  {t("rowMenu.open")}
                </button>
                <button type="button" className="block w-full px-4 py-2 text-left hover:bg-[var(--joballa-row-hover)]" onClick={() => {
                  const row = rows.find((r) => r.id === contextMenu.id);
                  if (row) downloadStatement([row]);
                  setContextMenu(null);
                }}>
                  {t("rowMenu.save")}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}
