import type { EmployerJobDepartment } from "@/features/employer/types/employer-portal";
import { resolveDepartmentIdByLabel } from "@/features/employer/lib/job-departments";
import type { JobSearchParams } from "@/features/worker/types/worker-portal";

const JOB_TYPE_MAP: Record<string, string> = {
  "Full-time": "FULL_TIME",
  "Part-time": "PART_TIME",
  Contract: "CONTRACT",
  "Temps plein": "FULL_TIME",
  "Temps partiel": "PART_TIME",
  Contrat: "CONTRACT",
};

function payRangeFromLabel(label: string): { minPay?: number; maxPay?: number; minExclusive?: boolean } {
  const normalized = label.trim().toLowerCase();
  if (!normalized || normalized.startsWith("all ") || normalized.startsWith("toutes ")) return {};
  if (normalized.includes("under") || normalized.includes("moins de")) return { maxPay: 50_000 };
  // Check "over" before the 50k–150k band — "150k" contains the substring "50k".
  if (normalized.includes("over") || normalized.includes("plus de")) {
    return { minPay: 150_000, minExclusive: true };
  }
  if (normalized.includes("50k") && normalized.includes("150k")) {
    return { minPay: 50_000, maxPay: 150_000 };
  }
  return {};
}

export function payRangeFromFilterLabel(label?: string): {
  minPay?: number;
  maxPay?: number;
  minExclusive?: boolean;
} {
  return payRangeFromLabel(label?.trim() ?? "");
}

export function jobPayAmountFromListItem(job: { payRate?: number | string | null } & Record<string, unknown>): number | null {
  const amount = job.payRate ?? job.payAmount;
  const n = Number(amount);
  return Number.isFinite(n) ? n : null;
}

export function jobMatchesPayFilter(
  job: { payRate?: number | string | null } & Record<string, unknown>,
  payLabel?: string,
): boolean {
  const range = payRangeFromFilterLabel(payLabel);
  if (range.minPay == null && range.maxPay == null) return true;
  const amount = jobPayAmountFromListItem(job);
  if (amount == null) return false;
  if (range.minPay != null) {
    if (range.minExclusive) {
      if (amount <= range.minPay) return false;
    } else if (amount < range.minPay) {
      return false;
    }
  }
  if (range.maxPay != null && amount > range.maxPay) return false;
  return true;
}

export function buildJobSearchParams(options: {
  keyword?: string;
  city?: string;
  jobTypeLabel?: string;
  payLabel?: string;
  category?: string;
  departments?: EmployerJobDepartment[];
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
  if (category && category !== "__ALL__" && category !== "None" && category !== "Aucun") {
    const departmentId = options.departments?.length
      ? resolveDepartmentIdByLabel(category, options.departments)
      : undefined;
    if (departmentId) params.departmentId = departmentId;
  }

  Object.assign(
    params,
    (() => {
      const range = payRangeFromLabel(options.payLabel ?? "");
      if (range.minExclusive && range.minPay != null) {
        return { minPay: range.minPay + 1 };
      }
      const { minExclusive: _minExclusive, ...apiRange } = range;
      return apiRange;
    })(),
  );

  return params;
}
