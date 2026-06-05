import type {
  EmployerCompany,
  EmployerDocument,
  UpdateEmployerCompanyBody,
} from "@/features/employer/types/employer-portal";

type ApiRecord = Record<string, unknown>;

function asRecord(value: unknown): ApiRecord | null {
  return value && typeof value === "object" ? (value as ApiRecord) : null;
}

function buildLocation(data: ApiRecord): EmployerCompany["location"] {
  const nested = data.location;
  if (nested && typeof nested === "object") {
    const loc = nested as { city?: string; region?: string; country?: string };
    return {
      city: loc.city ?? undefined,
      region: loc.region ?? undefined,
      country: loc.country ?? undefined,
    };
  }
  if (typeof nested === "string" && nested.trim()) {
    return nested;
  }
  const city = data.city != null ? String(data.city) : undefined;
  const region = data.region != null ? String(data.region) : undefined;
  const country = data.country != null ? String(data.country) : undefined;
  if (!city && !region && !country) return undefined;
  return { city, region, country };
}

function isUiCompany(data: ApiRecord): boolean {
  return data.companyName == null && typeof data.name === "string";
}

function mapDocument(value: unknown): EmployerDocument | null {
  const raw = asRecord(value);
  if (!raw) return null;
  const id = String(raw.id ?? raw.documentId ?? "");
  const documentUrl = String(raw.documentUrl ?? raw.url ?? raw.fileUrl ?? "");
  if (!id && !documentUrl) return null;
  return {
    id: id || documentUrl,
    documentName: String(raw.documentName ?? raw.name ?? raw.fileName ?? "Document"),
    documentUrl,
    documentType: String(raw.documentType ?? raw.type ?? "pdf"),
    verificationStatus: String(raw.verificationStatus ?? raw.status ?? "pending"),
    verificationNotes: raw.verificationNotes != null ? String(raw.verificationNotes) : null,
    createdAt: raw.createdAt != null ? String(raw.createdAt) : new Date().toISOString(),
  };
}

/** Map v2 `GET /employer/company` → UI `EmployerCompany`. */
export function normalizeEmployerCompany(raw: unknown): EmployerCompany {
  const data = asRecord(raw) ?? {};
  if (isUiCompany(data)) {
    const location = buildLocation(data);
    return {
      ...data,
      id: String(data.id ?? data.companyId ?? ""),
      companyId: String(data.companyId ?? data.id ?? ""),
      name: String(data.name ?? ""),
      logoUrl: (data.logoUrl ?? data.logo ?? null) as string | null,
      logo: (data.logo ?? data.logoUrl ?? null) as string | null,
      location,
    } as EmployerCompany;
  }

  const location = buildLocation(data);
  const logo = (data.companyLogoUrl ?? data.logoUrl ?? data.logo ?? null) as string | null;
  const documents = Array.isArray(data.documents)
    ? data.documents.map(mapDocument).filter((d): d is EmployerDocument => d != null)
    : [];

  return {
    ...data,
    id: String(data.id ?? ""),
    companyId: String(data.id ?? data.companyId ?? ""),
    userId: data.userId != null ? String(data.userId) : undefined,
    name: data.companyName != null ? String(data.companyName) : data.name != null ? String(data.name) : "",
    tagline: data.tagline != null ? String(data.tagline) : null,
    industry: data.industry != null ? String(data.industry) : undefined,
    size: data.companySize != null ? String(data.companySize) : data.size != null ? String(data.size) : undefined,
    bio:
      data.description != null
        ? String(data.description)
        : data.about != null
          ? String(data.about)
          : data.bio != null
            ? String(data.bio)
            : undefined,
    location,
    website: data.website != null ? String(data.website) : undefined,
    email: data.contactEmail != null ? String(data.contactEmail) : data.email != null ? String(data.email) : undefined,
    logoUrl: logo,
    logo,
    verificationStatus:
      data.verificationStatus != null ? String(data.verificationStatus) : undefined,
    documents,
    applicantsCount:
      typeof data.applicantsCount === "number" ? data.applicantsCount : undefined,
    employeesCount:
      typeof data.employeesCount === "number" ? data.employeesCount : undefined,
  };
}

/** Map UI patch body → v2 `PATCH /employer/company` (`FRONTEND_EMPLOYER_ROUTES.md`). */
export function encodeUpdateEmployerCompany(body: UpdateEmployerCompanyBody): ApiRecord {
  const payload: ApiRecord = {};

  if (body.name !== undefined) payload.companyName = body.name.trim();
  if (body.tagline !== undefined) payload.tagline = body.tagline.trim();
  if (body.industry !== undefined) payload.industry = body.industry.trim();
  if (body.size !== undefined) payload.companySize = body.size.trim();
  if (body.bio !== undefined) payload.description = body.bio.trim();
  if (body.website !== undefined) payload.website = body.website.trim();
  if (body.logo !== undefined) payload.companyLogoUrl = body.logo;

  if (body.location && typeof body.location === "object") {
    if (body.location.city) payload.city = body.location.city.trim();
    if (body.location.region) payload.region = body.location.region.trim();
    if (body.location.country) payload.country = body.location.country.trim();
  }

  return payload;
}
