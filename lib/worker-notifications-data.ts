export type WorkerNotificationKind = "job" | "payment";
export type WorkerNotificationFilter = "all" | "jobs" | "payments";
export type WorkerNotificationAvatar =
  | { type: "brand" }
  | { type: "initials"; label: string; bg: string; fg?: string };

export type WorkerNotification = {
  id: string;
  kind: WorkerNotificationKind;
  filter: Exclude<WorkerNotificationFilter, "all">;
  actor?: string;
  text: string;
  meta?: string;
  avatar: WorkerNotificationAvatar;
  timeAgo: string;
  read: boolean;
  ctaLabel?: string;
  href?: string;
};
