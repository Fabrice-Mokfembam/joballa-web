import { WorkerEarningDetailPage } from "@/components/worker/worker-earning-detail-page";

export default async function WorkerEarningDetailRoute({
  params,
}: {
  params: Promise<{ transactionId: string }>;
}) {
  const { transactionId } = await params;
  return <WorkerEarningDetailPage transactionId={transactionId} />;
}
