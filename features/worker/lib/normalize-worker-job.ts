import type { WorkerJobEmployer, WorkerJobListItem } from "@/features/worker/types/worker-portal";

type RawWorkerJob = WorkerJobListItem & {
  payAmount?: number | string | null;
  payCurrency?: string;
  ownerName?: string;
  ownerVerified?: boolean;
  employmentType?: string;
};

/** Map v2 job cards to fields expected by `workerJobCardFromApi`. */
export function normalizeWorkerJobListItem(raw: RawWorkerJob): WorkerJobListItem {
  const input = raw && typeof raw === "object" ? raw : ({} as RawWorkerJob);
  const ownerName = typeof input.ownerName === "string" ? input.ownerName.trim() : "";
  const rawEmployer =
    input.employer && typeof input.employer === "object"
      ? (input.employer as WorkerJobEmployer)
      : undefined;
  const employer =
    rawEmployer
      ? {
          ...rawEmployer,
          companyName:
            rawEmployer.companyName != null ? String(rawEmployer.companyName) : undefined,
          name: rawEmployer.name != null ? String(rawEmployer.name) : undefined,
          logoUrl: typeof rawEmployer.logoUrl === "string" ? rawEmployer.logoUrl : null,
        }
      :
    (ownerName
      ? {
          companyName: ownerName,
          name: ownerName,
        }
      : undefined);

  return {
    ...input,
    id: String(input.id ?? input.slug ?? ""),
    slug: input.slug != null ? String(input.slug) : undefined,
    title: String(input.title ?? ""),
    saved: !!(input.saved ?? input.isSaved ?? (input as { savedByViewer?: boolean }).savedByViewer),
    isSaved: !!(input.saved ?? input.isSaved ?? (input as { savedByViewer?: boolean }).savedByViewer),
    city: input.city != null ? String(input.city) : null,
    region: input.region != null ? String(input.region) : null,
    createdAt: input.createdAt != null ? String(input.createdAt) : input.postedAt != null ? String(input.postedAt) : undefined,
    postedAt: input.postedAt != null ? String(input.postedAt) : input.createdAt != null ? String(input.createdAt) : undefined,
    payRate: input.payRate ?? input.payAmount ?? null,
    currency: String(input.currency ?? input.payCurrency ?? "XAF"),
    jobType: input.jobType ?? input.employmentType,
    companyName:
      input.companyName != null
        ? String(input.companyName)
        : employer?.companyName ?? (ownerName || undefined),
    employer,
  };
}

export function normalizeWorkerJobList(items: WorkerJobListItem[]): WorkerJobListItem[] {
  return items.map((item) => normalizeWorkerJobListItem(item as RawWorkerJob));
}
