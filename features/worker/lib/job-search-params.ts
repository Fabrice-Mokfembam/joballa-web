import type { JobSearchParams } from "@/features/worker/types/worker-portal";

const JOB_TYPE_MAP: Record<string, string> = {
  "Full-time": "FULL_TIME",
  "Part-time": "PART_TIME",
  Contract: "CONTRACT",
  "Temps plein": "FULL_TIME",
  "Temps partiel": "PART_TIME",
  Contrat: "CONTRACT",
};

function payRangeFromLabel(label: string): { minPay?: number; maxPay?: number } {
  if (label.startsWith("All ") || label.startsWith("Toutes ")) return {};
  if (label.includes("Under")) return { maxPay: 50_000 };
  if (label.includes("Moins")) return { maxPay: 50_000 };
  if (label.includes("50k") && label.includes("150k")) return { minPay: 50_000, maxPay: 150_000 };
  if (label.includes("Over")) return { minPay: 150_000 };
  if (label.includes("Plus")) return { minPay: 150_000 };
  return {};
}

export function buildJobSearchParams(options: {
  keyword?: string;
  city?: string;
  jobTypeLabel?: string;
  payLabel?: string;
  category?: string;
  page?: number;
  limit?: number;
}): JobSearchParams {
  const params: JobSearchParams = {
    page: options.page ?? 1,
    limit: options.limit ?? 50,
    sortBy: "createdAt",
    sortOrder: "desc",
  };

  const keyword = options.keyword?.trim();
  if (keyword) params.keyword = keyword;

  const city = options.city?.trim();
  if (city && city !== "__ALL__") params.city = city;

  const mappedType = options.jobTypeLabel ? JOB_TYPE_MAP[options.jobTypeLabel] : undefined;
  if (mappedType) params.jobType = mappedType;

  const category = options.category?.trim();
  if (category && category !== "__ALL__" && category !== "None" && category !== "Aucun") params.category = category;

  Object.assign(params, payRangeFromLabel(options.payLabel ?? ""));

  return params;
}
