"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { useEarningsTransaction, useEarningsTransactions, useWorkerApplications } from "@/features/worker/hooks";
import { earningTransactionFromApi, earningTransactionsFromApi } from "@/features/worker/lib/earnings-mappers";
import { workerApplicationRowsFromApi } from "@/features/worker/lib/application-mappers";
import { downloadSimplePdf } from "@/lib/pdf-download";
import { WorkerEarningsPageSkeleton } from "@/components/worker/worker-loading-skeletons";
import { IconChevronLeft } from "@/components/worker/icons";
import { cn } from "@/lib/utils";

function statusBadgeClass(status: string) {
  if (status === "paid") return "bg-[var(--joballa-jade-3)] text-[var(--joballa-primary)]";
  if (status === "overdue") return "bg-[var(--joballa-danger-bg)] text-[var(--joballa-danger-fg)]";
  return "bg-[var(--joballa-highlight-bg)] text-[var(--joballa-highlight-fg)]";
}

function humanTime(value?: string | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function WorkerEarningDetailPage({ transactionId }: { transactionId: string }) {
  const t = useTranslations("worker.earnings");
  const td = useTranslations("worker.earnings.detail");
  const router = useRouter();
  const txDetailQuery = useEarningsTransaction(transactionId);
  const txListQuery = useEarningsTransactions({ page: 1, limit: 100 });
  const appsQuery = useWorkerApplications({ limit: 100 });

  const transaction = useMemo(() => {
    if (txDetailQuery.data) return earningTransactionFromApi(txDetailQuery.data);
    return earningTransactionsFromApi(txListQuery.data?.items ?? []).find((row) => row.id === transactionId);
  }, [transactionId, txDetailQuery.data, txListQuery.data?.items]);

  if (txDetailQuery.isLoading && txListQuery.isLoading) return <WorkerEarningsPageSkeleton />;

  if (!transaction) {
    return (
      <div className="space-y-6">
        <Link href="/worker/earnings" className="inline-flex items-center gap-2 text-lg font-semibold text-[var(--joballa-muted)]">
          <IconChevronLeft className="size-5" />
          {td("back")}
        </Link>
        <p className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-8 text-center text-sm text-[var(--joballa-muted)]">
          {t("empty")}
        </p>
      </div>
    );
  }

  const receiptLines = [
    `${td("receipt.transaction")}: ${transaction.reference ?? transaction.id}`,
    `${td("receipt.amount")}: ${transaction.amountPrimary}`,
    `${td("receipt.status")}: ${t(`status.${transaction.status}`)}`,
    `${td("receipt.employer")}: ${transaction.employer}`,
    `${td("receipt.job")}: ${transaction.jobTitle}`,
    `${td("receipt.paymentPlatform")}: ${transaction.paymentPlatform ?? "--"}`,
    `${td("receipt.paymentMethod")}: ${transaction.paymentMethod ?? "--"}`,
    `${td("receipt.initiated")}: ${humanTime(transaction.initiatedAt)}`,
    `${td("receipt.completed")}: ${humanTime(transaction.completedAt)}`,
  ];
  const applicationSlug =
    transaction.applicationId ??
    workerApplicationRowsFromApi(appsQuery.data?.items ?? []).find(
      (app) => app.linkedJobSlug === transaction.jobId || app.jobTitle === transaction.jobTitle,
    )?.slug;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <Link href="/worker/earnings" className="inline-flex items-center gap-2 text-xl font-semibold text-[var(--joballa-muted)] hover:text-[var(--joballa-fg)]">
        <IconChevronLeft className="size-5" />
        {td("back")}
      </Link>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="space-y-6">
          <section className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-3xl font-bold text-[var(--joballa-fg)] sm:text-4xl">{transaction.amountPrimary}</p>
                <p className="mt-2 text-sm font-semibold text-[var(--joballa-muted)]">{transaction.jobTitle}</p>
                <span className={cn("mt-3 inline-flex rounded-full px-3 py-1 text-sm font-bold", statusBadgeClass(transaction.status))}>
                  {t(`status.${transaction.status}`)}
                </span>
                <p className="mt-3 text-xs text-[var(--joballa-muted)]">#{transaction.reference ?? transaction.id}</p>
              </div>
              <button
                type="button"
                onClick={() => downloadSimplePdf(`joballa-receipt-${transaction.id}.pdf`, td("receiptTitle"), receiptLines)}
                className="h-10 rounded-[10px] border border-[var(--joballa-border)] px-4 text-sm font-semibold text-[var(--joballa-fg)]"
              >
                {t("rowMenu.save")}
              </button>
            </div>
            <div className="mt-6 flex items-center gap-3 border-t border-[var(--joballa-border)] pt-5">
              <span className="grid size-10 place-items-center rounded-full bg-[var(--joballa-avatar-bg)] text-sm font-bold text-[var(--joballa-fg)]">{transaction.employerInitial || "J"}</span>
              <div>
                <p className="font-bold text-[var(--joballa-fg)]">{transaction.employer}</p>
                <p className="text-sm text-[var(--joballa-muted)]">{td("employerLabel")}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase text-[var(--joballa-muted)]">{td("transactionDetails")}</h2>
            <dl className="mt-5 divide-y divide-[var(--joballa-border)]">
              {[
                [td("fields.date"), transaction.dateLabel || "--"],
                [td("fields.transactionTime"), humanTime(transaction.completedAt ?? transaction.initiatedAt)],
                [td("fields.jobType"), td("fields.contract")],
                [td("fields.rate"), transaction.amountPrimary],
                [td("fields.paymentPlatform"), transaction.paymentPlatform ?? "--"],
                [td("fields.paymentMethod"), transaction.paymentMethod ?? "--"],
                [td("fields.totalReceived"), transaction.amountPrimary],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col justify-between gap-1 py-3 text-sm min-[480px]:flex-row min-[480px]:gap-6">
                  <dt className="text-[var(--joballa-muted)]">{label}</dt>
                  <dd className="font-bold text-[var(--joballa-fg)] min-[480px]:text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase text-[var(--joballa-muted)]">{td("actions")}</h2>
            <button
              type="button"
              onClick={() => {
                if (applicationSlug) router.push(`/worker/applications/${applicationSlug}`);
              }}
              disabled={!applicationSlug}
              className="mt-4 h-11 w-full rounded-[10px] border border-[var(--joballa-border)] px-4 text-left text-sm font-bold text-[var(--joballa-fg)] hover:border-[var(--joballa-primary)]"
            >
              {td("viewJobListing")}
            </button>
          </section>
          <section className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase text-[var(--joballa-muted)]">{td("relatedTransactions")}</h2>
            <div className="mt-4 space-y-3">
              {earningTransactionsFromApi(txListQuery.data?.items ?? []).filter((row) => row.id !== transaction.id).slice(0, 2).map((row) => (
                <button key={row.id} type="button" onClick={() => router.push(`/worker/earnings/${row.id}`)} className="block w-full border-b border-[var(--joballa-border)] pb-3 text-left last:border-0">
                  <p className="font-bold text-[var(--joballa-fg)]">{row.jobTitle}</p>
                  <p className="text-xs text-[var(--joballa-muted)]">{row.employer} · {row.dateLabel}</p>
                  <p className="mt-1 text-sm font-bold text-[var(--joballa-fg)]">{row.amountPrimary}</p>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
