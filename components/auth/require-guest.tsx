"use client";

import { useEffect, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { ensureSessionHydrated } from "@/lib/auth/establish-session";
import {
  isGuestOnlyPath,
  resolveAuthDestination,
} from "@/lib/auth/route-protection";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";

/**
 * Redirect signed-in users away from sign-in / forgot-password / reset-password.
 * Auth pages render immediately — no skeleton or loading gate.
 */
export function RequireGuest({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const guestOnly = isGuestOnlyPath(pathname);

  useEffect(() => {
    if (!guestOnly) return;

    let cancelled = false;

    void (async () => {
      const result = await ensureSessionHydrated();
      if (cancelled) return;

      if (result.ok) {
        const user = useAuthStore.getState().user;
        if (user) {
          router.replace(resolveAuthDestination(searchParams.get("callbackUrl"), user.role, null));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [guestOnly, pathname, router, searchParams]);

  return <>{children}</>;
}
