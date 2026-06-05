"use client";

import Image from "next/image";
import type { ReactNode, ReactElement } from "react";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { JoballaPanelLogoMark } from "@/components/brand/joballa-panel-logo-mark";
import {
  IconApplicationsNav,
  IconBell,
  IconBookmark,
  IconBriefcase,
  IconChevronDown,
  IconDashboard,
  IconMoney,
  IconSettings,
  IconUser,
} from "@/components/worker/icons";
import { useWorkerMe } from "@/features/worker/hooks";
import { portalIconButtonClass, portalNavLinkClass, portalProfileSummaryClass } from "@/components/portal/portal-ui";
import { cn } from "@/lib/utils";

type NavKey = "dashboard" | "jobs" | "applications" | "saved" | "earnings";

const TOP_NAV: { href: string; key: NavKey }[] = [
  { href: "/worker/jobs", key: "jobs" },
  { href: "/worker/dashboard", key: "dashboard" },
  { href: "/worker/applications", key: "applications" },
  { href: "/worker/saved-jobs", key: "saved" },
  { href: "/worker/earnings", key: "earnings" },
];

const BOTTOM_LABEL: Record<NavKey, "tabDashboard" | "tabJobs" | "tabApplications" | "tabSaved" | "tabEarnings"> = {
  dashboard: "tabDashboard",
  jobs: "tabJobs",
  applications: "tabApplications",
  saved: "tabSaved",
  earnings: "tabEarnings",
};

const BOTTOM_TAB_ICONS: Record<NavKey, (props: { className?: string }) => ReactElement> = {
  dashboard: (p) => <IconDashboard {...p} />,
  jobs: (p) => <IconBriefcase {...p} />,
  applications: (p) => <IconApplicationsNav {...p} />,
  saved: (p) => <IconBookmark {...p} />,
  earnings: (p) => <IconMoney {...p} />,
};

function isNavActive(pathname: string, href: string) {
  if (href === "/worker/dashboard") {
    return pathname === "/worker/dashboard" || pathname.endsWith("/worker/dashboard");
  }
  if (href === "/worker/jobs") {
    return pathname === "/worker/jobs" || pathname.startsWith("/worker/jobs/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function workerMobileHeaderTitle(pathname: string, ts: (key: string) => string, tNav: (key: string) => string): string | null {
  if (pathname.includes("/worker/notifications")) return ts("notifications");
  if (pathname.includes("/worker/settings")) return tNav("settings");
  if (pathname.includes("/worker/engagements")) return ts("engagements");
  if (pathname.includes("/worker/profile")) return tNav("profile");
  if (isNavActive(pathname, "/worker/earnings")) return ts("tabEarnings");
  if (isNavActive(pathname, "/worker/saved-jobs")) return ts("tabSaved");
  if (isNavActive(pathname, "/worker/applications")) return ts("tabApplications");
  if (isNavActive(pathname, "/worker/jobs")) return ts("tabJobs");
  if (isNavActive(pathname, "/worker/dashboard")) return ts("tabDashboard");
  return null;
}

export function WorkerAppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations("worker.nav");
  const ts = useTranslations("worker.shell");
  const menuRef = useRef<HTMLDetailsElement>(null);
  const mobileHeaderTitle = workerMobileHeaderTitle(pathname, ts, t);
  const meQuery = useWorkerMe();
  const wp = meQuery.data?.workerProfile;
  const userDisplayName = wp?.fullName?.trim() || meQuery.data?.email || "";
  const userAvatarUrl = wp?.avatarUrl ?? null;
  const userInitial = (userDisplayName || "?").charAt(0).toUpperCase();

  function closeUserMenu() {
    menuRef.current?.removeAttribute("open");
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[var(--joballa-page)] text-[var(--joballa-fg)]">
      <header className="sticky top-0 z-50 border-b border-[var(--joballa-border)] bg-[var(--joballa-header)] shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="mx-auto flex h-14 min-h-14 w-full max-w-[1440px] items-center gap-2 px-4 sm:h-16 sm:min-h-16 sm:gap-3 sm:px-6 md:px-8 lg:px-10">
          <Link
            href="/worker/jobs"
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

            <nav
              className="flex min-w-0 flex-1 justify-start gap-0 overflow-x-auto md:hidden"
              aria-label={ts("mainNav")}
            >
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
                      <span
                        className="pointer-events-none h-0.5 w-7 rounded-full bg-[var(--joballa-primary)] sm:w-8"
                        aria-hidden
                      />
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div
            className={cn(
              "flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3",
              "ml-auto",
            )}
          >
            <Link
              href="/worker/notifications"
              className={cn("relative shrink-0", portalIconButtonClass)}
              aria-label={ts("notifications")}
            >
              <IconBell className="size-[18px]" />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[var(--joballa-primary)] ring-2 ring-white" />
            </Link>

            <details ref={menuRef} className="relative shrink-0">
              <summary className={portalProfileSummaryClass}>
                <span className="relative flex size-8 shrink-0 overflow-hidden rounded-full border border-[var(--joballa-border)] bg-[var(--joballa-tag-bg)] sm:size-9">
                  {userAvatarUrl ? (
                    <Image src={userAvatarUrl} alt="" fill className="object-cover" sizes="36px" unoptimized />
                  ) : (
                    <span className="flex size-full items-center justify-center text-sm font-bold text-[var(--joballa-muted)]">
                      {userInitial}
                    </span>
                  )}
                </span>
                {userDisplayName ? (
                  <span className="hidden max-w-[120px] truncate text-sm font-semibold text-[var(--joballa-nav-fg)] sm:max-w-[140px] lg:inline">
                    {userDisplayName}
                  </span>
                ) : null}
                <IconChevronDown className="size-3 shrink-0 text-[var(--joballa-nav-fg-muted)] sm:size-3.5" />
              </summary>
              <div
                className="absolute right-0 z-50 mt-1.5 min-w-[200px] overflow-hidden rounded-xl border border-[var(--joballa-border)] bg-[var(--joballa-dropdown-bg)] py-1 shadow-lg"
                role="menu"
              >
                <Link
                  href="/worker/profile"
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--joballa-fg)] hover:bg-[var(--joballa-row-hover)]"
                  role="menuitem"
                  onClick={closeUserMenu}
                >
                  <IconUser className="size-4 text-[var(--joballa-muted)]" />
                  {t("profile")}
                </Link>
                <Link
                  href="/worker/settings"
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
                <span className={cn("flex items-center justify-center", active ? "text-[var(--joballa-primary)]" : "text-neutral-500")}>
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
