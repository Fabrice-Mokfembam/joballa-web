import Image from "next/image";

import { getTranslations } from "next-intl/server";

import {

  BookOpen,

  Briefcase,

  FileDown,

  Hammer,

  Home,

  Languages,

  Lock,

  MapPin,

  PartyPopper,

  ShieldCheck,

  Smartphone,

  Sparkles,

  Truck,

  UserCheck,

  Wheat,

  Zap,

} from "lucide-react";

import { Link } from "@/lib/i18n/navigation";

import { PublicMarketingHeader } from "@/components/navigation/public-marketing-header";

import { LandingHeroVisual } from "@/features/landing/landing-hero-visual";

import { LandingHowItWorksSection } from "@/features/landing/landing-how-it-works-section";

import { cn } from "@/lib/utils";



const shell = "mx-auto w-full max-w-[1200px] px-6 md:px-10 lg:px-16";



function SectionKicker({ children, align = "center" }: { children: React.ReactNode; align?: "center" | "start" }) {

  return (

    <p

      className={cn(

        "text-sm font-normal uppercase tracking-[0.16em] text-[var(--landing-kicker)]",

        align === "center" ? "text-center" : "text-left",

      )}

    >

      {children}

    </p>

  );

}



function FeatureIconBox({ children }: { children: React.ReactNode }) {

  return (

    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[var(--landing-border)] bg-[var(--landing-card-elevated)] text-[var(--landing-accent)]">

      {children}

    </span>

  );

}



export async function LandingPage() {

  const t = await getTranslations("public");

  const year = new Date().getFullYear();



  const problemCards = [

    { key: "workers" as const, icon: UserCheck, highlight: true },

    { key: "employers" as const, icon: Briefcase, highlight: false },

    { key: "informal" as const, icon: Sparkles, highlight: false },

  ];



  const departmentItems = [

    { key: "education" as const, icon: BookOpen },

    { key: "domestic" as const, icon: Home },

    { key: "logistics" as const, icon: Truck },

    { key: "events" as const, icon: PartyPopper },

    { key: "agriculture" as const, icon: Wheat },

    { key: "construction" as const, icon: Hammer },

  ];



  const profileFeatures = [

    { key: "identity" as const, icon: ShieldCheck },

    { key: "skills" as const, icon: Briefcase },

    { key: "apply" as const, icon: Zap },

    { key: "cv" as const, icon: FileDown },

  ];



  const workerSteps = [0, 1, 2].map((i) => ({

    title: t(`howDual.seekers.steps.${i}.title`),

    description: t(`howDual.seekers.steps.${i}.description`),

  }));



  const employerSteps = [0, 1, 2].map((i) => ({

    title: t(`howDual.employers.steps.${i}.title`),

    description: t(`howDual.employers.steps.${i}.description`),

  }));



  const trustItems = [

    { label: t("trustBar.verifiedProfiles"), icon: ShieldCheck },

    { label: t("trustBar.mobileMoney"), icon: Smartphone },

    { label: t("trustBar.languages"), icon: Languages },

    { label: t("trustBar.cities"), icon: MapPin },

    { label: t("trustBar.secure"), icon: Lock },

  ];



  return (

    <div className="landing-page flex min-h-screen flex-col overflow-x-clip bg-[var(--landing-page-bg)] text-[var(--landing-fg)] antialiased">

      <header className="sticky top-0 z-50 border-b border-[var(--landing-border)] bg-[var(--landing-page-bg)]/90 backdrop-blur-md">

        <div className={cn(shell, "py-4")}>

          <PublicMarketingHeader surface="marketing" layout="landing" tone="dark" />

        </div>

      </header>



      <main className="flex flex-1 flex-col">

        <section className={cn(shell, "grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-12 lg:py-24")}>

          <div className="flex flex-col gap-4">

            <p className="text-sm uppercase tracking-[0.16em] text-[var(--landing-kicker)]">{t("hero.kicker")}</p>

            <h1 className="font-remixa text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[64px] lg:leading-[56px]">

              <span className="block text-[var(--landing-fg)]">{t("hero.titleLine1")}</span>

              <span className="block text-[var(--landing-fg)]">{t("hero.titleLine2")}</span>

              <span className="block text-[var(--joballa-primary)]">{t("hero.titleAccent")}</span>

            </h1>

            <p className="max-w-lg text-lg leading-relaxed text-[var(--landing-fg-secondary)]">{t("hero.description")}</p>

            <div className="flex flex-wrap gap-4 pt-2">

              <Link

                href="/sign-up/role"

                className="inline-flex h-14 min-w-[200px] items-center justify-center rounded-[14px] bg-[var(--joballa-primary)] px-8 text-base font-semibold text-[var(--joballa-on-primary)] transition hover:opacity-95"

              >

                {t("hero.findJobsCta")}

              </Link>

              <Link

                href="/sign-up/role"

                className="inline-flex h-14 min-w-[200px] items-center justify-center rounded-[14px] border-2 border-[var(--landing-border)] px-8 text-base font-semibold text-[var(--landing-fg)] transition hover:bg-white/5"

              >

                {t("hero.hireTalentCta")}

              </Link>

            </div>

          </div>



          <LandingHeroVisual

            imageAlt={t("hero.imageAlt")}

            verifiedBadge={t("hero.verifiedBadge")}

            verifiedSubtext={t("hero.verifiedSubtext")}

            jobCard={{

              postedAgo: t("hero.jobCard.postedAgo"),

              match: t("hero.jobCard.match"),

              title: t("hero.jobCard.title"),

              employmentType: t("hero.jobCard.employmentType"),

              location: t("hero.jobCard.location"),

              level: t("hero.jobCard.level"),

              pay: t("hero.jobCard.pay"),

              company: t("hero.jobCard.company"),

              apply: t("hero.jobCard.apply"),

            }}

          />

        </section>



        <section
          className="border-y border-[rgba(62,73,73,0.3)] py-8"
          style={{ backgroundImage: "var(--landing-trust-gradient)" }}
        >

          <div className={cn(shell, "flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mix-blend-overlay lg:justify-between")}>

            {trustItems.map(({ label, icon: Icon }) => (

              <div key={label} className="flex items-center gap-2 text-base font-extrabold text-[var(--landing-fg-secondary)]">

                <Icon className="size-4 shrink-0 text-[var(--landing-kicker)]" aria-hidden />

                <span>{label}</span>

              </div>

            ))}

          </div>

        </section>



        <section id="for-workers" className={cn(shell, "py-16 sm:py-20")}>

          <div className="mx-auto max-w-3xl text-center">

            <SectionKicker>{t("problem.kicker")}</SectionKicker>

            <h2 className="mt-3 text-2xl font-semibold leading-snug text-[var(--landing-fg)] sm:text-3xl">{t("problem.title")}</h2>

          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">

            {problemCards.map(({ key, icon: Icon, highlight }) => (

              <article

                key={key}

                className={cn(

                  "flex flex-col gap-4 rounded-2xl border bg-[var(--landing-problem-card-bg)] p-8",

                  highlight ? "border-[var(--landing-problem-card-highlight)]" : "border-[var(--landing-problem-card-border)]",

                )}

              >

                <Icon className="size-7 text-[var(--landing-accent)]" aria-hidden />

                <h3 className="text-xl font-semibold text-[var(--landing-fg)]">{t(`problem.cards.${key}.title`)}</h3>

                <p className="text-base leading-6 text-[var(--landing-fg-secondary)]">{t(`problem.cards.${key}.description`)}</p>

              </article>

            ))}

          </div>

        </section>



        <LandingHowItWorksSection

          kicker={t("howDual.kicker")}

          title={t("howDual.subtitle")}

          workersLabel={t("howDual.seekers.label")}

          employersLabel={t("howDual.employers.label")}

          workerSteps={workerSteps}

          employerSteps={employerSteps}

        />



        <section className={cn(shell, "grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2")}>

          <div className="relative max-w-md rounded-2xl border border-[var(--landing-border)] p-6 shadow-lg">
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden>
              <Image
                src="/images/landing/profile-feature-bg.png"
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 448px"
              />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-xl border border-[var(--landing-border)]">
              <Image
                src="/images/landing/profile-feature-dark.png"
                alt={t("oneProfile.imageAlt")}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 448px"
              />
            </div>
          </div>

          <div>

            <SectionKicker align="start">{t("oneProfile.kicker")}</SectionKicker>

            <h2 className="mt-3 text-2xl font-semibold text-[var(--landing-fg)] sm:text-3xl">{t("oneProfile.title")}</h2>

            <p className="mt-4 text-lg leading-relaxed text-[var(--landing-fg-secondary)]">{t("oneProfile.description")}</p>

            <ul className="mt-8 space-y-6">

              {profileFeatures.map(({ key, icon: Icon }) => (

                <li key={key} className="flex gap-4">

                  <FeatureIconBox>

                    <Icon className="size-5" aria-hidden />

                  </FeatureIconBox>

                  <div>

                    <h4 className="font-semibold text-[var(--landing-fg)]">{t(`oneProfile.features.${key}.title`)}</h4>

                    <p className="mt-1 text-sm leading-5 text-[var(--landing-fg-secondary)]">{t(`oneProfile.features.${key}.description`)}</p>

                  </div>

                </li>

              ))}

            </ul>

          </div>

        </section>



        <section className="bg-[var(--landing-section-muted)] py-16 sm:py-20">

          <div className={shell}>

            <div className="max-w-3xl">

              <SectionKicker align="start">{t("departments.kicker")}</SectionKicker>

              <h2 className="mt-3 text-2xl font-semibold text-[var(--landing-fg)] sm:text-3xl">{t("departments.title")}</h2>

              <p className="mt-4 text-base text-[var(--landing-fg-secondary)]">{t("departments.description")}</p>

            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {departmentItems.map(({ key, icon: Icon }) => (

                <article

                  key={key}

                  className="flex h-[114px] items-center gap-4 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-dept-card-bg)] px-6"

                >

                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--landing-dept-icon-bg)] text-[var(--landing-accent)]">

                    <Icon className="size-5" aria-hidden />

                  </span>

                  <div className="min-w-0">

                    <h3 className="text-base font-semibold text-[var(--landing-fg)]">{t(`departments.items.${key}.title`)}</h3>

                    <p className="mt-0.5 text-sm leading-5 text-[var(--landing-fg-secondary)]">{t(`departments.items.${key}.description`)}</p>

                  </div>

                </article>

              ))}

            </div>

          </div>

        </section>



        <section className={cn(shell, "py-16 sm:py-20")}>

          <div className="mx-auto max-w-3xl text-center">

            <SectionKicker>{t("payments.kicker")}</SectionKicker>

            <h2 className="mt-3 text-2xl font-semibold text-[var(--landing-fg)] sm:text-3xl">{t("payments.title")}</h2>

            <p className="mt-4 text-lg text-[var(--landing-fg-secondary)]">{t("payments.description")}</p>

          </div>

          <div className="mt-10 grid gap-10 md:grid-cols-2">

            <article className="relative overflow-hidden rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-section-alt)] p-10">

              <div className="pointer-events-none absolute -bottom-20 -right-20 size-64 rounded-full bg-[rgba(129,212,216,0.05)] blur-3xl" aria-hidden />

              <Smartphone className="relative size-8 text-[var(--landing-accent)]" aria-hidden />

              <h3 className="relative mt-4 text-2xl font-semibold text-[var(--landing-fg)]">{t("payments.cards.mobile.title")}</h3>

              <p className="relative mt-3 text-base leading-6 text-[var(--landing-fg-secondary)]">{t("payments.cards.mobile.description")}</p>

            </article>

            <article className="relative overflow-hidden rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-section-alt)] p-10">

              <div className="pointer-events-none absolute -bottom-20 -right-20 size-64 rounded-full bg-[rgba(129,212,216,0.05)] blur-3xl" aria-hidden />

              <Lock className="relative size-8 text-[var(--landing-accent)]" aria-hidden />

              <h3 className="relative mt-4 text-2xl font-semibold text-[var(--landing-fg)]">{t("payments.cards.records.title")}</h3>

              <p className="relative mt-3 text-base leading-6 text-[var(--landing-fg-secondary)]">{t("payments.cards.records.description")}</p>

            </article>

          </div>

        </section>



        <section className="relative overflow-hidden py-24 sm:py-28">

          <Image

            src="/images/landing/cta-gradient.png"

            alt=""

            fill

            className="object-cover"

            sizes="100vw"

            priority={false}

          />

          <div className={cn(shell, "relative text-center")}>

            <h2 className="font-remixa text-4xl font-semibold leading-tight text-[#d6f1e3] sm:text-5xl lg:text-[64px] lg:leading-[56px]">

              {t("closing.title")}

            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-[#e6f7ed]">{t("closing.description")}</p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">

              <Link

                href="/sign-up/role"

                className="inline-flex h-14 min-w-[220px] items-center justify-center rounded-lg bg-[#d6f1e3] px-10 text-lg font-bold text-[#0d7377] shadow-lg transition hover:opacity-95"

              >

                {t("closing.workerCta")}

              </Link>

              <Link

                href="/sign-up/role"

                className="inline-flex h-14 min-w-[220px] items-center justify-center rounded-lg border-2 border-[#d6f1e3] px-10 text-lg font-bold text-[#d6f1e3] backdrop-blur-sm transition hover:bg-white/10"

              >

                {t("closing.employerCta")}

              </Link>

            </div>

            <p className="mt-6 text-sm text-[rgba(162,245,249,0.6)]">{t("closing.footnote")}</p>

          </div>

        </section>

      </main>



      <footer className="border-t border-[var(--landing-border)] bg-[var(--landing-footer-bg)]">

        <div className={cn(shell, "flex flex-col gap-10 py-10 md:flex-row md:items-start md:justify-between")}>

          <div className="max-w-sm">

            <Image

              src="/images/landing/logo-white.png"

              alt="joballa"

              width={129}

              height={32}

              className="h-8 w-auto"

            />

            <p className="mt-4 text-sm leading-5 text-[var(--landing-fg-secondary)]">{t("footer.tagline")}</p>

          </div>

          <div className="flex gap-8 sm:gap-12">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--landing-fg)]">{t("footer.usersTitle")}</p>

              <ul className="mt-4 space-y-2 text-base text-[var(--landing-fg-secondary)]">

                <li>

                  <Link href="/sign-up/role" className="transition hover:text-[var(--landing-fg)]">

                    {t("nav.forWorkers")}

                  </Link>

                </li>

                <li>

                  <Link href="/sign-up/role" className="transition hover:text-[var(--landing-fg)]">

                    {t("nav.forEmployers")}

                  </Link>

                </li>

              </ul>

            </div>

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--landing-fg)]">{t("footer.companyTitle")}</p>

              <ul className="mt-4 space-y-2 text-base text-[var(--landing-fg-secondary)]">

                <li>

                  <Link href="/sign-up/role" className="transition hover:text-[var(--landing-fg)]">

                    {t("footer.terms")}

                  </Link>

                </li>

                <li>

                  <Link href="/sign-up/role" className="transition hover:text-[var(--landing-fg)]">

                    {t("footer.privacy")}

                  </Link>

                </li>

                <li>

                  <Link href="/sign-up/role" className="transition hover:text-[var(--landing-fg)]">

                    {t("footer.contact")}

                  </Link>

                </li>

              </ul>

            </div>

          </div>

        </div>

        <div className={cn(shell, "flex flex-wrap items-center justify-between gap-4 border-t border-[rgba(62,73,73,0.3)] py-6")}>

          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[rgba(190,201,201,0.6)]">

            {t("footer.copyright", { year })}

          </p>

          <div className="flex gap-4 text-xs font-semibold uppercase tracking-[0.06em] text-[rgba(190,201,201,0.6)]">

            <a href="https://www.linkedin.com" className="transition hover:text-[var(--landing-fg-secondary)]" target="_blank" rel="noreferrer">

              {t("footer.linkedin")}

            </a>

            <a href="https://www.facebook.com" className="transition hover:text-[var(--landing-fg-secondary)]" target="_blank" rel="noreferrer">

              {t("footer.facebook")}

            </a>

          </div>

        </div>

      </footer>

    </div>

  );

}

