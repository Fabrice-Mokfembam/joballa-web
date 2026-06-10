import { WorkerIncomingApplicantDetailPanel } from "@/components/worker/worker-incoming-applicant-detail-panel";

export default async function WorkerIncomingApplicationDetailRoute({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;
  return <WorkerIncomingApplicantDetailPanel applicationId={applicationId} variant="page" />;
}
