import type { ReactNode } from "react";
import { PortalRequireAuth } from "@/components/auth/portal-require-auth";
import { WorkerAppShell } from "@/components/worker/worker-app-shell";
import { WorkerMobileJobsSearchProvider } from "@/components/worker/worker-mobile-jobs-search-context";
import { WORKER_PORTAL_ROLES } from "@/lib/auth/protected-portal-roles";

export default function WorkerLayout({ children }: { children: ReactNode }) {
  return (
    <PortalRequireAuth allowedRoles={WORKER_PORTAL_ROLES}>
      <WorkerMobileJobsSearchProvider>
        <WorkerAppShell>{children}</WorkerAppShell>
      </WorkerMobileJobsSearchProvider>
    </PortalRequireAuth>
  );
}
