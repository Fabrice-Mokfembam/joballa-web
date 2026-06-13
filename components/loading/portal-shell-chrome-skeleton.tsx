"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { JoballaPanelLogoMark } from "@/components/brand/joballa-panel-logo-mark";
import { Skeleton } from "@/components/ui/skeleton";

const NAV_SLOT_COUNT = 5;

/** Header + mobile bottom tab bar — mirrors worker/employer {@link WorkerAppShell}. */
export function PortalShellChromeSkeleton({ children }: { children: ReactNode }) {
  const t = useTranslations("common.aria");
  return (
    <div
      className="flex min-h-[100dvh] flex-col bg-[var(--joballa-page)] text-[var(--joballa-fg)]"
      aria-busy
      aria-label={t("loading")}
    >
      <header className="sticky top-0 z-50 border-b border-[var(--joballa-border)] bg-[var(--joballa-header)] shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="mx-auto flex h-14 min-h-14 w-full max-w-[1440px] items-center gap-2 px-4 sm:h-16 sm:min-h-16 sm:gap-3 sm:px-6 md:px-8 lg:px-10">
          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <JoballaPanelLogoMark size={40} alt="" className="size-9 shrink-0 sm:size-10" />
            <Skeleton className="hidden h-5 w-[4.5rem] max-[599px]:hidden sm:block sm:h-6 sm:w-16" />
          </div>

          <div className="hidden min-w-0 flex-1 min-[600px]:flex">
            <div className="mx-auto hidden min-w-0 flex-1 items-end justify-center gap-0 md:flex">
              {Array.from({ length: NAV_SLOT_COUNT }).map((_, i) => (
                <div key={i} className="flex shrink-0 flex-col items-center px-2.5 pb-2 pt-1 md:px-3 lg:px-5">
                  <Skeleton className="h-4 w-14 sm:w-16" />
                  <Skeleton className="mt-2.5 h-1 w-8 rounded-full" />
                </div>
              ))}
            </div>
            <div className="flex min-w-0 flex-1 justify-start gap-0 overflow-hidden md:hidden">
              {Array.from({ length: NAV_SLOT_COUNT }).map((_, i) => (
                <div key={i} className="flex shrink-0 flex-col items-center px-2 pb-1 pt-1.5">
                  <Skeleton className="h-3 w-10 sm:w-12" />
                  <Skeleton className="mt-1 h-0.5 w-7 rounded-full sm:w-8" />
                </div>
              ))}
            </div>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
            <Skeleton className="size-9 rounded-lg" />
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Skeleton className="size-8 rounded-full sm:size-9" />
              <Skeleton className="hidden h-4 w-20 lg:block" />
              <Skeleton className="size-3 rounded-sm" />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full min-w-0 max-w-[1440px] flex-1 flex-col px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] pt-3 min-[600px]:px-6 min-[600px]:pb-5 min-[600px]:pt-4 md:px-8 md:pb-6 lg:px-10">
        {children}
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex min-[600px]:hidden border-t border-[var(--joballa-border)] bg-[var(--joballa-header)] pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
        aria-hidden
      >
        <div className="mx-auto flex min-h-[56px] w-full max-w-[1440px] items-stretch px-0.5 sm:px-1">
          {Array.from({ length: NAV_SLOT_COUNT }).map((_, i) => (
            <div key={i} className="flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center gap-1 py-1.5">
              <Skeleton className="size-6 rounded-md" />
              <Skeleton className="h-2 w-10 max-w-[4.5rem] sm:w-12" />
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}
