import Image from "next/image";
import { Bookmark, CheckCircle2, MoreHorizontal } from "lucide-react";

type LandingHeroVisualProps = {
  imageAlt: string;
  verifiedBadge: string;
  verifiedSubtext: string;
  jobCard: {
    postedAgo: string;
    match: string;
    title: string;
    employmentType: string;
    location: string;
    level: string;
    pay: string;
    company: string;
    apply: string;
  };
};

export function LandingHeroVisual({
  imageAlt,
  verifiedBadge,
  verifiedSubtext,
  jobCard,
}: LandingHeroVisualProps) {
  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 size-[min(100%,494px)] -translate-x-1/2 -translate-y-1/2 -rotate-[4.8deg] rounded-full opacity-90"
        aria-hidden
        style={{
          background: "var(--landing-hero-ring)",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
          WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
        }}
      />

      <div
        className="relative overflow-hidden rounded-full"
        style={{ boxShadow: "var(--landing-hero-image-shadow)" }}
      >
        <Image
          src="/images/landing/hero-worker.png"
          alt={imageAlt}
          width={583}
          height={585}
          priority
          className="h-auto w-full object-cover"
          sizes="(max-width: 1024px) 100vw, 560px"
        />
      </div>

      <div className="absolute -bottom-4 left-0 z-10 flex max-w-[240px] items-center gap-3 rounded-[14px] border border-[var(--landing-hero-card-border)] bg-[var(--landing-hero-card-bg)] p-4 shadow-lg backdrop-blur-sm sm:-left-6">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f4a621] via-[#628152] to-[#0e6c6f] text-[var(--landing-hero-badge-icon-fg)]">
          <CheckCircle2 className="size-5" aria-hidden />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--landing-fg)]">{verifiedBadge}</p>
          <p className="text-xs text-[var(--landing-fg-secondary)]">{verifiedSubtext}</p>
        </div>
      </div>

      <div className="absolute bottom-8 right-0 z-10 hidden min-w-[248px] rounded-[11px] border border-[var(--landing-hero-card-border)] bg-[var(--landing-hero-card-bg)] p-3 shadow-xl backdrop-blur-sm sm:block sm:-right-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] text-[var(--landing-fg-muted)]">{jobCard.postedAgo}</p>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[var(--landing-hero-match-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--landing-hero-match-fg)]">
              {jobCard.match}
            </span>
            <MoreHorizontal className="size-4 text-[var(--landing-fg-muted)]" aria-hidden />
          </div>
        </div>
        <p className="mt-3 text-sm font-semibold text-[var(--landing-mockup-fg)]">{jobCard.title}</p>
        <p className="mt-1 text-[11px] font-semibold text-[var(--landing-fg-muted)]">
          {jobCard.employmentType}
          <span className="mx-1">·</span>
          {jobCard.location}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full border border-[var(--landing-hero-chip-border)] bg-[var(--landing-hero-chip-bg)] px-2 py-1 text-[10px] font-semibold text-[var(--landing-hero-chip-fg)]">
            {jobCard.level}
          </span>
          <span className="rounded-full border border-[var(--landing-hero-chip-border)] bg-[var(--landing-hero-chip-bg)] px-2 py-1 text-[10px] font-semibold text-[var(--landing-hero-chip-fg)]">
            {jobCard.pay}
          </span>
        </div>
        <div className="mt-3 flex items-end justify-between gap-3">
          <p className="text-[10px] font-semibold text-[var(--landing-fg-muted)]">{jobCard.company}</p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="flex size-7 items-center justify-center rounded-[10px] bg-[var(--landing-hero-icon-btn-bg)] text-[var(--landing-fg-muted)]"
              aria-label="Save job"
            >
              <Bookmark className="size-3.5" aria-hidden />
            </button>
            <span className="inline-flex h-7 items-center rounded-[10px] bg-[var(--landing-hero-apply-bg)] px-3 text-[11px] font-medium text-[var(--landing-hero-apply-fg)]">
              {jobCard.apply}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
