import { PortalPageHeaderSkeleton } from "@/components/loading/portal-page-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

/** Marketing home: header strip + hero two-column + visual panel. */
export function PublicMarketingLandingSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--joballa-page)] text-[var(--joballa-fg)] antialiased" aria-busy>
      <header className="sticky top-0 z-50 border-b border-[var(--joballa-border)] bg-[var(--joballa-page)]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-6 py-4">
          <Skeleton className="h-11 w-32 rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-11 w-[120px] rounded-full" />
            <Skeleton className="h-11 w-[120px] rounded-full" />
          </div>
        </div>
      </header>
      <main className="flex min-h-[calc(100dvh-5.25rem)] flex-col px-6 py-14 lg:py-20">
        <div className="mx-auto grid w-full max-w-[1440px] flex-1 gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <Skeleton className="h-6 w-32 rounded-full" />
            <div className="space-y-3">
              <Skeleton className="h-12 w-full max-w-xl" />
              <Skeleton className="h-12 w-4/5 max-w-lg" />
              <Skeleton className="h-5 w-full max-w-md" />
            </div>
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-12 w-40 rounded-xl" />
              <Skeleton className="h-12 w-40 rounded-xl" />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <div className="flex -space-x-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="size-10 shrink-0 rounded-full border-2 border-[var(--joballa-page)]" />
                ))}
              </div>
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="rounded-2xl border border-[var(--joballa-border)] bg-[var(--joballa-card)]/40 p-4">
              <Skeleton className="h-4 w-full max-w-sm" />
              <Skeleton className="mt-3 h-10 w-36 rounded-lg" />
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <Skeleton className="aspect-[4/5] min-h-[280px] w-full rounded-[28px] lg:aspect-[5/6] lg:min-h-[440px]" />
            <div className="absolute -left-2 top-[12%] hidden max-w-[240px] sm:block sm:left-0 sm:max-w-[260px] lg:block">
              <div className="rounded-2xl border border-[var(--joballa-border)] bg-[var(--joballa-card)]/80 p-4 shadow-lg backdrop-blur-sm">
                <Skeleton className="h-3 w-24" />
                <div className="mt-3 space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Auth split main column — mirrors {@link SignInForm} / sign-up forms
 * (mobile back + logo, title, subhead, fields, primary CTA, or-divider, outline alt).
 */
export function AuthSplitInnerSkeleton({
  extraFields = 0,
}: {
  /** Additional input rows (sign-up steps with more fields). */
  extraFields?: number;
}) {
  return (
    <div className="flex w-full flex-col gap-5 text-[color:var(--auth-fg)]" aria-busy>
      <div className="flex flex-col gap-5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mx-auto h-10 w-32 rounded-lg min-[600px]:hidden" />
      </div>
      <Skeleton className="h-9 w-56 max-w-full" />
      <Skeleton className="h-4 w-full max-w-md" />
      <div className="mt-3 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
        <div className="flex flex-col gap-1">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
        {Array.from({ length: extraFields }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        ))}
        <div className="flex justify-end">
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-11 w-full rounded-[12px]" />
        <div className="flex items-center gap-[26px] px-1 py-1">
          <div className="h-px flex-1 bg-[color:var(--auth-divider)]" />
          <Skeleton className="h-4 w-8" />
          <div className="h-px flex-1 bg-[color:var(--auth-divider)]" />
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

function PortalSectionCardSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:p-6">
      <div className="mb-5 max-w-3xl space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      {children}
    </section>
  );
}

const adminPageContentClass = "space-y-6";

/** Admin dashboard content (inside {@link AppShell} main panel). */
export function EmployerAdminDashboardSkeleton() {
  return (
    <div className={adminPageContentClass} aria-busy>
      <PortalPageHeaderSkeleton />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-3 shadow-sm sm:p-3.5"
          >
            <Skeleton className="h-3 w-24" />
            <div className="mt-2 flex items-end justify-between gap-2 sm:mt-3">
              <Skeleton className="h-9 w-16 sm:h-10 sm:w-20" />
              <Skeleton className="h-3 w-14" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <PortalSectionCardSkeleton>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-page-tint)] p-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="mt-2 h-3 w-full" />
              </div>
            ))}
          </div>
        </PortalSectionCardSkeleton>
        <PortalSectionCardSkeleton>
          <Skeleton className="h-24 w-full rounded-[14px]" />
        </PortalSectionCardSkeleton>
      </div>
    </div>
  );
}

/** Two-card grid inside a portal section (users, departments, …). */
export function SectionBlockTwoCardSkeleton() {
  return (
    <div className={adminPageContentClass} aria-busy>
      <PortalPageHeaderSkeleton />
      <PortalSectionCardSkeleton>
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-page-tint)] p-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-3 h-10 w-24" />
              <Skeleton className="mt-2 h-3 w-full" />
            </div>
          ))}
        </div>
      </PortalSectionCardSkeleton>
    </div>
  );
}

/** Three metric cards (admin applicants-style layout). */
export function SectionBlockThreeCardSkeleton() {
  return (
    <div className={adminPageContentClass} aria-busy>
      <PortalPageHeaderSkeleton />
      <PortalSectionCardSkeleton>
        <div className="grid gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-page-tint)] p-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-2 h-3 w-full" />
            </div>
          ))}
        </div>
      </PortalSectionCardSkeleton>
    </div>
  );
}

/** Single inner panel (jobs moderation, settings, reports). */
export function SectionBlockSingleInnerSkeleton() {
  return (
    <div className={adminPageContentClass} aria-busy>
      <PortalPageHeaderSkeleton />
      <PortalSectionCardSkeleton>
        <div className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-page-tint)] p-5">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
          <Skeleton className="mt-4 h-10 w-36 rounded-[14px]" />
        </div>
      </PortalSectionCardSkeleton>
    </div>
  );
}

/** Tiny placeholder for instant redirects. */
export function RedirectRouteSkeleton() {
  return (
    <div className="flex min-h-[30vh] w-full flex-1 items-center justify-center bg-[var(--joballa-page-tint)] px-4" aria-busy>
      <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-8 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
