import { portalPageShellClass, portalSegmentGroupClass, portalStatGridClass } from "@/components/portal/portal-ui";
import { PortalPageHeaderSkeleton, PortalSettingsPageSkeleton } from "@/components/loading/portal-page-skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function JobCardSkeleton() {
  return (
    <div className="flex flex-col gap-6 rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-3 w-16" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="size-6 rounded-md" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-[88%]" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="flex gap-1.5">
          <Skeleton className="h-8 w-10 rounded-xl" />
          <Skeleton className="h-8 w-16 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function WorkerStatCardSkeleton() {
  return (
    <div className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-3 shadow-sm sm:p-3.5">
      <Skeleton className="h-3 w-20 sm:w-24" />
      <div className="mt-2 flex items-end justify-between gap-1.5 sm:mt-3 sm:gap-2">
        <Skeleton className="h-8 w-14 sm:h-10 sm:w-20 md:h-12 md:w-24" />
        <Skeleton className="h-3 w-14 sm:w-16" />
      </div>
    </div>
  );
}

/** Matches {@link WorkerDashboard} body (shell is separate during auth hydrate). */
export function WorkerDashboardPageSkeleton() {
  return (
    <div className={portalPageShellClass} aria-busy>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <div className={portalStatGridClass}>
        {Array.from({ length: 4 }).map((_, i) => (
          <WorkerStatCardSkeleton key={i} />
        ))}
      </div>
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-6 w-48" />
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-4 w-14" />
            <div className={portalSegmentGroupClass}>
              <Skeleton className="size-8 rounded-[8px]" />
              <Skeleton className="size-8 rounded-[8px]" />
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Skeleton className="h-6 w-40" />
            <div className="flex gap-3">
              <Skeleton className="h-9 w-28 rounded-lg" />
              <Skeleton className="h-4 w-14" />
            </div>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="mt-3 h-3 w-full" />
              </div>
            ))}
          </div>
        </section>
        <section>
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-14" />
          </div>
          <div className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-4 h-32 w-full rounded-lg" />
            <Skeleton className="mt-4 h-10 w-full rounded-xl" />
          </div>
        </section>
      </div>
    </div>
  );
}

/** Toolbar + job grid — mirrors {@link WorkerFindJobsViewInner}. */
export function WorkerFindJobsPageSkeleton({ cards = 6, grid = true }: { cards?: number; grid?: boolean }) {
  return (
    <div className="w-full" aria-busy>
      {grid ? (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {Array.from({ length: cards }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] shadow-[var(--joballa-shadow-card)]">
          <div className="min-w-[640px]">
            <div className="flex gap-4 border-b border-[var(--joballa-border)] px-4 py-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-3 flex-1" />
              ))}
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-4 border-b border-[var(--joballa-border)] px-4 py-3 last:border-0">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 flex-1" />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Job detail: back link + article + sticky sidebar. */
export function WorkerJobDetailPageSkeleton() {
  return (
    <div className={portalPageShellClass} aria-busy>
      <Skeleton className="h-5 w-40" />
      <div className="flex min-h-0 flex-1 flex-col gap-5 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-4 shadow-sm sm:p-6">
            <div className="flex justify-between gap-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="mt-4 h-8 w-4/5 max-w-xl" />
            <Skeleton className="mt-3 h-4 w-1/2" />
            <div className="mt-4 flex gap-2">
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-7 w-28 rounded-full" />
            </div>
            <div className="mt-6 flex items-center gap-2 border-t border-[var(--joballa-border)] pt-6">
              <Skeleton className="size-10 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-4 shadow-sm sm:p-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-3 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-5/6" />
            <Skeleton className="mt-6 h-6 w-40" />
            <div className="mt-3 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        </div>
        <aside className="w-full shrink-0 lg:w-[300px]">
          <div className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-4 shadow-sm sm:p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2 h-8 w-32" />
            <Skeleton className="mt-3 h-3 w-full" />
            <Skeleton className="mt-5 h-11 w-full rounded-xl" />
          </div>
        </aside>
      </div>
    </div>
  );
}

/** Applications index: filter pills + search + cards. */
export function WorkerApplicationsPageSkeleton() {
  return (
    <div className={portalPageShellClass} aria-busy>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-44 rounded-full" />
        <Skeleton className="h-9 w-44 rounded-full" />
      </div>
      <div className="flex flex-col gap-[26px]">
        <Skeleton className="h-14 w-full rounded-[14px]" />
        <div className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-xl" />
              ))}
            </div>
            <div className={portalSegmentGroupClass}>
              <Skeleton className="size-8 rounded-[8px]" />
              <Skeleton className="size-8 rounded-[8px]" />
            </div>
          </div>
          <div className="grid gap-3.5 lg:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-[14px] shadow-[var(--joballa-shadow-card)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <Skeleton className="h-5 w-3/5" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-6 rounded-full" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Application detail two-column layout. */
export function WorkerApplicationDetailPageSkeleton() {
  return (
    <div className={portalPageShellClass} aria-busy>
      <Skeleton className="h-5 w-56" />
      <Skeleton className="h-5 w-32" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
            <div className="flex justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="size-8" />
            </div>
            <Skeleton className="mt-6 h-7 w-4/5" />
            <div className="mt-4 flex gap-2">
              <Skeleton className="size-9 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="mt-6 space-y-3 border-t border-[var(--joballa-border)] pt-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between gap-4">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          </div>
          <Skeleton className="h-40 w-full rounded-[14px]" />
        </div>
        <div className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <Skeleton className="mx-auto size-28 rounded-full md:mx-0" />
          <Skeleton className="mt-6 h-6 w-48" />
          <Skeleton className="mt-2 h-3 w-full" />
          <Skeleton className="mt-6 h-24 w-full" />
        </div>
      </div>
    </div>
  );
}

/** Earnings: stat row + tabs + table. */
export function WorkerEarningsPageSkeleton() {
  return (
    <div className={cn(portalPageShellClass, "gap-[26px]")} aria-busy>
      <div className={cn(portalStatGridClass, "gap-[22px]")}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-[13px] rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-[14px]"
          >
            <Skeleton className="h-3 w-24" />
            <div className="flex items-end justify-between gap-2">
              <Skeleton className="h-12 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-4 w-36" />
      <div className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-8 w-32 rounded-xl" />
        </div>
        <div className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-3">
          <div className="mb-2 flex gap-4 px-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-3 flex-1" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={cn("flex items-center gap-4 rounded-lg px-2.5 py-2.5", i % 2 === 0 && "bg-[var(--joballa-row-selected)]")}>
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 flex-1" />
              <Skeleton className="h-3 flex-1" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Settings — stacked section cards with toggles. */
export function WorkerSettingsPageSkeleton() {
  return <PortalSettingsPageSkeleton sections={3} />;
}

/** Profile: preview card + editor. */
export function WorkerProfilePageSkeleton() {
  return (
    <div className={portalPageShellClass} aria-busy>
      <div className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06)] md:p-8">
        <Skeleton className="h-10 w-40 rounded-[10px]" />
        <div className="mt-8 flex flex-col gap-6 border-b border-[var(--joballa-border)] pb-8 md:flex-row md:items-start">
          <Skeleton className="mx-auto size-28 shrink-0 rounded-full md:mx-0 md:size-32" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="mx-auto h-8 w-48 md:mx-0" />
            <Skeleton className="mx-auto h-3 w-64 md:mx-0" />
          </div>
          <div className="mx-auto space-y-2 md:mx-0 md:text-right">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
        <div className="space-y-2 border-b border-[var(--joballa-border)] py-6">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
      <section className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-3 w-full max-w-xl" />
        <div className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>
      </section>
    </div>
  );
}
