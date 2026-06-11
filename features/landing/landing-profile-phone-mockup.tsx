"use client";

import { WorkerProfilePublic } from "@/components/worker/worker-profile-public";
import type { WorkerFullProfile } from "@/features/worker/types/worker-portal";
import { cn } from "@/lib/utils";

type LandingProfilePhoneMockupProps = {
  profile: WorkerFullProfile;
  label: string;
  className?: string;
};

export function LandingProfilePhoneMockup({ profile, label, className }: LandingProfilePhoneMockupProps) {
  return (
    <div className={cn("mx-auto w-full max-w-[320px]", className)} aria-label={label}>
      <div className="rounded-[2.25rem] border-[3px] border-[var(--landing-border)] bg-[var(--landing-card-elevated)] p-2 shadow-[0_24px_48px_rgba(0,0,0,0.18)]">
        <div className="overflow-hidden rounded-[1.75rem] border border-[var(--landing-border-muted)] bg-[var(--joballa-page-tint)]">
          <div className="flex items-center justify-center px-4 pb-1 pt-2" aria-hidden>
            <span className="h-1 w-16 rounded-full bg-[var(--landing-border-muted)]" />
          </div>

          <div className="max-h-[min(72vh,680px)] overflow-y-auto overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <WorkerProfilePublic
              previewProfile={profile}
              showEditProfileButton={false}
              forceMobileLayout
              className="gap-0 py-0 [&_article]:rounded-none [&_article]:border-0 [&_article]:shadow-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
