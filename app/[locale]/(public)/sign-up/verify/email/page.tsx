import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { SignUpOtpForm } from "@/components/auth/sign-up-otp-form";

export default function SignUpVerifyEmailPage() {
  return (
    <AuthSplitLayout>
      <SignUpOtpForm expectedChannel="email" />
    </AuthSplitLayout>
  );
}
