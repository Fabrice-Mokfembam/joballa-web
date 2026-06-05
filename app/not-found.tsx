import { NotFoundPage } from "@/components/portal/not-found-page";

export default function NotFound() {
  return (
    <NotFoundPage
      title="Page not found"
      description="The page you are looking for does not exist, was moved, or you may not have permission to view it."
      ctaDashboard="Go to dashboard"
      ctaSignIn="Sign in"
      dashboardHref="/en"
      signInHref="/en/sign-in"
    />
  );
}
