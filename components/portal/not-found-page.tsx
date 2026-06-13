import { ArrowLeft, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { JoballaPanelLogoMark } from "@/components/brand/joballa-panel-logo-mark";
import { cn } from "@/lib/utils";

type NotFoundPageProps = {
  title: string;
  description: string;
  ctaDashboard: string;
  ctaSignIn: string;
  dashboardHref?: string;
  signInHref?: string;
};

export function NotFoundPage({
  title,
  description,
  ctaDashboard,
  ctaSignIn,
  dashboardHref = "/",
  signInHref = "/sign-in",
}: NotFoundPageProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--joballa-page)] px-4 py-12 text-[var(--joballa-fg)]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,color-mix(in_srgb,var(--joballa-primary)_20%,transparent),transparent_58%)]"
        aria-hidden
      />
      <div
        className={cn(
          "relative w-full max-w-[440px] rounded-[20px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] px-6 py-8 text-center shadow-[var(--joballa-shadow-elevated)] sm:px-8 sm:py-10",
        )}
      >
        <div className="mx-auto flex size-12 items-center justify-center overflow-hidden rounded-[14px] bg-[var(--joballa-jade-3)] shadow-[var(--joballa-shadow-card)]">
          <JoballaPanelLogoMark size={40} alt="" className="size-10 rounded-[12px]" />
        </div>
        <p className="mt-6 text-[2.75rem] font-bold leading-none tracking-tight text-[var(--joballa-primary)]">404</p>
        <h1 className="mt-3 text-xl font-semibold tracking-tight text-[var(--joballa-fg)]">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--joballa-muted)]">{description}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={dashboardHref}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--joballa-primary)] px-5 text-sm font-semibold text-[var(--joballa-on-primary)] shadow-[var(--joballa-shadow-card)] transition hover:opacity-90"
          >
            <LayoutDashboard className="size-4" strokeWidth={2} />
            {ctaDashboard}
          </Link>
          <Link
            href={signInHref}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--joballa-border)] px-5 text-sm font-semibold text-[var(--joballa-fg)] transition hover:bg-[var(--joballa-row-hover)]"
          >
            <ArrowLeft className="size-4" strokeWidth={2} />
            {ctaSignIn}
          </Link>
        </div>
      </div>
    </div>
  );
}
