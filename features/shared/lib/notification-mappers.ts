import type { EmployerNotification } from "@/features/employer/types/employer-portal";
import type { WorkerNotificationItem } from "@/features/worker/types/worker-portal";
import type { WorkerNotification, WorkerNotificationFilter } from "@/lib/worker-notifications-data";

function formatTimeAgo(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 24) return `${Math.max(1, hours)}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

function notificationFilter(type?: string): Exclude<WorkerNotificationFilter, "all"> {
  const normalized = String(type ?? "").toLowerCase();
  if (normalized.includes("payment")) return "payments";
  return "jobs";
}

function mapApiNotification(
  item: EmployerNotification | WorkerNotificationItem,
): WorkerNotification {
  const filter = notificationFilter(item.type);
  const title = item.title ?? "Joballa";
  const body = item.body ?? "";
  return {
    id: item.id,
    kind: filter === "payments" ? "payment" : "job",
    filter,
    actor: title,
    text: body,
    meta: body,
    avatar: { type: "brand" },
    timeAgo: formatTimeAgo(item.createdAt),
    read: item.read,
    href: item.deepLink ?? undefined,
  };
}

export function workerNotificationsFromApi(items: WorkerNotificationItem[]): WorkerNotification[] {
  return items.map(mapApiNotification);
}

export function employerNotificationsFromApi(items: EmployerNotification[]): WorkerNotification[] {
  return items.map(mapApiNotification);
}

export function unreadNotificationCount(items: Array<{ read: boolean }>): number {
  return items.filter((n) => !n.read).length;
}
