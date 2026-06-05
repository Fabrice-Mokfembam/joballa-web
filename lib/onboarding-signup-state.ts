import type { JoballaRole } from "@/lib/joballa/types";

const PENDING_KEY = "joballa.signup.pending";

export type SignupChannel = "email" | "phone";

export type PendingSignUpState = {
  channel: SignupChannel;
  name: string;
  email?: string;
  phone?: string;
  password: string;
  /** Canonical identifier returned by `POST /auth/register` */
  identifier: string | null;
};

export function readPendingSignUp(): PendingSignUpState | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingSignUpState>;
    if (parsed.channel !== "email" && parsed.channel !== "phone") return null;
    if (typeof parsed.password !== "string" || typeof parsed.name !== "string") return null;
    return {
      channel: parsed.channel,
      name: parsed.name,
      email: typeof parsed.email === "string" ? parsed.email : undefined,
      phone: typeof parsed.phone === "string" ? parsed.phone : undefined,
      password: parsed.password,
      identifier: typeof parsed.identifier === "string" ? parsed.identifier : null,
    };
  } catch {
    return null;
  }
}

export function writePendingSignUp(state: PendingSignUpState) {
  try {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(PENDING_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function clearPendingSignUp() {
  try {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}

const ONBOARDING_ROLE_KEY = "joballa.onboarding.selectedRole";

export function writeOnboardingRole(role: JoballaRole) {
  try {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(ONBOARDING_ROLE_KEY, role);
  } catch {
    /* ignore */
  }
}

export function readOnboardingRole(): JoballaRole | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.sessionStorage.getItem(ONBOARDING_ROLE_KEY);
    if (raw === "WORKER" || raw === "EMPLOYER") return raw;
    return null;
  } catch {
    return null;
  }
}

export function clearOnboardingRole() {
  try {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem(ONBOARDING_ROLE_KEY);
  } catch {
    /* ignore */
  }
}

const CV_KEY = "joballa.onboarding.cvMeta";

export type OnboardingCvMeta = { fileName: string; stagedAt: string };

export function writeOnboardingCv(meta: OnboardingCvMeta) {
  try {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(CV_KEY, JSON.stringify(meta));
  } catch {
    /* ignore */
  }
}

export function readOnboardingCv(): OnboardingCvMeta | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.sessionStorage.getItem(CV_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OnboardingCvMeta;
    if (typeof parsed.fileName !== "string" || typeof parsed.stagedAt !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

const INTERESTS_KEY = "joballa.onboarding.interests";
const POSTING_CATEGORIES_KEY = "joballa.onboarding.postingCategories";

export function writeOnboardingInterests(slugs: string[]) {
  try {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(INTERESTS_KEY, JSON.stringify(slugs));
  } catch {
    /* ignore */
  }
}

export function readOnboardingInterests(): string[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.sessionStorage.getItem(INTERESTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function writeOnboardingPostingCategories(slugs: string[]) {
  try {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(POSTING_CATEGORIES_KEY, JSON.stringify(slugs));
  } catch {
    /* ignore */
  }
}

export function clearOnboardingExtras() {
  try {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem(CV_KEY);
    window.sessionStorage.removeItem(INTERESTS_KEY);
    window.sessionStorage.removeItem(POSTING_CATEGORIES_KEY);
  } catch {
    /* ignore */
  }
}

const DISPLAY_NAME_KEY = "joballa.onboarding.signupName";

export function writeSignupDisplayName(name: string) {
  try {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(DISPLAY_NAME_KEY, name.trim());
  } catch {
    /* ignore */
  }
}

export function readSignupDisplayName(): string | null {
  try {
    if (typeof window === "undefined") return null;
    const v = window.sessionStorage.getItem(DISPLAY_NAME_KEY);
    return v && v.length > 0 ? v : null;
  } catch {
    return null;
  }
}

export function clearSignupDisplayName() {
  try {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem(DISPLAY_NAME_KEY);
  } catch {
    /* ignore */
  }
}
