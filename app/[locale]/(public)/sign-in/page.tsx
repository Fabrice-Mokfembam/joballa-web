import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { SignInForm } from "@/components/auth/sign-in-form";

type SearchParams = { reset?: string };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const q = await searchParams;

  return (
    <AuthSplitLayout>
      <SignInForm variant="phone" showAfterResetHint={q.reset === "1"} />
    </AuthSplitLayout>
  );
}
