/**
 * Documented JSON shapes stored in Prisma `Json` columns (see schema comments).
 */

export type WorkHistoryEntry = {
  employer: string;
  role: string;
  startDate: string;
  endDate?: string | null;
  description?: string | null;
};

export type EducationEntry = {
  institution: string;
  qualification: string;
  startYear?: number | null;
  endYear?: number | null;
};
