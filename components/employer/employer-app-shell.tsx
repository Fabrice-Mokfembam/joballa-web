"use client";

import Image from "next/image";
import type { ReactElement, ReactNode } from "react";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { JoballaPanelLogoMark } from "@/components/brand/joballa-panel-logo-mark";
import {
  IconBell,
  IconBookOpen,
  IconBriefcase,
  IconChevronDown,
  IconDashboard,
  IconMoney,
  IconSettings,
  IconUser,
} from "@/components/worker/icons";
import { AuthSessionLoadingScreen } from "@/components/auth/auth-session-loading-screen";
import { useEmployerMe } from "@/features/employer/hooks";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  portalIconButtonClass,
  portalNavLinkClass,
  portalProfileChevronClass,
  portalProfileNameClass,
  portalProfileSummaryClass,
} from "@/components/portal/portal-ui";
import { cn } from "@/lib/utils";

type NavKey = "dashboard" | "jobs" | "applicants" | "workforce" | "payroll";

const TOP_NAV: { href: string; key: NavKey }[] = [
  { href: "/employer", key: "dashboard" },
  { href: "/employer/jobs", key: "jobs" },
  { href: "/employer/applicants", key: "applicants" },
  { href: "/employer/workforce", key: "workforce" },
  { href: "/employer/payroll", key: "payroll" },
];

const BOTTOM_LABEL: Record<NavKey, "tabDashboard" | "tabJobs" | "tabApplicants" | "tabWorkforce" | "tabPayroll"> = {
  dashboard: "tabDashboard",
  jobs: "tabJobs",
  applicants: "tabApplicants",
  workforce: "tabWorkforce",
  payroll: "tabPayroll",
};

const BOTTOM_TAB_ICONS: Record<NavKey, (props: { className?: string }) => ReactElement> = {
  dashboard: (p) => <IconDashboard {...p} />,
  jobs: (p) => <IconBriefcase {...p} />,
  applicants: (p) => <IconBookOpen {...p} />,
  workforce: (p) => <IconUser {...p} />,
  payroll: (p) => <IconMoney {...p} />,
};

function isNavActive(pathname: string, href: string) {
  if (href === "/employer") {
    return pathname === "/employer" || pathname === "/employer/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function employerMobileHeaderTitle(pathname: string, ts: (key: string) => string, tNav: (key: string) => string): string | null {
  if (pathname.includes("/employer/profile")) return tNav("profile");
  if (pathname.includes("/employer/settings")) return tNav("settings");
  if (isNavActive(pathname, "/employer/payroll")) return ts("tabPayroll");
  if (isNavActive(pathname, "/employer/workforce")) return ts("tabWorkforce");
  if (isNavActive(pathname, "/employer/applicants")) return ts("tabApplicants");
  if (isNavActive(pathname, "/employer/jobs")) return ts("tabJobs");
  if (isNavActive(pathname, "/employer")) return ts("tabDashboard");
  return null;
}

function EmployerAvatar({ name, url }: { name: string; url?: string | null }) {
  if (url) {
    return (
      <span className="relative flex size-8 shrink-0 overflow-hidden rounded-full border border-[var(--joballa-border)] bg-[var(--joballa-tag-bg)] sm:size-9">
        <Image src={url} alt="" fill className="object-cover" sizes="36px" unoptimized={url.startsWith("http")} />
      </span>
    );
  }
  const initial = (name.trim().charAt(0) || "J").toUpperCase();
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[var(--joballa-border)] bg-[var(--joballa-primary)] text-xs font-bold text-white sm:size-9">
      {initial}
    </span>
  );
}

export function EmployerAppShell({ children }: { children: ReactNode }) {
  const portalGateReady = useAuthStore((s) => s.portalGateReady);
  const pathname = usePathname();
  const t = useTranslations("employer.nav");
  const ts = useTranslations("employer.shell");
  const menuRef = useRef<HTMLDetailsElement>(null);
  const me = useEmployerMe();
  const companyDisplayName = me.data?.company?.name ?? me.data?.firstName ?? ts("companyFallback");
  const avatarUrl = me.data?.avatar ?? me.data?.company?.logo ?? null;
  const mobileHeaderTitle = employerMobileHeaderTitle(pathname, ts, t);

  function closeUserMenu() {
    menuRef.current?.removeAttribute("open");
  }

  useEffect(() => {
    function onDocumentMouseDown(event: MouseEvent) {
      const menu = menuRef.current;
      if (!menu?.open) return;
      if (!menu.contains(event.target as Node)) {
        menu.removeAttribute("open");
      }
    }

    function onDocumentKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") menuRef.current?.removeAttribute("open");
    }

    document.addEventListener("mousedown", onDocumentMouseDown);
    document.addEventListener("keydown", onDocumentKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocumentMouseDown);
      document.removeEventListener("keydown", onDocumentKeyDown);
    };
  }, []);

  if (!portalGateReady) {
    return <AuthSessionLoadingScreen />;
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[var(--joballa-page)] text-[var(--joballa-fg)]">
      <header className="sticky top-0 z-50 border-b border-[var(--joballa-border)] bg-[var(--joballa-header)] shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="mx-auto flex h-14 min-h-14 w-full max-w-[1440px] items-center gap-2 px-4 sm:h-16 sm:min-h-16 sm:gap-3 sm:px-6 md:px-8 lg:px-10">
          <Link
            href="/employer"
            className="flex min-w-0 shrink-0 items-center gap-2 rounded-lg outline-none ring-[var(--joballa-primary)] focus-visible:ring-2 sm:gap-2.5 max-[599px]:gap-1.5"
          >
            <JoballaPanelLogoMark size={40} alt="" className="size-9 shrink-0 sm:size-10" />
            {mobileHeaderTitle ? (
              <span className="truncate text-base font-bold tracking-tight text-[var(--joballa-nav-fg)] min-[600px]:hidden">
                {mobileHeaderTitle}
              </span>
            ) : null}
            <span className="truncate text-base font-bold tracking-tight text-[var(--joballa-nav-fg)] max-[599px]:hidden sm:text-lg">
              joballa
            </span>
          </Link>

          <div className="hidden min-w-0 flex-1 min-[600px]:flex">
            <nav
              className="mx-auto hidden min-w-0 flex-1 items-stretch justify-center gap-0 overflow-x-auto md:flex"
              aria-label={ts("mainNav")}
            >
              {TOP_NAV.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex min-h-14 shrink-0 flex-col justify-end rounded-lg px-2.5 pb-0 pt-1 text-[14px] font-medium sm:min-h-16 md:px-3 lg:px-5 lg:text-[15px]",
                      portalNavLinkClass(active),
                    )}
                  >
                    <span className="relative z-10 pb-2.5 sm:pb-3">{t(item.key)}</span>
                    {active ? (
                      <span
                        className="pointer-events-none absolute bottom-0 left-1/2 h-1 w-12 max-w-[3.25rem] -translate-x-1/2 rounded-full bg-[var(--joballa-primary)] sm:w-[3.25rem]"
                        aria-hidden
                      />
                    ) : null}
                  </Link>
                );
              })}
            </nav>

            <nav className="flex min-w-0 flex-1 justify-start gap-0 overflow-x-auto md:hidden" aria-label={ts("mainNav")}>
              {TOP_NAV.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex shrink-0 flex-col items-center whitespace-nowrap px-2 pb-1 pt-1.5 text-[11px] font-medium sm:px-2.5 sm:pt-2 sm:text-xs",
                      portalNavLinkClass(active),
                    )}
                  >
                    <span className="relative z-10 pb-1 sm:pb-1.5">{t(item.key)}</span>
                    {active ? (
                      <span className="pointer-events-none h-0.5 w-7 rounded-full bg-[var(--joballa-primary)] sm:w-8" aria-hidden />
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
            <Link
              href="/employer/notifications"
              className={cn("relative hidden shrink-0 min-[600px]:block", portalIconButtonClass)}
              aria-label={ts("notifications")}
            >
              <IconBell className="size-[18px]" />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[var(--joballa-primary)] ring-2 ring-[var(--joballa-header)]" />
            </Link>

            <details ref={menuRef} className="relative shrink-0">
              <summary className={portalProfileSummaryClass} aria-label={companyDisplayName}>
                <EmployerAvatar name={companyDisplayName} url={avatarUrl} />
                <span className={portalProfileNameClass}>{companyDisplayName}</span>
                <IconChevronDown className={portalProfileChevronClass} />
              </summary>
              <div
                className="absolute right-0 z-50 mt-1.5 min-w-[200px] overflow-hidden rounded-xl border border-[var(--joballa-border)] bg-[var(--joballa-dropdown-bg)] py-1 shadow-lg"
                role="menu"
              >
                <Link
                  href="/employer/profile"
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--joballa-fg)] hover:bg-[var(--joballa-row-hover)]"
                  role="menuitem"
                  onClick={closeUserMenu}
                >
                  <IconUser className="size-4 text-[var(--joballa-muted)]" />
                  {t("profile")}
                </Link>
                <Link
                  href="/employer/settings"
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--joballa-fg)] hover:bg-[var(--joballa-row-hover)]"
                  role="menuitem"
                  onClick={closeUserMenu}
                >
                  <IconSettings className="size-4 text-[var(--joballa-muted)]" />
                  {t("settings")}
                </Link>
              </div>
            </details>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full min-w-0 max-w-[1440px] flex-1 flex-col px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] pt-3 min-[600px]:px-6 min-[600px]:pb-5 min-[600px]:pt-4 md:px-8 md:pb-6 lg:px-10">
        {children}
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex min-[600px]:hidden border-t border-[var(--joballa-border)] bg-[var(--joballa-header)] pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
        aria-label={ts("bottomNav")}
      >
        <div className="mx-auto flex min-h-[56px] w-full max-w-[1440px] items-stretch px-0.5 sm:px-1">
          {TOP_NAV.map((item) => {
            const active = isNavActive(pathname, item.href);
            const Icon = BOTTOM_TAB_ICONS[item.key];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-t-lg px-0.5 py-1.5 text-[10px] font-medium leading-tight transition-colors touch-manipulation sm:text-[11px]",
                  active ? "text-[var(--joballa-primary)]" : "text-[var(--joballa-nav-fg-muted)] active:bg-[var(--joballa-nav-hover)]",
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center",
                    active ? "text-[var(--joballa-primary)]" : "text-[var(--joballa-nav-fg-muted)]",
                  )}
                >
                  <Icon className="size-6" />
                </span>
                <span className="line-clamp-2 w-full max-w-[4.5rem] text-center leading-tight sm:max-w-[5.5rem]">
                  {ts(BOTTOM_LABEL[item.key])}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
