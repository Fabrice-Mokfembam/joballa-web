import { EmployerPaymentDetailPage } from "@/components/employer/employer-payment-detail-page";

export default async function EmployerPaymentDetailRoute({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = await params;
  return <EmployerPaymentDetailPage paymentId={paymentId} />;
}
