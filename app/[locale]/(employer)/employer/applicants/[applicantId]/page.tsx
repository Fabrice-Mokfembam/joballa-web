import { EmployerApplicantDetailPanel } from "@/components/employer/employer-applicant-detail-panel";

export default async function EmployerApplicantDetailPage({
  params,
}: {
  params: Promise<{ applicantId: string }>;
}) {
  const { applicantId } = await params;
  return (
    <div className="p-[26px]">
      <EmployerApplicantDetailPanel applicationId={applicantId} variant="page" />
    </div>
  );
}
