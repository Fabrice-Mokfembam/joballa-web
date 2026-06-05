import { Suspense } from "react";
import { WorkerJobDetailPage } from "@/components/worker/worker-job-detail-page";
import { WorkerJobDetailPageSkeleton } from "@/components/worker/worker-loading-skeletons";

export default async function WorkerJobDetailPageRoute({ params }: { params: Promise<{ jobSlug: string }> }) {
  const { jobSlug } = await params;

  return (
    <Suspense fallback={<WorkerJobDetailPageSkeleton />}>
      <WorkerJobDetailPage jobId={jobSlug} />
    </Suspense>
  );
}
