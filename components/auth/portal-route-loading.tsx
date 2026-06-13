"use client";

import type { ReactNode } from "react";
import { AuthSessionLoadingScreen } from "@/components/auth/auth-session-loading-screen";
import { useAuthStore } from "@/lib/stores/auth-store";

/**
 * Route-level loading UI: logo loader while the portal auth gate is open,
 * otherwise the page skeleton for in-app navigations.
 */
export function PortalRouteLoading({ children }: { children: ReactNode }) {
  const portalGateReady = useAuthStore((s) => s.portalGateReady);
  if (!portalGateReady) {
    return <AuthSessionLoadingScreen />;
  }
  return children;
}
