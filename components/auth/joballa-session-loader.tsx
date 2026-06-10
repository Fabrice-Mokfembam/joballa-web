import Image from "next/image";
import { cn } from "@/lib/utils";

const RING_SIZE = 88;
const RING_RADIUS = 38;
const RING_STROKE = 3;
const RING_CX = RING_SIZE / 2;
const RING_CY = RING_SIZE / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
/** ~25% arc — matches the teal segment in the auth-check mockup. */
const ARC_LENGTH = RING_CIRCUMFERENCE * 0.26;

type JoballaSessionLoaderProps = {
  className?: string;
};

/** Branded indeterminate loader: ring around logo mark, wordmark below. */
export function JoballaSessionLoader({ className }: JoballaSessionLoaderProps) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative size-[88px] shrink-0">
        <svg
          className="pointer-events-none absolute inset-0 size-full"
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          fill="none"
          aria-hidden
        >
          <circle
            cx={RING_CX}
            cy={RING_CY}
            r={RING_RADIUS}
            stroke="var(--joballa-border)"
            strokeWidth={RING_STROKE}
          />
        </svg>
        <svg
          className="pointer-events-none absolute inset-0 size-full origin-center animate-spin"
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          fill="none"
          aria-hidden
        >
          <circle
            cx={RING_CX}
            cy={RING_CY}
            r={RING_RADIUS}
            stroke="var(--joballa-primary)"
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={`${ARC_LENGTH} ${RING_CIRCUMFERENCE - ARC_LENGTH}`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/brand/auth-logo-mark.png"
            alt=""
            width={40}
            height={40}
            className="size-10 shrink-0"
            priority
          />
        </div>
      </div>
      <p
        className="mt-6 font-remixa text-[1.75rem] font-bold lowercase leading-none tracking-tight text-[var(--joballa-fg)]"
        translate="no"
      >
        joballa
      </p>
      <span className="sr-only">Loading</span>
    </div>
  );
}
