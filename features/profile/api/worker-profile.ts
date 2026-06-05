/**
 * Legacy worker profile facade — delegates to `/worker/profile` (v2 portal).
 */
import {
  getWorkerFullProfile,
  patchWorkerPersonalInfo,
  patchWorkerProfessionalSummary,
  patchWorkerSkills,
} from "@/features/worker/api";
import { mapPortalProfileToLegacy } from "@/features/profile/lib/map-worker-portal-profile";
import type { WorkerProfile } from "@/lib/types";

export async function getWorkerProfile(_token?: string | null): Promise<WorkerProfile> {
  const full = await getWorkerFullProfile();
  return mapPortalProfileToLegacy(full);
}

export async function patchWorkerProfile(
  _token: string | null | undefined,
  body: Record<string, unknown>,
): Promise<WorkerProfile> {
  if ("skills" in body && Array.isArray(body.skills)) {
    await patchWorkerSkills({ skills: body.skills as string[] });
  } else if ("bio" in body || "preferredJobCategories" in body) {
    await patchWorkerProfessionalSummary({
      summary: typeof body.bio === "string" ? body.bio : undefined,
      industries: Array.isArray(body.preferredJobCategories)
        ? (body.preferredJobCategories as string[])
        : undefined,
    });
  } else {
    await patchWorkerPersonalInfo({
      firstName: typeof body.firstName === "string" ? body.firstName : undefined,
      lastName: typeof body.lastName === "string" ? body.lastName : undefined,
      city: typeof body.city === "string" ? body.city : undefined,
      region: typeof body.region === "string" ? body.region : undefined,
      languages: Array.isArray(body.languagesSpoken)
        ? (body.languagesSpoken as string[])
        : undefined,
      availabilityStatus:
        typeof body.availabilityStatus === "string"
          ? (body.availabilityStatus as "AVAILABLE" | "OPEN_TO_OFFERS" | "NOT_AVAILABLE")
          : undefined,
    });
  }
  return getWorkerProfile();
}
