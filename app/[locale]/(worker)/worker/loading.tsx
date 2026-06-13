import { AuthSessionLoadingScreen } from "@/components/auth/auth-session-loading-screen";

/** Logo loader only — avoids skeleton flash before auth session check. */
export default function Loading() {
  return <AuthSessionLoadingScreen />;
}
