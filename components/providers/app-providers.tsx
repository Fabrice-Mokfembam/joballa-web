"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { AuthSessionListener } from "@/components/auth/auth-session-listener";
import { AuthTokenHydrator } from "@/components/auth/auth-token-hydrator";
import { GoogleAuthProvider } from "@/components/providers/google-oauth-provider";
import { JoballaThemeProvider } from "@/components/providers/joballa-theme-provider";
import { AppToaster } from "@/components/ui/app-toaster";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: (failureCount, error) => {
          const status = (error as { status?: number })?.status;
          if (status != null && status >= 400 && status < 500) return false;
          return failureCount < 2;
        },
      },
    },
  });
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <JoballaThemeProvider>
        <GoogleAuthProvider>
          <AuthTokenHydrator />
          <AuthSessionListener />
          {children}
          <AppToaster />
        </GoogleAuthProvider>
      </JoballaThemeProvider>
    </QueryClientProvider>
  );
}
