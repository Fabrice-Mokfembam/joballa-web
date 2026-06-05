import { portalPageShellClass } from "@/components/portal/portal-ui";
import { Skeleton } from "@/components/ui/skeleton";

/** Page title + description (settings, generic portal pages). */
export function PortalPageHeaderSkeleton() {
  return (
    <header className="space-y-2">
      <Skeleton className="h-8 w-48 max-w-full sm:h-9" />
      <Skeleton className="h-4 w-full max-w-lg" />
    </header>
  );
}

/** Matches {@link SettingsSectionHeader} + toggle rows in portal settings. */
export function PortalSettingsSectionSkeleton({ toggleRows = 4 }: { toggleRows?: number }) {
  return (
    <section className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:p-6">
      <div className="mb-6 grid grid-cols-[48px_minmax(0,1fr)] items-center gap-4">
        <Skeleton className="size-12 rounded-[8px]" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
      </div>
      {Array.from({ length: toggleRows }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-4 border-t border-[var(--joballa-border)] py-5 first:border-t-0 first:pt-0 last:pb-0"
        >
          <Skeleton className="size-12 rounded-[8px]" />
          <div className="min-w-0 space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-full max-w-sm" />
          </div>
          <Skeleton className="h-7 w-12 rounded-full" />
        </div>
      ))}
    </section>
  );
}

export function PortalSettingsPageSkeleton({ sections = 3 }: { sections?: number }) {
  return (
    <div className={portalPageShellClass} aria-busy>
      <PortalPageHeaderSkeleton />
      {Array.from({ length: sections }).map((_, i) => (
        <PortalSettingsSectionSkeleton key={i} toggleRows={i === 0 ? 4 : i === 1 ? 3 : 2} />
      ))}
    </div>
  );
}
