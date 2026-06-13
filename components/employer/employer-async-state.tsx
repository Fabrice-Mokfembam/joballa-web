"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { JoballaApiError } from "@/lib/joballa/request";
import { buttonClassName } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry?: () => void;
  loadingLabel?: string;
  errorLabel?: string;
  retryLabel?: string;
  children: ReactNode;
  className?: string;
  skeleton?: ReactNode;
};

function DefaultSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <Skeleton className="h-8 w-48 rounded-lg" />
      <Skeleton className="h-24 rounded-[14px]" />
      <Skeleton className="h-24 rounded-[14px]" />
    </div>
  );
}

export function EmployerAsyncState({
  isLoading,
  isError,
  error,
  onRetry,
  loadingLabel,
  errorLabel,
  retryLabel,
  children,
  className,
  skeleton,
}: Props) {
  const t = useTranslations("common.asyncState");
  const resolvedLoadingLabel = loadingLabel ?? t("loading");
  const resolvedErrorLabel = errorLabel ?? t("error");
  const resolvedRetryLabel = retryLabel ?? t("retry");

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)} aria-busy>
        {skeleton ?? <DefaultSkeleton />}
        <p className="sr-only">{resolvedLoadingLabel}</p>
      </div>
    );
  }

  if (isError) {
    const message = error instanceof JoballaApiError ? error.message : resolvedErrorLabel;
    return (
      <div
        className={cn(
          "rounded-[14px] border px-4 py-6 text-center sm:px-6",
          "border-[color-mix(in_srgb,var(--joballa-danger-fg)_35%,var(--joballa-border))] bg-[var(--joballa-danger-bg)]",
          className,
        )}
        role="alert"
      >
        <p className="text-sm font-medium text-[var(--joballa-danger-fg)]">{message}</p>
        {onRetry ? (
          <button type="button" onClick={onRetry} className={cn(buttonClassName(), "mt-4")}>
            {resolvedRetryLabel}
          </button>
        ) : null}
      </div>
    );
  }

  return <>{children}</>;
}
