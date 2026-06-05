import type {
  WorkerApplicationListItem,
  WorkerDashboard,
  WorkerDashboardStat,
  WorkerJobListItem,
} from "@/features/worker/types/worker-portal";

/** v2 `GET /worker/dashboard` — `routedocs/FRONTEND_WORKER_ROUTES.md` */
export type WorkerDashboardApiV2 = {
  welcomeName?: string;
  verificationStatus?: string;
  profileCompleteness?: number;
  stats?: {
    totalEarnings?: number;
    activeApplications?: number;
    jobsCompleted?: number;
    savedJobs?: number;
  };
  recentApplications?: WorkerApplicationListItem[];
  suggestedJobs?: WorkerJobListItem[];
  nextActions?: Array<{ key: string; label: string; href: string }>;
};

function statCount(count?: number): WorkerDashboardStat {
  return count != null ? { count } : {};
}

function statAmount(amount?: number, currency = "XAF"): WorkerDashboardStat {
  return amount != null ? { amount, currency } : {};
}

function isUiDashboard(raw: unknown): raw is WorkerDashboard {
  return (
    typeof raw === "object" &&
    raw !== null &&
    "greeting" in raw &&
    typeof (raw as WorkerDashboard).greeting === "object" &&
    (raw as WorkerDashboard).greeting != null
  );
}

function asJobListItem(job: unknown): WorkerJobListItem | null {
  if (!job || typeof job !== "object") return null;
  const j = job as Record<string, unknown>;
  const id = String(j.id ?? j.jobId ?? j.slug ?? "");
  const title = String(j.title ?? "");
  if (!id || !title) return null;
  return { ...(j as WorkerJobListItem), id, title };
}

function asApplicationListItem(app: unknown): WorkerApplicationListItem | null {
  if (!app || typeof app !== "object") return null;
  const a = app as WorkerApplicationListItem;
  const id = String(a.id ?? "");
  if (!id) return null;
  return a;
}

function mapV2Dashboard(raw: WorkerDashboardApiV2): WorkerDashboard {
  const applications = (raw.recentApplications ?? [])
    .map(asApplicationListItem)
    .filter((a): a is WorkerApplicationListItem => a != null);
  const shortlistedCount = applications.filter(
    (a) => String(a.status ?? "").toLowerCase() === "shortlisted",
  ).length;
  const suggestedJobs = (raw.suggestedJobs ?? [])
    .map(asJobListItem)
    .filter((j): j is WorkerJobListItem => j != null);

  return {
    greeting: {
      name: raw.welcomeName?.trim() || "there",
    },
    stats: {
      activeApplications: statCount(raw.stats?.activeApplications),
      shortlisted: statCount(shortlistedCount),
      profileViews: {},
      earnings: statAmount(raw.stats?.totalEarnings),
    },
    recommendedJobs: suggestedJobs,
    applications,
    profileCompleteness: raw.profileCompleteness,
  };
}

/** Normalize live API or demo-shaped dashboard for the worker dashboard UI. */
export function normalizeWorkerDashboard(raw: unknown): WorkerDashboard {
  if (isUiDashboard(raw)) {
    return {
      ...raw,
      greeting: {
        name: raw.greeting.name?.trim() || "there",
        profileSetupMessage: raw.greeting.profileSetupMessage,
      },
      recommendedJobs: raw.recommendedJobs ?? [],
      applications: raw.applications ?? [],
    };
  }
  return mapV2Dashboard((raw ?? {}) as WorkerDashboardApiV2);
}
