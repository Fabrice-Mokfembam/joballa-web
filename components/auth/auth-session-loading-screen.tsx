"use client";

import { JoballaSessionLoader } from "@/components/auth/joballa-session-loader";
import { cn } from "@/lib/utils";

type AuthSessionLoadingScreenProps = {
  className?: string;
};

/** Full-screen gate while protected routes hydrate or refresh the session. */
export function AuthSessionLoadingScreen({ className }: AuthSessionLoadingScreenProps) {
  return (
    <div
      className={cn(
        "flex min-h-dvh w-full flex-col items-center justify-center bg-[var(--joballa-page)] px-6",
        className,
      )}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <JoballaSessionLoader />
    </div>
  );
}
