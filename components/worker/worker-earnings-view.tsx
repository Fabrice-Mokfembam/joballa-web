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
import { portalPageShellClass, portalStatGridClass } from "@/components/portal/portal-ui";
import { cn } from "@/lib/utils";

type TabKey = "all" | EarningTransactionStatus;
type ContextMenuState = { id: string; x: number; y: number } | null;

function statusBadgeClass(status: EarningTransactionStatus) {
  if (status === "paid") {
    return "border border-[var(--joballa-jade-4)] bg-[var(--joballa-jade-3)] text-[var(--joballa-primary)]";
  }
  if (status === "overdue") {
    return "border border-[var(--joballa-danger-border)] bg-[var(--joballa-danger-soft)] text-[var(--joballa-danger-fg)]";
  }
  return "border border-[var(--joballa-pill-border)] bg-[var(--joballa-pill-bg)] text-[var(--joballa-muted)]";
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

function StatValue({ value }: { value: string }) {
  const match = value.match(/^(.+?)([KM])$/i);
  if (match) {
    return (
      <span className="whitespace-nowrap text-[var(--joballa-fg)]">
        <span className="text-5xl font-semibold leading-[48px]">{match[1]}</span>
        <span className="text-3xl font-semibold leading-9">{match[2]!.toUpperCase()}</span>
      </span>
    );
  }
  return <span className="text-5xl font-semibold leading-[48px] text-[var(--joballa-fg)]">{value}</span>;
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
    <div className={cn(portalPageShellClass, "gap-[26px]")}>
      <div className={cn(portalStatGridClass, "gap-[22px]")}>
        {statCards.map((k) => (
          <div
            key={k}
            className="flex flex-col gap-[13px] rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-[14px] shadow-[var(--joballa-shadow-card)]"
          >
            <p className="text-xs font-bold uppercase leading-4 text-[var(--joballa-muted)]">{t(`stats.${k}.label`)}</p>
            <div className="flex items-end justify-between gap-1">
              <StatValue value={statValues[k]} />
              <p
                className={cn(
                  "max-w-[120px] shrink-0 pb-1 text-right text-xs font-semibold leading-4",
                  k === "month" ? "text-[var(--joballa-primary)]" : "text-[var(--joballa-muted)]",
                )}
              >
                {t(`stats.${k}.hint`)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-bold leading-5 text-[var(--joballa-muted)]">{t("historyTitle")}</h2>

      <div className="flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {(["all", "paid", "pending", "overdue"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  "inline-flex h-8 items-center rounded-xl px-2.5 text-sm font-medium leading-5 transition-colors",
                  tab === key
                    ? "border border-[var(--joballa-border)] bg-[var(--joballa-card)] text-[var(--joballa-fg)]"
                    : "text-[var(--joballa-muted)] hover:text-[var(--joballa-fg)]",
                )}
              >
                {t(`tabs.${key}`, { count: String(counts[key]).padStart(2, "0") })}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => downloadStatement(allTransactions)}
            className="inline-flex h-8 items-center rounded-xl border border-[var(--joballa-border)] bg-[var(--joballa-card)] px-2.5 text-sm font-medium leading-5 text-[var(--joballa-fg)] transition hover:border-[color-mix(in_srgb,var(--joballa-primary)_35%,var(--joballa-border))]"
          >
            {t("printStatement")}
          </button>
        </div>

        <div className="relative overflow-x-auto rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-3 shadow-[var(--joballa-shadow-card)]">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="text-xs font-semibold leading-4 text-[var(--joballa-table-header)]">
                <th className="max-w-[100px] px-2.5 py-2.5 font-semibold">{t("table.date")}</th>
                <th className="min-w-[170px] px-2.5 py-2.5 font-semibold">{t("table.employer")}</th>
                <th className="min-w-[170px] px-2.5 py-2.5 font-semibold">{t("table.jobTitle")}</th>
                <th className="max-w-[120px] px-2.5 py-2.5 font-semibold">{t("table.amount")}</th>
                <th className="max-w-[100px] px-2.5 py-2.5 text-right font-semibold">{t("table.status")}</th>
              </tr>
            </thead>
            <tbody>
              {txQuery.isError ? (
                <tr>
                  <td colSpan={5} className="px-2.5 py-6 text-center text-sm text-[var(--joballa-muted)]">
                    {txQuery.error instanceof JoballaApiError ? txQuery.error.message : t("loadError")}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-2.5 py-6 text-center text-sm text-[var(--joballa-muted)]">
                    {t("empty")}
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "cursor-pointer rounded-lg text-xs leading-4 text-[var(--joballa-fg)] transition",
                      index % 2 === 0 && "bg-[var(--joballa-row-selected)]",
                      contextMenu?.id === row.id
                        ? "border-2 border-[var(--joballa-jade-8)]"
                        : "border border-transparent",
                      "hover:bg-[var(--joballa-row-hover)]",
                    )}
                    onClick={() => router.push(`/worker/earnings/${row.id}`)}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      setContextMenu({
                        id: row.id,
                        x: Math.min(event.clientX, window.innerWidth - 188),
                        y: Math.min(event.clientY, window.innerHeight - 220),
                      });
                    }}
                  >
                    <td className="max-w-[100px] px-2.5 py-2.5 font-normal">{row.dateLabel || "--"}</td>
                    <td className="min-w-[170px] px-2.5 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            "grid size-5 shrink-0 place-items-center rounded-full text-[9px] font-bold text-white",
                            row.employerColor ?? "bg-black",
                          )}
                        >
                          {row.employerInitial || "J"}
                        </span>
                        <span className="truncate font-normal">{row.employer}</span>
                      </div>
                    </td>
                    <td className="min-w-[170px] truncate px-2.5 py-2.5 font-normal">{row.jobTitle}</td>
                    <td className="max-w-[120px] px-2.5 py-2.5 font-normal">{row.amountPrimary}</td>
                    <td className="max-w-[100px] px-2.5 py-2.5 text-right">
                      <span
                        className={cn(
                          "inline-flex w-full items-center justify-center rounded-[26px] px-2 py-0.5 text-xs font-semibold leading-4",
                          statusBadgeClass(row.status),
                        )}
                      >
                        {t(`status.${row.status}`)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {contextMenu ? (
            <>
              <button type="button" className="fixed inset-0 z-10 cursor-default bg-transparent" aria-hidden onClick={() => setContextMenu(null)} />
              <div
                className="fixed z-20 w-44 overflow-hidden rounded-lg border border-[var(--joballa-border)] bg-[var(--joballa-card)] py-1 text-sm shadow-[var(--joballa-shadow-elevated)]"
                style={{ left: contextMenu.x, top: contextMenu.y }}
              >
                <button
                  type="button"
                  className="block w-full px-3 py-1.5 text-left hover:bg-[var(--joballa-row-hover)]"
                  onClick={() => router.push(`/worker/earnings/${contextMenu.id}`)}
                >
                  {t("rowMenu.open")}
                </button>
                <button
                  type="button"
                  className="block w-full px-3 py-1.5 text-left hover:bg-[var(--joballa-row-hover)]"
                  onClick={() => {
                    const row = rows.find((r) => r.id === contextMenu.id);
                    if (row) downloadStatement([row]);
                    setContextMenu(null);
                  }}
                >
                  {t("rowMenu.save")}
                </button>
                <button type="button" className="block w-full px-3 py-1.5 text-left hover:bg-[var(--joballa-row-hover)]">
                  {t("rowMenu.share")}
                </button>
                <button type="button" className="block w-full px-3 py-1.5 text-left hover:bg-[var(--joballa-row-hover)]">
                  {t("rowMenu.flag")}
                </button>
                <button type="button" className="block w-full px-3 py-1.5 text-left text-[var(--joballa-danger-fg)] hover:bg-[var(--joballa-danger-bg)]">
                  {t("rowMenu.delete")}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
