import { PortalRouteLoading } from "@/components/auth/portal-route-loading";
import { WorkerFindJobsPageSkeleton } from "@/components/worker/worker-loading-skeletons";

export default function Loading() {
  return (
    <PortalRouteLoading>
      <WorkerFindJobsPageSkeleton cards={3} />
    </PortalRouteLoading>
  );
}
