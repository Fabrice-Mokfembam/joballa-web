"use client";

import { useEffect } from "react";
import { hydrateAuthStoreFromPersistence } from "@/lib/stores/auth-store";
import { initAuthCrossTabSync } from "@/lib/auth/token-refresh";

/** Restores tokens from `localStorage` and keeps tabs in sync before protected routes hydrate. */
export function AuthTokenHydrator() {
  useEffect(() => {
    hydrateAuthStoreFromPersistence();
    initAuthCrossTabSync();
  }, []);
  return null;
}
