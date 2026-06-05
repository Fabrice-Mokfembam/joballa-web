import { portalPageShellClass, portalStatGridClass } from "@/components/portal/portal-ui";
import { PortalPageHeaderSkeleton, PortalSettingsPageSkeleton } from "@/components/loading/portal-page-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

function StatSkeleton() {
  return (
    <div className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] px-4 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:px-5 sm:py-4">
      <Skeleton className="h-3 w-24" />
      <div className="mt-2 flex items-end justify-between gap-3">
        <Skeleton className="h-9 w-16 sm:h-10 sm:w-20" />
        <Skeleton className="h-3 w-14 sm:h-4 sm:w-16" />
      </div>
    </div>
  );
}

function ApplicantRowSkeleton() {
  return (
    <div className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

function JobPostingCardSkeleton() {
  return (
    <div className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="mt-3 h-6 w-4/5" />
      <Skeleton className="mt-2 h-4 w-1/2" />
      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-8 w-16 rounded-xl" />
      </div>
    </div>
  );
}

/** Mirrors {@link EmployerDashboard}. */
export function EmployerDashboardPageSkeleton() {
  return (
    <div className={portalPageShellClass} aria-busy>
      <section className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Skeleton className="h-9 w-56 max-w-full sm:h-10 sm:w-64" />
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Skeleton className="h-10 w-28 rounded-[14px] sm:h-11" />
            <Skeleton className="h-10 w-36 rounded-[14px] sm:h-11" />
          </div>
        </div>
        <div className={portalStatGridClass}>
          {Array.from({ length: 4 }).map((_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-6 w-40" />
          <div className="flex items-center gap-2">
            <div className="flex rounded-[12px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-1">
              <Skeleton className="size-8 rounded-[8px]" />
              <Skeleton className="size-8 rounded-[8px]" />
            </div>
            <Skeleton className="h-4 w-14" />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <ApplicantRowSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

export function EmployerApplicantsPageSkeleton() {
  return (
    <div className={portalPageShellClass} aria-busy>
      <Skeleton className="h-9 w-48 max-w-full" />
      <div className={portalStatGridClass}>
        {Array.from({ length: 4 }).map((_, i) => (
          <StatSkeleton key={i} />
        ))}
      </div>
      <Skeleton className="h-11 w-full rounded-[14px]" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <ApplicantRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function EmployerJobsPageSkeleton() {
  return (
    <div className={portalPageShellClass} aria-busy>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-10 w-28 rounded-[14px] sm:h-11" />
      </div>
      <Skeleton className="h-11 w-full rounded-[14px]" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <JobPostingCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function EmployerProfilePageSkeleton() {
  return (
    <div className={portalPageShellClass} aria-busy>
      <Skeleton className="h-10 w-36 rounded-[14px] self-start" />
      <div className="w-full rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:p-8">
        <div className="flex flex-col items-center gap-4 border-b border-[var(--joballa-border)] pb-6 md:flex-row md:items-center">
          <Skeleton className="size-24 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="grid gap-3 border-b border-[var(--joballa-border)] py-6 last:border-0 md:grid-cols-[28%_1fr]">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmployerSettingsPageSkeleton() {
  return <PortalSettingsPageSkeleton sections={3} />;
}

export function EmployerGenericPageSkeleton() {
  return (
    <div className={portalPageShellClass} aria-busy>
      <PortalPageHeaderSkeleton />
      <div className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-4 h-24 w-full rounded-lg" />
        <Skeleton className="mt-3 h-24 w-full rounded-lg" />
        <Skeleton className="mt-4 h-10 w-36 rounded-[14px]" />
      </div>
    </div>
  );
}
