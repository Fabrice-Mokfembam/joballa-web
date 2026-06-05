import { EmployerJobDetailPanel } from "@/components/employer/employer-job-detail-panel";

export default async function EmployerJobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  return (
    <div className="mx-auto w-full max-w-2xl">
      <EmployerJobDetailPanel jobId={jobId} />
    </div>
  );
}
