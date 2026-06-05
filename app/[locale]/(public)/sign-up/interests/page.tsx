import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { SignUpInterestsForm } from "@/components/auth/sign-up-interests-form";

export default function SignUpInterestsPage() {
  return (
    <AuthSplitLayout>
      <SignUpInterestsForm />
    </AuthSplitLayout>
  );
}
