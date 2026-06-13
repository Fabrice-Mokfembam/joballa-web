import { PortalRouteLoading } from "@/components/auth/portal-route-loading";
import { WorkerApplicationsPageSkeleton } from "@/components/worker/worker-loading-skeletons";

export default function Loading() {
  return (
    <PortalRouteLoading>
      <WorkerApplicationsPageSkeleton />
    </PortalRouteLoading>
  );
}
