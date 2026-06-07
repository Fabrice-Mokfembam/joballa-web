"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import type { Role } from "@/lib/types/enums";

/**
 * Client-only auth gate for portal layouts.
 * Loaded dynamically so Turbopack does not attach `require-auth` to unrelated
 * public routes (e.g. sign-in) during SSR chunk resolution.
 */
const RequireAuthLazy = dynamic(
  () => import("@/components/auth/require-auth").then((mod) => mod.RequireAuth),
  {
    ssr: false,
    loading: () => (
      <div
        className="joballa-auth-root flex min-h-dvh w-full items-center justify-center bg-[color:var(--auth-shell-bg)]"
        role="status"
        aria-busy="true"
      >
        <div
          className="size-10 animate-spin rounded-full border-[3px] border-[color:var(--joballa-primary)] border-t-transparent"
          aria-hidden
        />
      </div>
    ),
  },
);

export function PortalRequireAuth({
  allowedRoles,
  children,
}: {
  allowedRoles?: readonly Role[];
  children: ReactNode;
}) {
  return <RequireAuthLazy allowedRoles={allowedRoles}>{children}</RequireAuthLazy>;
}
