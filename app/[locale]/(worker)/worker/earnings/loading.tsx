import { PortalRouteLoading } from "@/components/auth/portal-route-loading";
import { WorkerEarningsPageSkeleton } from "@/components/worker/worker-loading-skeletons";

export default function Loading() {
  return (
    <PortalRouteLoading>
      <WorkerEarningsPageSkeleton />
    </PortalRouteLoading>
  );
}
