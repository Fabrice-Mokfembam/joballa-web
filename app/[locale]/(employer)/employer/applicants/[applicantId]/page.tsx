import { EmployerApplicantDetailPanel } from "@/components/employer/employer-applicant-detail-panel";

export default async function EmployerApplicantDetailPage({
  params,
}: {
  params: Promise<{ applicantId: string }>;
}) {
  const { applicantId } = await params;
  return (
    <div className="mx-auto w-full max-w-[76rem] px-0">
      <EmployerApplicantDetailPanel applicationId={applicantId} variant="page" />
    </div>
  );
}
