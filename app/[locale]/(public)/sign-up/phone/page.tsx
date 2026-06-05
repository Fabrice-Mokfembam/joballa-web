import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { SignUpPhoneForm } from "@/components/auth/sign-up-phone-form";

export default function SignUpPhonePage() {
  return (
    <AuthSplitLayout>
      <SignUpPhoneForm />
    </AuthSplitLayout>
  );
}