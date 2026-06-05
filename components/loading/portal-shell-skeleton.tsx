import { PortalShellChromeSkeleton } from "@/components/loading/portal-shell-chrome-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

/** Shown while portal auth hydrates — shell chrome only; page body loads via route `loading.tsx`. */
export function PortalShellSkeleton() {
  return (
    <PortalShellChromeSkeleton>
      <div className="flex w-full min-w-0 flex-1 flex-col gap-4 bg-[var(--joballa-page-tint)] sm:gap-5 md:gap-6">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
        <div className="grid gap-2.5 min-[420px]:grid-cols-2 sm:gap-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-3 shadow-sm sm:p-3.5"
            >
              <Skeleton className="h-3 w-20" />
              <div className="mt-2 flex items-end justify-between gap-2 sm:mt-3">
                <Skeleton className="h-8 w-14 sm:h-10 sm:w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-6 w-40" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[168px] w-full rounded-[14px]" />
          ))}
        </div>
      </div>
    </PortalShellChromeSkeleton>
  );
}
