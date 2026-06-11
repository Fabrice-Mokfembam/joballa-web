import Image from "next/image";
import { ChevronDown, UploadCloud } from "lucide-react";

function MockField({ label, value, placeholder }: { label: string; value?: string; placeholder?: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <label className="px-1 text-xs font-medium text-[var(--landing-fg-muted)]">{label}</label>
      <div className="flex h-9 min-w-0 items-center rounded-xl border border-[var(--landing-border-muted)] bg-[var(--landing-mockup-input-bg)] px-2 text-sm text-[var(--landing-mockup-fg)] sm:px-3">
        {value ? (
          <span className="truncate">{value}</span>
        ) : (
          <span className="truncate text-[var(--landing-fg-muted)]">{placeholder}</span>
        )}
      </div>
    </div>
  );
}

function MockSelect({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <label className="px-1 text-xs font-medium text-[var(--landing-fg-muted)]">{label}</label>
      <div className="flex h-9 min-w-0 items-center justify-between gap-1 rounded-xl border border-[var(--landing-border-muted)] bg-[var(--landing-mockup-input-bg)] px-2.5 text-sm text-[var(--landing-mockup-fg)]">
        <span className="truncate">{value}</span>
        <ChevronDown className="size-4 shrink-0 text-[var(--landing-fg-muted)]" aria-hidden />
      </div>
    </div>
  );
}

export function LandingProfileMockup() {
  return (
    <div className="min-w-0 overflow-hidden rounded-[14px] border border-[var(--landing-border-muted)] bg-[var(--landing-mockup-bg)] p-4 sm:p-6">
      <p className="text-xs font-bold uppercase tracking-normal text-[var(--landing-fg-muted)]">Personal info</p>
      <div className="mt-1.5 flex flex-col gap-4 sm:flex-row sm:gap-2">
        <div className="flex shrink-0 flex-col items-center gap-1.5 px-2 py-2 sm:py-4">
          <div className="relative size-24 overflow-hidden rounded-full bg-white">
            <Image
              src="/images/landing/how-profile-avatar.png"
              alt=""
              fill
              sizes="96px"
              className="object-cover object-top"
            />
          </div>
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1 rounded-xl px-3 text-sm font-medium text-[var(--joballa-primary)] shadow-[0_1px_1px_rgba(0,0,0,0.1)]"
          >
            <UploadCloud className="size-4" aria-hidden />
            Replace
          </button>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-7 py-2 sm:py-4 sm:pl-4">
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <MockField label="First Name" value="Ako" />
              <MockField label="Last Name" value="James" />
            </div>
            <div className="flex gap-2">
              <MockSelect label="Location" value="Cameroon" />
              <MockSelect label="City" value="Buea" />
            </div>
            <MockField label="Phone" value="+237" />
            <div className="flex min-w-0 flex-col gap-1">
              <label className="px-1 text-xs font-medium text-[var(--landing-fg-muted)]">Languages Spoken</label>
              <div className="flex h-9 min-w-0 items-center justify-between gap-2 rounded-xl border border-[var(--landing-border-muted)] bg-[var(--landing-mockup-input-bg)] px-2.5 text-sm text-[var(--landing-fg-muted)]">
                <span className="truncate">Ex: English, French, Spanish</span>
                <ChevronDown className="size-4 shrink-0" aria-hidden />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-11 shrink-0 rounded-full bg-[var(--landing-border-muted)] p-0.5">
              <div className="size-5 rounded-full bg-[var(--landing-mockup-input-bg)]" />
            </div>
            <span className="text-sm text-[var(--landing-fg-muted)]">Available to Work</span>
          </div>
        </div>
      </div>
    </div>
  );
}
