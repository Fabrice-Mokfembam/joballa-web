import { redirect } from "@/lib/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Phone sign-in lives at `/sign-in`; keep this path as a redirect for old links. */
export default async function SignInPhoneRedirectPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const q = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(q)) {
    if (typeof value === "string") qs.set(key, value);
  }
  const suffix = qs.toString();
  redirect({ href: suffix ? `/sign-in?${suffix}` : "/sign-in", locale });
}
