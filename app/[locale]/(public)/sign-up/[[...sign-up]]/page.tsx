import { redirect } from "@/lib/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function SignUpCatchAllPage({ params }: Props) {
  const { locale } = await params;
  redirect({ href: "/sign-up/role", locale });
}
