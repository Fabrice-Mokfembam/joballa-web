import { EmployerWorkforceWorkerProfile } from "@/components/employer/employer-workforce-worker-profile";

export default async function EmployerWorkforceWorkerPage({
  params,
}: {
  params: Promise<{ workerId: string }>;
}) {
  const { workerId } = await params;
  return <EmployerWorkforceWorkerProfile workerId={workerId} />;
}
