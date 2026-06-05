import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Wordmark color follows marketing (dark) or auth (light) shell. */
  variant?: "marketing" | "auth";
};

/** Nav lockup — brand mark image + wordmark (matches auth mobile logo). */
export function JoballaAuthNavLogo({ className, variant = "auth" }: Props) {
  const wordmarkClass =
    variant === "marketing"
      ? "text-[var(--joballa-fg)]"
      : "text-[color:var(--auth-fg)]";

  return (
    <Link
      href="/"
      className={cn("inline-flex shrink-0 items-center gap-2", className)}
      aria-label="Joballa home"
    >
      <Image
        src="/brand/auth-logo-mark.png"
        alt=""
        width={32}
        height={32}
        className="size-8 shrink-0"
        priority
      />
      <span
        className={cn(
          "font-remixa text-base font-semibold lowercase leading-none tracking-tight",
          wordmarkClass,
        )}
        translate="no"
      >
        joballa
      </span>
    </Link>
  );
}
