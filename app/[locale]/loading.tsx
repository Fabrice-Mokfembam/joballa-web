import { AuthSessionLoadingScreen } from "@/components/auth/auth-session-loading-screen";

/** Locale segment gate — logo loader (no skeleton flash before portal auth). */
export default function Loading() {
  return <AuthSessionLoadingScreen />;
}
