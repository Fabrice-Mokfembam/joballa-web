"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { AuthSessionLoadingScreen } from "@/components/auth/auth-session-loading-screen";
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
    loading: () => <AuthSessionLoadingScreen />,
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
