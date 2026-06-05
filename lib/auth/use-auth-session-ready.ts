"use client";

import { useAuthStore } from "@/lib/stores/auth-store";

/** True when access token and user profile are both loaded (safe to call protected APIs). */
export function useAuthSessionReady(): boolean {
  return useAuthStore((s) => !!s.accessToken && !!s.user);
}
