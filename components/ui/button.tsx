import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
}

export function buttonClassName(
  variant: NonNullable<ButtonProps["variant"]> = "primary",
) {
  const base =
    "inline-flex cursor-pointer items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const variants = {
    primary:
      "bg-[var(--joballa-primary)] text-[var(--joballa-on-primary)] shadow-[var(--joballa-shadow-card)] hover:brightness-110 focus:ring-[var(--joballa-primary)]/40",
    outline:
      "border border-[var(--joballa-border)] bg-[var(--joballa-card)] text-[var(--joballa-fg)] shadow-[var(--joballa-shadow-card)] hover:border-[color-mix(in_srgb,var(--joballa-primary)_35%,var(--joballa-border))] hover:bg-[var(--joballa-row-hover)] focus:ring-[var(--joballa-primary)]/30",
    ghost:
      "border border-transparent bg-transparent text-[var(--joballa-fg)] hover:bg-[var(--joballa-row-hover)] focus:ring-[var(--joballa-primary)]/30",
  };

  return cn(base, variants[variant]);
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonClassName(variant), className)}
      {...props}
    />
  );
}
