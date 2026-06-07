import type { ReactNode } from "react";
import { PortalRequireAuth } from "@/components/auth/portal-require-auth";
import { EmployerAppShell } from "@/components/employer/employer-app-shell";
import { EMPLOYER_PORTAL_ROLES } from "@/lib/auth/protected-portal-roles";

export default function EmployerLayout({ children }: { children: ReactNode }) {
  return (
    <PortalRequireAuth allowedRoles={EMPLOYER_PORTAL_ROLES}>
      <EmployerAppShell>{children}</EmployerAppShell>
    </PortalRequireAuth>
  );
}
