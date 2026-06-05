"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { useEmployerInformalRequests } from "@/features/employer/hooks";
import { EmployerAsyncState } from "@/components/employer/employer-async-state";
import { portalCardClass, portalPageShellClass } from "@/components/portal/portal-ui";
import { buttonClassName } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmployerInformalRequestsView() {
  const t = useTranslations("employer.requests");
  const list = useEmployerInformalRequests({ page: 1, limit: 50 });
  const rows = list.data?.items ?? [];

  return (
    <div className={cn(portalPageShellClass, "gap-6")}>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--joballa-fg)]">{t("title")}</h1>
          <p className="mt-1 text-sm text-[var(--joballa-muted)]">{t("description")}</p>
        </div>
        <Link href="/employer/requests/new" className={buttonClassName("primary")}>
          {t("new")}
        </Link>
      </header>

      <EmployerAsyncState
        isLoading={list.isLoading}
        isError={list.isError}
        error={list.error}
        onRetry={() => void list.refetch()}
      >
        <ul className={cn(portalCardClass(), "divide-y divide-[var(--joballa-border)] overflow-hidden")}>
          {rows.length === 0 ? (
            <li className="px-4 py-10 text-center text-sm text-[var(--joballa-muted)]">{t("empty")}</li>
          ) : (
            rows.map((req) => (
              <li key={req.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-4 text-sm">
                <div>
                  <p className="font-semibold text-[var(--joballa-fg)]">{req.title}</p>
                  <p className="text-xs text-[var(--joballa-muted)]">
                    {req.department.name} · {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="rounded-full bg-[var(--joballa-tag-bg)] px-3 py-1 text-xs font-semibold capitalize text-[var(--joballa-tag-fg)]">
                  {req.status.replace(/_/g, " ")}
                </span>
              </li>
            ))
          )}
        </ul>
      </EmployerAsyncState>
    </div>
  );
}
