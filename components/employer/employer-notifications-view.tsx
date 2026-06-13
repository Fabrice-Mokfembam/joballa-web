"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import {
  useEmployerNotifications,
  usePatchEmployerNotificationRead,
} from "@/features/employer/hooks";
import { employerNotificationsFromApi } from "@/features/shared/lib/notification-mappers";
import type { EmployerNotificationFilter } from "@/features/employer/types/employer-portal";
import { EmployerAsyncState } from "@/components/employer/employer-async-state";
import { cn } from "@/lib/utils";

const FILTERS: EmployerNotificationFilter[] = ["all", "applicants", "payments"];

export function EmployerNotificationsView() {
  const t = useTranslations("employer.notifications");
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<EmployerNotificationFilter>("all");
  const notificationsQuery = useEmployerNotifications({ filter: activeFilter, page: 1, limit: 50 });
  const markRead = usePatchEmployerNotificationRead();

  const items = useMemo(
    () => employerNotificationsFromApi(notificationsQuery.data?.items ?? []),
    [notificationsQuery.data?.items],
  );

  return (
    <EmployerAsyncState
      isLoading={notificationsQuery.isLoading}
      isError={notificationsQuery.isError}
      error={notificationsQuery.error}
      onRetry={() => void notificationsQuery.refetch()}
    >
      <div className="flex w-full min-w-0 flex-1 flex-col gap-3 bg-[var(--joballa-page-tint)]">
        <header>
          <h1 className="text-2xl font-bold text-[var(--joballa-fg)]">{t("title")}</h1>
          <p className="mt-1 text-sm text-[var(--joballa-muted)]">{t("description")}</p>
        </header>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={
                activeFilter === filter
                  ? "inline-flex h-9 items-center rounded-full border border-[var(--joballa-primary)] bg-[var(--joballa-primary)] px-4 text-sm font-medium text-white"
                  : "inline-flex h-9 items-center rounded-full border border-[var(--joballa-border)] bg-[var(--joballa-card)] px-4 text-sm font-medium text-[var(--joballa-muted)]"
              }
            >
              {t(`filters.${filter}`)}
            </button>
          ))}
        </div>

        {items.length === 0 ? (
          <p className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] px-6 py-10 text-center text-sm text-[var(--joballa-muted)]">
            {t("empty")}
          </p>
        ) : (
          <ul className="divide-y divide-[var(--joballa-border)] overflow-hidden rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)]">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (!item.read) markRead.mutate(item.id);
                    if (item.href) void router.push(item.href);
                  }}
                  className={cn(
                    "flex w-full gap-3 px-4 py-4 text-left transition hover:bg-[var(--joballa-row-hover)]",
                    !item.read && "bg-[var(--joballa-jade-3)]/30",
                  )}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--joballa-primary)] text-sm font-bold text-white">
                    J
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[var(--joballa-fg)]">
                      <span className="font-semibold">{item.actor}</span> {item.text}
                    </p>
                    {item.meta ? <p className="mt-1 text-xs text-[var(--joballa-muted)]">{item.meta}</p> : null}
                    <p className="mt-1 text-xs text-[var(--joballa-muted)]">{item.timeAgo}</p>
                  </div>
                  {!item.read ? <span className="mt-2 size-2 shrink-0 rounded-full bg-[var(--joballa-primary)]" /> : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </EmployerAsyncState>
  );
}
