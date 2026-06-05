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

export const WORKER_NOTIFICATIONS: WorkerNotification[] = [
  {
    id: "n1",
    kind: "job",
    filter: "jobs",
    actor: "TechCo Cameroun",
    text: "reviewed your application for Admin Assistant.",
    meta: "Your application is still pending. Keep your profile updated while the employer reviews candidates.",
    avatar: { type: "initials", label: "T", bg: "#0d9488", fg: "#ffffff" },
    timeAgo: "2h",
    read: false,
    href: "/worker/applications/admin-assistant-yde",
  },
  {
    id: "n2",
    kind: "payment",
    filter: "payments",
    actor: "MTN MoMo",
    text: "payment details are ready for payouts.",
    meta: "Primary account: (+237) 652036786. You can review this in Earnings.",
    avatar: { type: "initials", label: "M", bg: "#fbbf24", fg: "#0a0a0a" },
    timeAgo: "3h",
    read: false,
    href: "/worker/earnings",
  },
  {
    id: "n3",
    kind: "job",
    filter: "jobs",
    actor: "joballa",
    text: "found new recommendations matching your profile.",
    meta: "Delivery Rider, Home Tutor-Math & English, and Logistics Coordinator are available now.",
    avatar: { type: "brand" },
    timeAgo: "5h",
    read: false,
    ctaLabel: "View jobs",
    href: "/worker/jobs",
  },
  {
    id: "n4",
    kind: "job",
    filter: "jobs",
    actor: "joballa Education",
    text: "invited shortlisted applicants to review the Home Tutor-Math & English role.",
    meta: "Open the application detail to check requirements and next steps.",
    avatar: { type: "initials", label: "J", bg: "#0d7377", fg: "#ffffff" },
    timeAgo: "8h",
    read: true,
    href: "/worker/applications/home-tutor-math-english",
  },
  {
    id: "n5",
    kind: "payment",
    filter: "payments",
    actor: "Earnings",
    text: "updated your pending balance.",
    meta: "320,000 XAF is pending across active work records.",
    avatar: { type: "initials", label: "₣", bg: "#dcfce7", fg: "#166534" },
    timeAgo: "1d",
    read: false,
    href: "/worker/earnings",
  },
  {
    id: "n6",
    kind: "job",
    filter: "jobs",
    actor: "SwiftRide",
    text: "posted a Delivery Rider role in Buea.",
    meta: "Full-time · 40,000 XAF/mo · Entry level.",
    avatar: { type: "initials", label: "S", bg: "#047857", fg: "#ffffff" },
    timeAgo: "1d",
    read: true,
    href: "/worker/jobs/delivery-rider",
  },
];
