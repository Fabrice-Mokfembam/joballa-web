import type { CreateEmployerJobBody } from "@/features/employer/types/employer-portal";

type PostJobDraft = {
  department: string;
  title: string;
  location: string;
  jobType: string;
  workMode: string;
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
  return Number.isFinite(n) && n > 0 ? n : 0;
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
    return { durationValue: Number(match[1]), durationUnit: match[2] };
  }
  return { durationValue: 1, durationUnit: "Months" };
}

export function mapDraftToCreateJobBody(draft: PostJobDraft, asDraft: boolean): CreateEmployerJobBody {
  const { city, neighbourhood } = parseLocation(draft.location);
  const { durationValue, durationUnit } = parseDuration(draft.duration);
  const pay = parsePay(draft.pay);

  return {
    departmentId: draft.department.trim(),
    title: draft.title.trim() || "Untitled job",
    workMode: normalizeWorkMode(draft.workMode),
    country: "Cameroon",
    city,
    neighbourhood: neighbourhood || undefined,
    description: draft.description.trim() || "Job description",
    requiredSkills: draft.requiredSkills?.filter(Boolean) ?? [],
    experienceLevel: normalizeExperienceLevel(draft.requiredLevel || "Mid"),
    employmentType: normalizeEmploymentType(draft.jobType || "Full Time"),
    duration: `${durationValue} ${durationUnit}`.trim(),
    payAmount: pay || 1,
    payCurrency: "XAF",
    payStructure: normalizePayStructure(draft.per || "Month"),
    numberOfOpenings: Math.max(1, Number(draft.openings) || 1),
    startDate: draft.startAsap || draft.startDate.includes("ASAP") ? null : draft.startDate || null,
    startNow: draft.startAsap || draft.startDate.toLowerCase().includes("asap"),
    requirements: draft.requirements.filter(Boolean),
    responsibilities: draft.responsibilities.filter(Boolean),
    paymentManagedByJoballa: true,
    asDraft,
  };
}

function normalizeEmploymentType(raw: string): string {
  const value = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (value === "temporary") return "casual";
  if (["full_time", "part_time", "contract", "casual", "seasonal", "internship"].includes(value)) return value;
  return "full_time";
}

function normalizeWorkMode(raw: string): string {
  const value = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (value === "on_site") return "onsite";
  if (["onsite", "remote", "hybrid"].includes(value)) return value;
  return "onsite";
}

function normalizePayStructure(raw: string): string {
  const value = raw.trim().toLowerCase();
  if (value.startsWith("hour")) return "hourly";
  if (value.startsWith("day")) return "daily";
  if (value.startsWith("week")) return "weekly";
  if (value.startsWith("month")) return "monthly";
  return "fixed";
}

function normalizeExperienceLevel(raw: string): string {
  const value = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (["entry", "junior", "mid", "senior", "lead", "tutor", "not_required"].includes(value)) return value;
  return "mid";
}
