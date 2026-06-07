import { EmployerJobDetailPanel } from "@/components/employer/employer-job-detail-panel";

export default async function EmployerJobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-col">
      <EmployerJobDetailPanel jobId={jobId} variant="page" />
    </div>
  );
}
