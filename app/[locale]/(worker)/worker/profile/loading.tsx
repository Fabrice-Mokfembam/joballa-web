import { PortalRouteLoading } from "@/components/auth/portal-route-loading";
import { WorkerProfilePageSkeleton } from "@/components/worker/worker-loading-skeletons";

export default function Loading() {
  return (
    <PortalRouteLoading>
      <WorkerProfilePageSkeleton />
    </PortalRouteLoading>
  );
}
