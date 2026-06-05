import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default async function ResetPasswordPage() {
  return (
    <AuthSplitLayout>
      <ResetPasswordForm />
    </AuthSplitLayout>
  );
}
