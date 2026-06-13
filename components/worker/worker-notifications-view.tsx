"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/lib/i18n/navigation";
import {
  usePatchWorkerNotificationRead,
  usePatchWorkerNotificationsReadAll,
  useWorkerNotifications,
} from "@/features/worker/hooks";
import { workerNotificationsFromApi } from "@/features/shared/lib/notification-mappers";
import type { WorkerNotificationFilter } from "@/lib/worker-notifications-data";
import { WorkerApplicationsPageSkeleton } from "@/components/worker/worker-loading-skeletons";
import { cn } from "@/lib/utils";

const FILTERS: WorkerNotificationFilter[] = ["all", "jobs", "payments"];

function NotificationAvatar({ avatar }: { avatar: { type: string; label?: string; bg?: string; fg?: string } }) {
  if (avatar.type === "brand") {
    return (
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--joballa-primary)] text-sm font-bold text-white">
        J
      </span>
    );
  }
  return (
    <span
      className="grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold"
      style={{ backgroundColor: avatar.bg ?? "#0d9488", color: avatar.fg ?? "#fff" }}
    >
      {avatar.label ?? "?"}
    </span>
  );
}

export function WorkerNotificationsView() {
  const t = useTranslations("worker.notifications");
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<WorkerNotificationFilter>("all");
  const notificationsQuery = useWorkerNotifications({
    filter: activeFilter,
    page: 1,
    limit: 50,
  });
  const markRead = usePatchWorkerNotificationRead();
  const markAllRead = usePatchWorkerNotificationsReadAll();

  const items = useMemo(
    () => workerNotificationsFromApi(notificationsQuery.data?.items ?? []),
    [notificationsQuery.data?.items],
  );
  const hasUnread = items.some((item) => !item.read);

  if (notificationsQuery.isLoading) return <WorkerApplicationsPageSkeleton />;

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-3 bg-[var(--joballa-page-tint)]">
      <div className="sr-only">
        <h1>{t("title")}</h1>
        <p>{t("description")}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
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
        {hasUnread ? (
          <button
            type="button"
            disabled={markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
            className="text-sm font-medium text-[var(--joballa-primary)] hover:underline disabled:opacity-50"
          >
            {t("markAllRead")}
          </button>
        ) : null}
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
                <NotificationAvatar avatar={item.avatar} />
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
  );
}
