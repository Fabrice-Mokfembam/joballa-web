import { Skeleton } from "@/components/ui/skeleton";

/** Shown while the locale layout loads messages (brief global gate). */
export default function Loading() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[var(--joballa-page)] px-4" aria-busy>
      <Skeleton className="size-11 rounded-xl" />
      <div className="flex w-full max-w-xs flex-col gap-2">
        <Skeleton className="h-3 w-full rounded-md" />
        <Skeleton className="h-3 w-4/5 rounded-md" />
        <Skeleton className="h-3 w-5/6 rounded-md" />
      </div>
    </div>
  );
}
