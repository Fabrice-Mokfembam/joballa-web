"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import type { ReactNode } from "react";
import { getGoogleClientId } from "@/lib/auth/google-client-id";

export function GoogleAuthProvider({ children }: { children: ReactNode }) {
  const clientId = getGoogleClientId();
  if (!clientId) return <>{children}</>;

  return <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>;
}
