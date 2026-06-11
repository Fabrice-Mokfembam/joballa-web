import { LandingProfileMockup } from "@/features/landing/landing-profile-mockup";

const shell = "mx-auto w-full max-w-[1200px] px-6 md:px-10 lg:px-16";

function JourneyPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex w-fit self-start rounded-full border border-[var(--landing-border-muted)] bg-[var(--landing-mockup-input-bg)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--landing-mockup-fg)]">
      {children}
    </span>
  );
}

function StepList({ steps }: { steps: { title: string; description: string }[] }) {
  return (
    <ol className="flex flex-col gap-8">
      {steps.map((step, index) => (
        <li key={step.title} className="flex gap-6">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--landing-step-bg)] text-base font-bold text-[var(--landing-step-fg)]">
            {index + 1}
          </span>
          <div className="min-w-0 pt-0.5">
            <h4 className="text-lg font-semibold leading-7 text-[var(--landing-fg)]">{step.title}</h4>
            <p className="mt-0 text-base leading-6 text-[var(--landing-fg-secondary)]">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

type LandingHowItWorksSectionProps = {
  kicker: string;
  title: string;
  workersLabel: string;
  employersLabel: string;
  workerSteps: { title: string; description: string }[];
  employerSteps: { title: string; description: string }[];
};

export function LandingHowItWorksSection({
  kicker,
  title,
  workersLabel,
  employersLabel,
  workerSteps,
  employerSteps,
}: LandingHowItWorksSectionProps) {
  return (
    <section id="how-it-works" className="overflow-x-clip bg-[var(--landing-section-alt)] py-10 sm:py-16">
      <div className={shell}>
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-base uppercase tracking-[0.16em] text-[var(--landing-kicker)]">{kicker}</p>
          <h2 className="text-2xl font-semibold leading-[1.3] text-[var(--landing-fg)]">{title}</h2>
        </div>

        <div className="mt-10 flex min-w-0 flex-col gap-10">
          <div className="flex min-w-0 flex-col gap-4">
            <JourneyPill>{workersLabel}</JourneyPill>
            <div className="grid min-w-0 gap-10 lg:grid-cols-2 lg:items-start">
              <div className="min-w-0">
                <LandingProfileMockup />
              </div>
              <div className="min-w-0">
                <StepList steps={workerSteps} />
              </div>
            </div>
          </div>

          <div id="for-employers" className="flex flex-col gap-4">
            <JourneyPill>{employersLabel}</JourneyPill>
            <StepList steps={employerSteps} />
          </div>
        </div>
      </div>
    </section>
  );
}
