"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { useEmployerPayment } from "@/features/employer/hooks";
import { EmployerAsyncState } from "@/components/employer/employer-async-state";
import { portalCardClass, portalPageShellClass } from "@/components/portal/portal-ui";
import { IconChevronLeft } from "@/components/worker/icons";
import { cn } from "@/lib/utils";

export function EmployerPaymentDetailPage({ paymentId }: { paymentId: string }) {
  const t = useTranslations("employer.payroll");
  const payment = useEmployerPayment(paymentId);
  const row = payment.data ?? {};

  const amount = Number(row.amount ?? 0);
  const currency = String(row.currency ?? "XAF");
  const status = String(row.status ?? "—");
  const workerName = String(row.workerName ?? row.workerId ?? paymentId);
  const period = String(row.period ?? row.createdAt ?? "");

  return (
    <div className={cn(portalPageShellClass, "gap-6")}>
      <Link
        href="/employer/payroll"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--joballa-muted)] hover:text-[var(--joballa-fg)]"
      >
        <IconChevronLeft className="size-5" />
        {t("title")}
      </Link>

      <EmployerAsyncState
        isLoading={payment.isLoading}
        isError={payment.isError}
        error={payment.error}
        onRetry={() => void payment.refetch()}
      >
        <section className={cn(portalCardClass(), "space-y-4 p-6")}>
          <h1 className="text-2xl font-bold text-[var(--joballa-fg)]">{workerName}</h1>
          <p className="text-sm text-[var(--joballa-muted)]">{period}</p>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-[var(--joballa-fg)]">{t("history.amount")}</dt>
              <dd className="text-[var(--joballa-muted)]">
                {amount.toLocaleString()} {currency}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--joballa-fg)]">{t("table.action")}</dt>
              <dd className="capitalize text-[var(--joballa-muted)]">{status}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-semibold text-[var(--joballa-fg)]">ID</dt>
              <dd className="font-mono text-xs text-[var(--joballa-muted)]">{paymentId}</dd>
            </div>
          </dl>
        </section>
      </EmployerAsyncState>
    </div>
  );
}
