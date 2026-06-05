"use client";

import { buttonClassName } from "@/components/ui/button";
import { useRouter } from "@/lib/i18n/navigation";
import type { JoballaRole } from "@/lib/joballa/types";
import { cn } from "@/lib/utils";

const PENDING_ROLE_KEY = "joballa.pendingSignupRole";
const PENDING_SIGNUP_FLAG = "joballa.pendingSignup";

export function setPendingSignupIntent(role: JoballaRole) {
  try {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(PENDING_ROLE_KEY, role);
    window.sessionStorage.setItem(PENDING_SIGNUP_FLAG, "1");
  } catch {
    /* ignore quota / SSR */
  }
}

/** Role chosen on `/signup` without clearing pending state (for registration forms). */
export function peekPendingSignupRole(): JoballaRole | null {
  try {
    if (typeof window === "undefined") return null;
    const flagged = window.sessionStorage.getItem(PENDING_SIGNUP_FLAG);
    if (flagged !== "1") return null;
    const raw = window.sessionStorage.getItem(PENDING_ROLE_KEY);
    if (raw === "WORKER" || raw === "EMPLOYER") return raw;
    return null;
  } catch {
    return null;
  }
}

export function consumePendingSignupRole(): JoballaRole | null {
  try {
    if (typeof window === "undefined") return null;
    const flagged = window.sessionStorage.getItem(PENDING_SIGNUP_FLAG);
    if (flagged !== "1") return null;
    const raw = window.sessionStorage.getItem(PENDING_ROLE_KEY);
    window.sessionStorage.removeItem(PENDING_SIGNUP_FLAG);
    window.sessionStorage.removeItem(PENDING_ROLE_KEY);
    if (raw === "WORKER" || raw === "EMPLOYER") return raw;
    return null;
  } catch {
    return null;
  }
}

export function SignupRoleContinue({
  role,
  className,
  children,
  variant = "primary",
}: {
  role: JoballaRole;
  className?: string;
  children: React.ReactNode;
  variant?: "primary" | "outline";
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={cn(buttonClassName(variant), className)}
      onClick={() => {
        setPendingSignupIntent(role);
        router.push("/sign-up/phone");
      }}
    >
      {children}
    </button>
  );
}
