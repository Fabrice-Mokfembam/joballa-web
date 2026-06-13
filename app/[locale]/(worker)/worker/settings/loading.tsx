import { PortalRouteLoading } from "@/components/auth/portal-route-loading";
import { WorkerSettingsPageSkeleton } from "@/components/worker/worker-loading-skeletons";

export default function Loading() {
  return (
    <PortalRouteLoading>
      <WorkerSettingsPageSkeleton />
    </PortalRouteLoading>
  );
}
