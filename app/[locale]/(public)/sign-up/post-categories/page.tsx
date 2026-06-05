import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { SignUpPostCategoriesForm } from "@/components/auth/sign-up-post-categories-form";

export default function SignUpPostCategoriesPage() {
  return (
    <AuthSplitLayout>
      <SignUpPostCategoriesForm />
    </AuthSplitLayout>
  );
}
