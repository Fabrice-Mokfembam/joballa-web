import { AuthSplitLayout } from "@/components/auth/auth-split-layout";import { SignUpRolePicker } from "@/components/auth/sign-up-role-picker";

export default function SignUpRolePage() {
  return (
    <AuthSplitLayout>
      <SignUpRolePicker />
    </AuthSplitLayout>
  );
}
