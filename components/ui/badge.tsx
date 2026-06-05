import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  /** e.g. dark marketing surfaces */
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[#0d7377]/25 bg-[#e6f4f1] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#0d7377]",
        className,
      )}
    >
      {children}
    </span>
  );
}
