import { redirect } from "@/lib/i18n/navigation";

export default async function WorkerJobApplyRedirectPage({
  params,
}: {
  params: Promise<{ locale: string; jobSlug: string }>;
}) {
  const { locale, jobSlug } = await params;
  redirect({ href: `/worker/jobs/${jobSlug}?apply=1`, locale });
}
