import type { ReactNode } from "react";
import { Suspense } from "react";
import { RequireGuest } from "@/components/auth/require-guest";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <RequireGuest>{children}</RequireGuest>
    </Suspense>
  );
}
