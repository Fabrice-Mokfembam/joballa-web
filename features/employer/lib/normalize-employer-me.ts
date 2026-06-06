import type { EmployerMe } from "@/features/employer/types/employer-portal";

type ApiRecord = Record<string, unknown>;

function asRecord(value: unknown): ApiRecord | null {
  return value && typeof value === "object" ? (value as ApiRecord) : null;
}

function splitName(fullName: string | null | undefined): { firstName?: string; lastName?: string } {
  if (!fullName?.trim()) return {};
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

/** Map v2 `GET /employer/me` → UI `EmployerMe`. */
export function normalizeEmployerMe(raw: unknown): EmployerMe {
  const data = asRecord(raw) ?? {};
  const existingCompany = asRecord(data.company);

  if (existingCompany?.name) {
    return {
      id: String(data.id ?? ""),
      firstName: data.firstName != null ? String(data.firstName) : null,
      lastName: data.lastName != null ? String(data.lastName) : null,
      email: data.email != null ? String(data.email) : null,
      phone: data.phone != null ? String(data.phone) : null,
      avatar: data.avatar != null ? String(data.avatar) : null,
      languagePreference:
        data.languagePreference != null
          ? String(data.languagePreference)
          : data.preferredLanguage != null
            ? String(data.preferredLanguage)
            : undefined,
      company: {
        id: String(existingCompany.id ?? ""),
        name: String(existingCompany.name),
        logo: existingCompany.logo != null ? String(existingCompany.logo) : null,
      },
      roles:
        data.roles != null ? String(data.roles) : data.role != null ? String(data.role) : undefined,
    };
  }

  const profile = asRecord(data.employerProfile);
  const companyName = profile?.companyName != null ? String(profile.companyName) : null;
  const companyLogo = profile?.companyLogoUrl != null ? String(profile.companyLogoUrl) : null;
  const contactName = profile?.contactPersonName != null ? String(profile.contactPersonName) : null;
  const { firstName, lastName } = splitName(contactName);

  return {
    id: String(data.id ?? ""),
    firstName: data.firstName != null ? String(data.firstName) : (firstName ?? null),
    lastName: data.lastName != null ? String(data.lastName) : (lastName ?? null),
    email: data.email != null ? String(data.email) : null,
    phone: data.phone != null ? String(data.phone) : null,
    avatar: data.avatar != null ? String(data.avatar) : companyLogo,
    languagePreference:
      data.languagePreference != null
        ? String(data.languagePreference)
        : data.preferredLanguage != null
          ? String(data.preferredLanguage)
          : undefined,
    company: companyName
      ? {
          id: String(profile?.id ?? data.id ?? ""),
          name: companyName,
          logo: companyLogo,
        }
      : undefined,
    roles: data.roles != null ? String(data.roles) : data.role != null ? String(data.role) : undefined,
  };
}
