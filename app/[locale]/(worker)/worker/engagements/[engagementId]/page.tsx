import { WorkerEngagementDetailPage } from "@/components/worker/worker-engagement-detail-page";

export default async function WorkerEngagementDetailRoute({
  params,
}: {
  params: Promise<{ engagementId: string }>;
}) {
  const { engagementId } = await params;
  return <WorkerEngagementDetailPage engagementId={engagementId} />;
}
