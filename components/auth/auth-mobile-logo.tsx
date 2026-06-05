import Image from "next/image";
import { cn } from "@/lib/utils";

/** Joballa mark + wordmark above the form on small screens (sidebar hidden on `lg`). */
export function AuthMobileLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex w-full justify-center lg:hidden", className)}>
      <div className="flex items-center justify-center gap-2.5">
        <span className="relative size-10 shrink-0 overflow-hidden rounded-[18px]" aria-hidden>
          <Image src="/brand/auth-logo-mark.png" alt="" fill className="object-contain" sizes="40px" priority />
        </span>
        <span className="font-remixa text-[clamp(1.25rem,3vw+0.5rem,1.75rem)] font-bold tracking-tight text-[color:var(--auth-fg)]">
          joballa
        </span>
      </div>
    </div>
  );
}
