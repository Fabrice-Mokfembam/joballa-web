"use client";

import { Suspense, useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/lib/i18n/navigation";
import { EmployerAsyncState } from "@/components/employer/employer-async-state";
import { EmployerWorkforceStatusBadge } from "@/components/employer/employer-workforce-status-badge";
import { formatStatHint, formatStatValue } from "@/features/employer/lib/applicant-helpers";
import { useEmployerWorkforce } from "@/features/employer/hooks";
import type { EmployerDashboardStat, EmployerWorkforceListItem, EmployerWorkforceStatus } from "@/features/employer/types/employer-portal";
import { useEmployerPortalStore } from "@/lib/stores/employer-portal-store";
import { portalCardClass, portalPageShellClass, PortalStatCard } from "@/components/portal/portal-ui";
import { cn } from "@/lib/utils";

type StatusTab = "all" | "active" | "terminated";

const STATUS_TABS: StatusTab[] = ["all", "active", "terminated"];

function workerRowId(worker: EmployerWorkforceListItem): string {
  return String(worker.workerId ?? worker.id ?? "");
}

function workerRowName(worker: EmployerWorkforceListItem): string {
  return String(worker.fullName ?? worker.name ?? "Worker");
}

function formatJoinedDate(value?: string): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function statCard(
  stats: Record<string, unknown> | undefined,
  key: string,
): EmployerDashboardStat | undefined {
  const value = stats?.[key];
  if (value && typeof value === "object" && "count" in value) {
    return value as EmployerDashboardStat;
  }
  return undefined;
}

function formatStatCount(value: string | number | undefined): string {
  if (value == null || value === "") return "—";
  const numeric = Number(value);
  if (!Number.isNaN(numeric)) return String(numeric).padStart(2, "0");
  return String(value);
}

function WorkforceViewInner() {
  const t = useTranslations("employer.workforce");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const workerParam = searchParams.get("worker");

  const status = useEmployerPortalStore((s) => s.workforceStatus);
  const setWorkforceStatus = useEmployerPortalStore((s) => s.setWorkforceStatus);
  const workforce = useEmployerWorkforce({ status, page: 1, limit: 50 });

  const items = workforce.data?.items ?? [];
  const stats = workforce.data?.stats ?? {};
  const tabCounts = (stats.tabCounts as { all?: number; active?: number; terminated?: number } | undefined) ?? {
    all: workforce.data?.total ?? items.length,
    active: items.filter((w) => String(w.status ?? "active") === "active").length,
    terminated: items.filter((w) => {
      const value = String(w.status ?? "active");
      return value === "terminated" || value === "rejected";
    }).length,
  };

  const selectedWorker = useMemo(
    () => items.find((w) => workerRowId(w) === workerParam) ?? null,
    [items, workerParam],
  );

  const selectWorker = useCallback(
    (id: string) => {
      router.replace(`${pathname}?worker=${encodeURIComponent(id)}`);
    },
    [pathname, router],
  );

  const statusLabels: Record<EmployerWorkforceStatus | string, string> = {
    active: t("status.active"),
    terminated: t("status.terminated"),
    rejected: t("status.rejected"),
  };

  useEffect(() => {
    if (!workerParam || workforce.isLoading) return;
    if (workforce.isSuccess && !selectedWorker) {
      router.replace(pathname);
    }
  }, [pathname, router, selectedWorker, workerParam, workforce.isLoading, workforce.isSuccess]);

  useEffect(() => {
    if (!workerParam && items.length > 0) {
      selectWorker(workerRowId(items[0]!));
    }
  }, [items, selectWorker, workerParam]);

  return (
    <div className={cn(portalPageShellClass, "gap-[26px]")}>
      <header>
        <h1 className="text-2xl font-bold text-[var(--joballa-fg)]">{t("title")}</h1>
        <p className="mt-1 text-sm text-[var(--joballa-muted)]">{t("description")}</p>
      </header>

      <EmployerAsyncState
        isLoading={workforce.isLoading}
        isError={workforce.isError}
        error={workforce.error}
        onRetry={() => void workforce.refetch()}
      >
        <div className="grid gap-[22px] md:grid-cols-3">
          <PortalStatCard
            variant="workforce"
            label={t("stats.activeWorkers")}
            value={formatStatCount(formatStatValue(statCard(stats, "activeWorkers")))}
            hint={formatStatHint(statCard(stats, "activeWorkers"))}
          />
          <PortalStatCard
            variant="workforce"
            label={t("stats.engagementsEnded")}
            value={formatStatCount(formatStatValue(statCard(stats, "engagementsEnded")))}
            hint={formatStatHint(statCard(stats, "engagementsEnded"))}
            hintTone="negative"
          />
        </div>

        <section className={cn(portalCardClass(), "gap-3.5 overflow-hidden px-3 pt-3")}>
          <div className="flex flex-wrap gap-2.5">
            {STATUS_TABS.map((value) => {
              const active = status === value;
              const count = tabCounts[value] ?? 0;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setWorkforceStatus(value)}
                  className={cn(
                    "inline-flex h-8 items-center justify-center rounded-xl px-2.5 text-sm font-medium transition",
                    active
                      ? "border border-[var(--joballa-border)] bg-[var(--joballa-card)] text-[var(--joballa-fg)]"
                      : "text-[var(--joballa-muted)] hover:text-[var(--joballa-fg)]",
                  )}
                >
                  {t(`filters.${value}`)}({String(count).padStart(2, "0")})
                </button>
              );
            })}
          </div>

          {items.length === 0 ? (
            <p className="px-1 py-10 text-center text-sm text-[var(--joballa-muted)]">{t("empty")}</p>
          ) : (
            <div className="border-t border-[var(--joballa-border)]">
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(170px,1.2fr)_minmax(170px,1.2fr)_minmax(0,0.7fr)_minmax(0,0.7fr)] text-xs">
                <div className="p-2.5 font-semibold text-[var(--joballa-table-header)]">{t("table.dateJoined")}</div>
                <div className="p-2.5 font-semibold text-[var(--joballa-table-header)]">{t("table.worker")}</div>
                <div className="p-2.5 font-semibold text-[var(--joballa-table-header)]">{t("table.role")}</div>
                <div className="p-2.5 font-semibold text-[var(--joballa-table-header)]">{t("table.jobType")}</div>
                <div className="p-2.5 text-right font-semibold text-[var(--joballa-table-header)]">{t("table.status")}</div>

                {items.map((worker) => {
                  const id = workerRowId(worker);
                  const rowStatus = String(worker.status ?? "active") as EmployerWorkforceStatus;
                  const isSelected = id === workerParam;

                  return (
                    <div
                      key={id}
                      role="button"
                      tabIndex={0}
                      onClick={() => selectWorker(id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          selectWorker(id);
                        }
                      }}
                      className={cn(
                        "col-span-full grid cursor-pointer grid-cols-subgrid items-center rounded-[10px] py-1 transition hover:bg-[var(--joballa-row-hover)]",
                        isSelected && "border-2 border-[var(--joballa-jade-8)] bg-[var(--joballa-row-selected)]",
                      )}
                    >
                      <div className="p-2.5 text-xs text-[var(--joballa-fg)]">
                        {formatJoinedDate(String(worker.dateJoined ?? ""))}
                      </div>
                      <div className="p-2.5">
                        <Link
                          href={`/employer/workforce/${encodeURIComponent(id)}`}
                          onClick={(event) => event.stopPropagation()}
                          className="flex items-center gap-2.5 text-xs text-[var(--joballa-fg)] transition hover:text-[var(--joballa-primary)]"
                        >
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--joballa-primary)] text-[8px] font-bold text-[var(--joballa-on-primary)]">
                            {workerRowName(worker).charAt(0)}
                          </span>
                          {workerRowName(worker)}
                        </Link>
                      </div>
                      <div className="p-2.5 text-xs text-[var(--joballa-fg)]">{String(worker.role ?? "—")}</div>
                      <div className="p-2.5 text-xs text-[var(--joballa-fg)]">{String(worker.jobType ?? "—")}</div>
                      <div className="px-2.5 py-2">
                        <EmployerWorkforceStatusBadge
                          status={rowStatus}
                          label={statusLabels[rowStatus] ?? rowStatus}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

      </EmployerAsyncState>
    </div>
  );
}

export function EmployerWorkforceView() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-[14px] bg-[var(--joballa-card)]" aria-busy />}>
      <WorkforceViewInner />
    </Suspense>
  );
}
