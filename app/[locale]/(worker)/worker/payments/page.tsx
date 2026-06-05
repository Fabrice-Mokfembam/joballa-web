import { redirect } from "@/lib/i18n/navigation";

export default async function WorkerPaymentsRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/worker/earnings", locale });
}
