import { WorkerPostJobFlow } from "@/components/worker/worker-post-job-flow";

export default async function WorkerPostJobPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  return <WorkerPostJobFlow jobId={edit} />;
}
