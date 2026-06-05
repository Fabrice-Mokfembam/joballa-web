import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { PublicMarketingHeader } from "@/components/navigation/public-marketing-header";
import { cn } from "@/lib/utils";

const landingShell = "mx-auto w-full max-w-[1440px]";

const heroPrimaryBtn =
  "inline-flex h-14 w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-[var(--joballa-primary)] px-10 text-base font-semibold text-white shadow-[0_4px_14px_rgba(13,115,119,0.35)] transition hover:opacity-[0.96] focus:outline-none focus:ring-2 focus:ring-[var(--joballa-primary)]/40 sm:w-auto sm:min-w-[220px]";

const heroOutlineBtn =
  "inline-flex h-14 w-full cursor-pointer items-center justify-center gap-2.5 rounded-full border border-[var(--joballa-border)] bg-transparent px-10 text-base font-semibold text-[var(--joballa-fg)] transition hover:bg-[var(--joballa-row-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--joballa-border)] sm:w-auto sm:min-w-[220px]";

function IconSearch({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconBriefcase({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 7V6a4 4 0 0 1 8 0v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconLock({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export async function LandingPage() {
  const t = await getTranslations("public");

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-[var(--joballa-page)] text-[var(--joballa-fg)] antialiased">
      <header className="sticky top-0 z-50 border-b border-[var(--joballa-border)] bg-[var(--joballa-page)]/90 backdrop-blur-md">
        <div className={cn(landingShell, "px-6 py-4 md:px-8 lg:px-10")}>
          <PublicMarketingHeader surface="marketing" />
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="flex flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-14 lg:px-10 lg:py-16">
          <div className={cn(landingShell, "flex flex-col items-center text-center")}>
            <div className="flex max-w-3xl flex-col items-center gap-4 sm:gap-5">
              <h1 className="text-3xl font-extrabold sm:text-4xl leading-[1.1] tracking-tight text-[var(--joballa-fg)] md:text-5xl lg:text-[3.25rem]">
                {t("hero.title")}
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-[var(--joballa-muted)] md:text-lg">
                {t("hero.description")}
              </p>
            </div>

            <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
              <Link href="/sign-up/role" className={heroPrimaryBtn}>
                <IconSearch className="size-5 shrink-0 opacity-95" />
                {t("hero.findJobsCta")}
              </Link>
              <Link href="/sign-up/role" className={heroOutlineBtn}>
                <IconBriefcase className="size-5 shrink-0 opacity-90" />
                {t("hero.hireTalentCta")}
              </Link>
            </div>

            <div className="mt-10 w-full md:mt-12">
              <Image
                src="/images/landing/hero.png"
                alt={t("hero.imageAlt")}
                width={1024}
                height={683}
                priority
                className="h-auto w-full rounded-3xl"
                sizes="(max-width: 1440px) 100vw, 1440px"
              />
            </div>

            <p className="mt-8 flex items-center justify-center gap-2 text-sm text-[var(--joballa-muted)] md:mt-10">
              <IconLock className="shrink-0 opacity-70" />
              {t("hero.trustLine")}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
