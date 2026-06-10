/** Shared max lengths for worker and employer portal text inputs. */
export const FIELD_LIMITS = {
  fullName: 120,
  professionalTitle: 120,
  bio: 2000,
  languages: 200,
  skillsList: 1000,
  institution: 160,
  degree: 120,
  fieldOfStudy: 120,
  certificationName: 120,
  issuer: 120,
  jobTitle: 120,
  companyName: 160,
  industry: 100,
  description: 5000,
  phone: 20,
  email: 254,
  url: 500,
  location: 200,
  neighbourhood: 120,
  city: 80,
  region: 80,
  schedule: 200,
  duration: 100,
  payAmount: 16,
  openings: 4,
  listLine: 500,
  search: 200,
  notes: 2000,
  categoryCustom: 80,
  requiredSkills: 1000,
  documentNotes: 500,
  tagline: 160,
  departmentId: 36,
} as const;

export type FieldLimitKey = keyof typeof FIELD_LIMITS;

export function fieldMaxLength(key: FieldLimitKey): number {
  return FIELD_LIMITS[key];
}
