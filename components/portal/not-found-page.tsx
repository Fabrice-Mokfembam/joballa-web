import { ArrowLeft, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { JoballaPanelLogoMark } from "@/components/brand/joballa-panel-logo-mark";

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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] px-4 py-12 text-[var(--joballa-fg,#fafafa)]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(20,163,168,0.22),transparent_58%)]"
        aria-hidden
      />
      <div className="relative w-full max-w-[440px] rounded-[20px] border border-[#262626] bg-[#141414] px-6 py-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:px-8 sm:py-10">
        <div className="mx-auto flex size-12 items-center justify-center overflow-hidden rounded-[14px] bg-[#0b5c5f] shadow-[0_8px_24px_rgba(13,115,119,0.35)]">
          <JoballaPanelLogoMark size={40} alt="" className="size-10 rounded-[12px]" />
        </div>
        <p className="mt-6 text-[2.75rem] font-bold leading-none tracking-tight text-[#14a3a8]">404</p>
        <h1 className="mt-3 text-xl font-semibold tracking-tight text-white">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-[#a1a1a1]">{description}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={dashboardHref}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#14a3a8] px-5 text-sm font-semibold text-white shadow-[0_1px_1px_rgba(0,0,0,0.35)] transition hover:brightness-110"
          >
            <LayoutDashboard className="size-4" strokeWidth={2} />
            {ctaDashboard}
          </Link>
          <Link
            href={signInHref}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
          >
            <ArrowLeft className="size-4" strokeWidth={2} />
            {ctaSignIn}
          </Link>
        </div>
      </div>
    </div>
  );
}
