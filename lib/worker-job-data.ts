export type WorkerJobCard = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  seniority: string;
  pay: string;
  posted: string;
  match?: number;
  company: string;
  companyInitial: string;
  companyColor: string;
  companyLogoUrl?: string | null;
};

export const WORKER_JOB_CARDS: WorkerJobCard[] = [
  {
    id: "admin-assistant-yde",
    slug: "admin-assistant-yde",
    title: "Admin Assistant",
    subtitle: "Part-time • Yaoundé",
    seniority: "Senior",
    pay: "45,000 XAF/m",
    posted: "1w",
    match: 45,
    company: "TechCo Cameroun",
    companyInitial: "T",
    companyColor: "bg-teal-600",
  },
  {
    id: "marketing-specialist-dla",
    slug: "marketing-specialist-dla",
    title: "Marketing Specialist",
    subtitle: "Full-time • Douala",
    seniority: "Lead",
    pay: "120,000 XAF/m",
    posted: "2d",
    match: 75,
    company: "joballa Education",
    companyInitial: "J",
    companyColor: "bg-[var(--joballa-primary)]",
  },
  {
    id: "graphic-designer-remote",
    slug: "graphic-designer-remote",
    title: "Graphic Designer",
    subtitle: "Contract • Remote",
    seniority: "Junior",
    pay: "5,000 XAF/h",
    posted: "3d",
    company: "Creative Hub CM",
    companyInitial: "C",
    companyColor: "bg-violet-600",
  },
  {
    id: "home-tutor-math-english",
    slug: "home-tutor-math-english",
    title: "Home Tutor-Math & English",
    subtitle: "Part-time • Buea",
    seniority: "Tutor",
    pay: "35,000 XAF/m",
    posted: "5d",
    match: 70,
    company: "joballa Education",
    companyInitial: "J",
    companyColor: "bg-[var(--joballa-primary)]",
  },
  {
    id: "software-engineer-dla",
    slug: "software-engineer-dla",
    title: "Software Engineer",
    subtitle: "Full-time • Douala",
    seniority: "Senior",
    pay: "320,000 XAF/m",
    posted: "1w",
    match: 70,
    company: "TechCo Cameroun",
    companyInitial: "T",
    companyColor: "bg-teal-600",
  },
  {
    id: "logistics-coordinator",
    slug: "logistics-coordinator",
    title: "Logistics Coordinator",
    subtitle: "Full-time • Limbe",
    seniority: "Mid",
    pay: "95,000 XAF/m",
    posted: "4d",
    company: "PortServe CM",
    companyInitial: "P",
    companyColor: "bg-amber-600",
  },
  {
    id: "events-host",
    slug: "events-host",
    title: "Events Host",
    subtitle: "Part-time • Yaoundé",
    seniority: "Junior",
    pay: "8,000 XAF/day",
    posted: "2w",
    company: "Bright Events",
    companyInitial: "B",
    companyColor: "bg-rose-600",
  },
  {
    id: "caregiver-douala",
    slug: "caregiver-douala",
    title: "Caregiver",
    subtitle: "Part-time • Douala",
    seniority: "Senior",
    pay: "55,000 XAF/m",
    posted: "6d",
    match: 62,
    company: "CareFirst CM",
    companyInitial: "C",
    companyColor: "bg-sky-600",
  },
  {
    id: "delivery-rider",
    slug: "delivery-rider",
    title: "Delivery Rider",
    subtitle: "Full-time • Buea",
    seniority: "Entry",
    pay: "40,000 XAF/m",
    posted: "1d",
    company: "SwiftRide",
    companyInitial: "S",
    companyColor: "bg-emerald-700",
  },
];

export function jobTitleFromSlug(slug: string) {
  const card = WORKER_JOB_CARDS.find((j) => j.slug === slug);
  if (card) return card.title;
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Saved jobs screen — order matches Figma-style grid */
export const WORKER_SAVED_JOB_ROWS: { slug: string; kind: "applied" | "posted"; time: string }[] = [
  { slug: "marketing-specialist-dla", kind: "applied", time: "2h" },
  { slug: "admin-assistant-yde", kind: "posted", time: "1w" },
  { slug: "graphic-designer-remote", kind: "posted", time: "3d" },
  { slug: "home-tutor-math-english", kind: "applied", time: "5d" },
  { slug: "software-engineer-dla", kind: "posted", time: "1w" },
  { slug: "logistics-coordinator", kind: "posted", time: "4d" },
];

export function workerJobBySlug(slug: string) {
  return WORKER_JOB_CARDS.find((j) => j.slug === slug);
}
