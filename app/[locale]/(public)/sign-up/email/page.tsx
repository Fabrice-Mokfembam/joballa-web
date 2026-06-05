import { AuthSplitLayout } from "@/components/auth/auth-split-layout";import { SignUpEmailForm } from "@/components/auth/sign-up-email-form";

export default function SignUpEmailPage() {
  return (
    <AuthSplitLayout>
      <SignUpEmailForm />
    </AuthSplitLayout>
  );
}
