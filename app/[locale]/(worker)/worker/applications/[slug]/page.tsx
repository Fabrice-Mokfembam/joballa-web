import { WorkerApplicationDetailPage } from "@/components/worker/worker-application-detail-page";

export default async function WorkerApplicationDetailRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <WorkerApplicationDetailPage applicationId={slug} />;
}
