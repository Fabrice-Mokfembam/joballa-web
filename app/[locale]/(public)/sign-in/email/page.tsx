import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInEmailPage() {
  return (
    <AuthSplitLayout>
      <SignInForm variant="email" />
    </AuthSplitLayout>
  );
}
