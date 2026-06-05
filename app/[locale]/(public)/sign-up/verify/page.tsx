import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { SignUpVerifyRedirect } from "@/components/auth/sign-up-verify-redirect";

export default function SignUpVerifyPage() {
  return (
    <AuthSplitLayout>
      <SignUpVerifyRedirect />
    </AuthSplitLayout>
  );
}