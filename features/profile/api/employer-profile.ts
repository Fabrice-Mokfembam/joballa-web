/**
 * Legacy employer profile facade: delegates to `/employer/company`.
 */
import { getEmployerCompany, patchEmployerCompany } from "@/features/employer/api";
import type { UpdateEmployerCompanyBody } from "@/features/employer/types/employer-portal";
import type { EmployerProfile } from "@/lib/types";

function mapCompanyToLegacyProfile(
  company: Awaited<ReturnType<typeof getEmployerCompany>>,
): EmployerProfile {
  const location =
    typeof company.location === "string"
      ? company.location
      : [company.location?.city, company.location?.country].filter(Boolean).join(", ") || null;

  return {
    id: String(company.companyId ?? company.id ?? ""),
    userId: String(company.userId ?? ""),
    companyName: String(company.name ?? ""),
    industry: company.industry ? String(company.industry) : null,
    location,
    logoUrl: company.logoUrl ?? company.logo ?? null,
    website: company.website ? String(company.website) : null,
    about: company.bio ? String(company.bio) : null,
    isJoballaDepartment: Boolean(company.isJoballaDepartment),
    departmentCategory: null,
    businessRegDocUrl: null,
    verificationStatus: String(company.verificationStatus ?? "PENDING") as EmployerProfile["verificationStatus"],
    verificationNotes: null,
    paymentProvider: null,
    paymentAccount: null,
    createdAt: String(company.createdAt ?? ""),
    updatedAt: String(company.updatedAt ?? ""),
  };
}

export async function getEmployerProfile(_token?: string | null): Promise<EmployerProfile> {
  const company = await getEmployerCompany();
  return mapCompanyToLegacyProfile(company);
}

export async function patchEmployerProfile(
  _token: string | null | undefined,
  body: Record<string, unknown>,
): Promise<EmployerProfile> {
  const payload: UpdateEmployerCompanyBody = {
    name: typeof body.companyName === "string" ? body.companyName : undefined,
    industry: typeof body.industry === "string" ? body.industry : undefined,
    website: typeof body.website === "string" ? body.website : undefined,
    bio: typeof body.about === "string" ? body.about : undefined,
    logo: typeof body.logoUrl === "string" ? body.logoUrl : undefined,
  };

  if (typeof body.location === "string") {
    payload.location = { city: body.location };
  }

  const company = await patchEmployerCompany(payload);
  return mapCompanyToLegacyProfile(company);
}
