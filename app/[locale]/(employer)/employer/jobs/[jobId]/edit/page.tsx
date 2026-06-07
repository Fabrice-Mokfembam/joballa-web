import { EmployerPostJobFlow } from "@/components/employer/employer-post-job-flow";

export default async function EmployerEditJobPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  return <EmployerPostJobFlow jobId={jobId} />;
}
