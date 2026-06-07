import type { EmployerJobDepartment } from "@/features/employer/types/employer-portal";

/** Matches backend `prisma/departments-seed-data.mjs` — used for demo mode only. */
export const CANONICAL_JOB_DEPARTMENTS: EmployerJobDepartment[] = [
  { id: "11111111-1111-4111-8111-111111110001", name: "Education", slug: "education", category: "education" },
  { id: "11111111-1111-4111-8111-111111110002", name: "Domestic", slug: "domestic", category: "domestic" },
  { id: "11111111-1111-4111-8111-111111110003", name: "Logistics", slug: "logistics", category: "logistics" },
  { id: "11111111-1111-4111-8111-111111110004", name: "Events", slug: "events", category: "events" },
  { id: "11111111-1111-4111-8111-111111110005", name: "Agriculture", slug: "agriculture", category: "agriculture" },
  { id: "11111111-1111-4111-8111-111111110006", name: "Construction", slug: "construction", category: "construction" },
  {
    id: "ae761000-7002-4136-bf74-e5aabe5ae799",
    name: "Software & Tech",
    slug: "software-tech",
    category: "software_tech",
  },
  { id: "11111111-1111-4111-8111-111111110099", name: "Other", slug: "other", category: "other" },
];
