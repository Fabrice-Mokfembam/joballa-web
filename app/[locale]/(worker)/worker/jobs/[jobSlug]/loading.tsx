import { PortalRouteLoading } from "@/components/auth/portal-route-loading";
import { WorkerJobDetailPageSkeleton } from "@/components/worker/worker-loading-skeletons";

export default function Loading() {
  return (
    <PortalRouteLoading>
      <WorkerJobDetailPageSkeleton />
    </PortalRouteLoading>
  );
}
