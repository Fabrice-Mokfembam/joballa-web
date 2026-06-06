export function buildEmployerJobBody(job, departmentId) {
  const employmentType = mapEmploymentType(job.employmentType);
  const payStructure = mapPayStructure(job.per);
  const workMode = mapWorkMode(job.workMode);
  const experienceLevel = mapExperienceLevel(job.experienceLevel);

  return {
    departmentId,
    title: job.title,
    employmentType,
    workMode,
    country: "Cameroon",
    region: job.region,
    city: job.city,
    neighbourhood: job.neighbourhood,
    description: job.description,
    requiredSkills: job.skills,
    experienceLevel,
    duration: `${job.durationValue} ${job.durationUnit}`,
    payAmount: job.pay,
    payCurrency: "XAF",
    payStructure,
    numberOfOpenings: job.numberOfOpenings,
    startAsap: job.startAsap,
    startDate: job.startAsap ? null : job.startDate,
    startNow: job.startAsap,
    requirements: job.requirements,
    responsibilities: job.responsibilities,
    paymentManagedByJoballa: true,
    asDraft: false,
  };
}

export function buildEmployerJobBodyLegacy(job) {
  return {
    title: job.title,
    city: job.city,
    neighbourhood: job.neighbourhood,
    description: job.description,
    requiredSkills: job.skills,
    requiredLevel: job.experienceLevel,
    employmentType: job.employmentType,
    durationValue: job.durationValue,
    durationUnit: job.durationUnit,
    pay: job.pay,
    currency: "XAF",
    per: job.per,
    numberOfOpenings: job.numberOfOpenings,
    startAsap: job.startAsap,
    startDate: job.startAsap ? undefined : job.startDate,
    requirements: job.requirements,
    responsibilities: job.responsibilities,
    asDraft: false,
  };
}

function mapEmploymentType(value) {
  const map = {
    "Full Time": "full_time",
    "Part Time": "part_time",
    Contract: "contract",
    Internship: "internship",
  };
  return map[value] ?? String(value).toLowerCase().replace(/[\s-]+/g, "_");
}

function mapPayStructure(value) {
  const v = String(value).toLowerCase();
  if (v.includes("hour")) return "hourly";
  if (v.includes("day")) return "daily";
  if (v.includes("week")) return "weekly";
  if (v.includes("month")) return "monthly";
  return "fixed";
}

function mapWorkMode(value) {
  const v = String(value).toLowerCase().replace(/[\s-]+/g, "_");
  if (v === "on_site") return "onsite";
  if (v === "remote" || v === "hybrid" || v === "onsite") return v;
  return "onsite";
}

function mapExperienceLevel(value) {
  const v = String(value).toLowerCase().replace(/[\s-]+/g, "_");
  if (["entry", "junior", "mid", "senior", "lead"].includes(v)) return v;
  return "mid";
}
