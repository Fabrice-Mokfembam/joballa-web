import { PortalRouteLoading } from "@/components/auth/portal-route-loading";
import { WorkerApplicationDetailPageSkeleton } from "@/components/worker/worker-loading-skeletons";

export default function Loading() {
  return (
    <PortalRouteLoading>
      <WorkerApplicationDetailPageSkeleton />
    </PortalRouteLoading>
  );
}
