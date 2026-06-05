import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { SignUpOtpForm } from "@/components/auth/sign-up-otp-form";

export default function SignUpVerifyPhonePage() {
  return (
    <AuthSplitLayout>
      <SignUpOtpForm expectedChannel="phone" />
    </AuthSplitLayout>
  );
}
