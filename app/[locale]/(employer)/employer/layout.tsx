import type { ReactNode } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { EmployerAppShell } from "@/components/employer/employer-app-shell";
import { EMPLOYER_PORTAL_ROLES } from "@/lib/auth/protected-portal-roles";

export default function EmployerLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth allowedRoles={EMPLOYER_PORTAL_ROLES}>
      <EmployerAppShell>{children}</EmployerAppShell>
    </RequireAuth>
  );
}
