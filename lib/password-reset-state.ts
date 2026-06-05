const RESET_KEY = "joballa.passwordReset.pending";

export type PendingPasswordResetState = {
  identifier: string;
  otp: string;
};

export function readPendingPasswordReset(): PendingPasswordResetState | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.sessionStorage.getItem(RESET_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingPasswordResetState>;
    if (typeof parsed.identifier !== "string" || typeof parsed.otp !== "string") return null;
    if (!/^[0-9]{6}$/.test(parsed.otp)) return null;
    return { identifier: parsed.identifier, otp: parsed.otp };
  } catch {
    return null;
  }
}

export function writePendingPasswordReset(state: PendingPasswordResetState) {
  try {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(RESET_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function clearPendingPasswordReset() {
  try {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem(RESET_KEY);
  } catch {
    /* ignore */
  }
}
