import type { CreateWorkerJobBody } from "@/features/worker/types/worker-portal";
import type { JobType, PayStructure } from "@/lib/types/enums";

type PostJobDraft = {
  departmentId: string;
  departmentCategory: CreateWorkerJobBody["departmentCategory"];
  title: string;
  location: string;
  jobType: string;
  pay: string;
  currency?: string;
  per?: string;
  requiredLevel?: string;
  requiredSkills?: string[];
  openings: string;
  startDate: string;
  startAsap?: boolean;
  duration: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
};

function parsePay(raw: string): number {
  const digits = raw.replace(/[^\d]/g, "");
  const n = Number(digits);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
}

function parseLocation(raw: string): { city: string; neighbourhood: string } {
  const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { city: parts[parts.length - 2] ?? "Douala", neighbourhood: parts[parts.length - 1] ?? "" };
  }
  return { city: parts[0] ?? "Douala", neighbourhood: parts[0] ?? "" };
}

function parseDuration(raw: string): { durationValue: number; durationUnit: string } {
  const match = raw.match(/(\d+)\s*(\w+)/i);
  if (match) {
    return { durationValue: Number(match[1]), durationUnit: normalizeDurationUnit(match[2] ?? "Months") };
  }
  return { durationValue: 1, durationUnit: "MONTHS" };
}

function normalizeDurationUnit(unit: string): string {
  const trimmed = unit.trim().toLowerCase();
  if (trimmed.startsWith("day")) return "DAYS";
  if (trimmed.startsWith("week")) return "WEEKS";
  if (trimmed.startsWith("month")) return "MONTHS";
  if (trimmed.startsWith("year")) return "YEARS";
  return trimmed.toUpperCase();
}

const JOB_TYPE_MAP: Record<string, JobType> = {
  "full time": "FULL_TIME",
  "full-time": "FULL_TIME",
  full_time: "FULL_TIME",
  "part time": "PART_TIME",
  "part-time": "PART_TIME",
  part_time: "PART_TIME",
  contract: "CONTRACT",
  temporary: "CASUAL",
  casual: "CASUAL",
  seasonal: "SEASONAL",
  internship: "INTERNSHIP",
};

function mapJobType(raw: string): JobType {
  const key = raw.trim().toLowerCase().replace(/-/g, " ").replace(/_/g, " ");
  if (JOB_TYPE_MAP[key]) return JOB_TYPE_MAP[key]!;
  const upper = raw.trim().toUpperCase();
  if (upper in JOB_TYPE_MAP) return JOB_TYPE_MAP[upper]!;
  if (["FULL_TIME", "PART_TIME", "CONTRACT", "CASUAL", "SEASONAL", "INTERNSHIP"].includes(upper)) {
    return upper as JobType;
  }
  return "FULL_TIME";
}

const PAY_STRUCTURE_MAP: Record<string, PayStructure> = {
  month: "MONTHLY",
  monthly: "MONTHLY",
  hour: "HOURLY",
  hourly: "HOURLY",
  day: "DAILY",
  daily: "DAILY",
  week: "WEEKLY",
  weekly: "WEEKLY",
  fixed: "FIXED",
};

function mapPayStructure(raw: string): PayStructure {
  const key = raw.trim().toLowerCase();
  if (PAY_STRUCTURE_MAP[key]) return PAY_STRUCTURE_MAP[key]!;
  const upper = raw.trim().toUpperCase();
  if (["HOURLY", "DAILY", "WEEKLY", "MONTHLY", "FIXED"].includes(upper)) {
    return upper as PayStructure;
  }
  return "MONTHLY";
}

export function mapDraftToCreateWorkerJobBody(draft: PostJobDraft, asDraft: boolean): CreateWorkerJobBody {
  const { city, neighbourhood } = parseLocation(draft.location);
  const { durationValue, durationUnit } = parseDuration(draft.duration);
  const payRate = parsePay(draft.pay);

  return {
    departmentId: draft.departmentId.trim(),
    departmentCategory: draft.departmentCategory,
    paymentManagedByJoballa: true,
    formData: {
      title: draft.title.trim() || "Untitled job",
      city,
      neighbourhood,
      description: draft.description.trim() || "Job description",
      requiredSkills: draft.requiredSkills?.filter(Boolean) ?? [],
      requiredLevel: draft.requiredLevel || "Mid",
      employmentType: mapJobType(draft.jobType).toLowerCase(),
      durationValue,
      durationUnit: durationUnit.toLowerCase(),
      payAmount: payRate > 0 ? payRate : 1,
      payCurrency: draft.currency || "XAF",
      payStructure: mapPayStructure(draft.per || "Month").toLowerCase(),
      numberOfOpenings: Math.max(1, Number(draft.openings) || 1),
      startDate: draft.startAsap || draft.startDate.includes("ASAP") ? undefined : draft.startDate || undefined,
      startNow: draft.startAsap || draft.startDate.toLowerCase().includes("asap"),
      requirements: draft.requirements.filter(Boolean),
      responsibilities: draft.responsibilities.filter(Boolean),
      asDraft,
    },
  };
}
