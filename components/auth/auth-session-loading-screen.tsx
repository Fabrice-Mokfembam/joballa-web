import Image from "next/image";
import { cn } from "@/lib/utils";

type AuthSessionLoadingScreenProps = {
  className?: string;
};

/** Full-screen gate while protected routes hydrate or refresh the session. */
export function AuthSessionLoadingScreen({ className }: AuthSessionLoadingScreenProps) {
  return (
    <div
      className={cn(
        "joballa-auth-root flex min-h-dvh w-full flex-col items-center justify-center bg-[color:var(--auth-shell-bg)] px-6",
        className,
      )}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-8">
        <div className="flex items-center gap-2.5">
          <span className="relative size-11 shrink-0 overflow-hidden rounded-[20px]" aria-hidden>
            <Image
              src="/brand/auth-logo-mark.png"
              alt=""
              fill
              className="object-contain"
              sizes="44px"
              priority
            />
          </span>
          <span className="font-remixa text-[32px] font-bold leading-8 tracking-tight text-[color:var(--auth-brand-wordmark-fg)]">
            joballa
          </span>
        </div>
        <div
          className="size-10 animate-spin rounded-full border-[3px] border-[color:var(--joballa-primary)] border-t-transparent"
          aria-hidden
        />
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
}
