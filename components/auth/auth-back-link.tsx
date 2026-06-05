"use client";

import { ChevronLeft } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  label: string;
  className?: string;
};

export function AuthBackLink({ href, label, className }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 self-start text-sm font-medium text-[color:var(--auth-fg-muted)] transition hover:text-[color:var(--auth-fg)]",
        className,
      )}
    >
      <ChevronLeft className="size-4 shrink-0" aria-hidden strokeWidth={1.8} />
      {label}
    </Link>
  );
}
