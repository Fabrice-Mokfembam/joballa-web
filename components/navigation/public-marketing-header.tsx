"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { JoballaAuthNavLogo } from "@/components/brand/joballa-auth-nav-logo";
import { LocaleSwitcher } from "@/components/navigation/locale-switcher";
import { authOutlineButtonClassName, authPrimaryButtonClassName } from "@/lib/auth-ui";
import { cn } from "@/lib/utils";

type Surface = "marketing" | "auth";

const navKeys = ["findJobs", "forEmployers", "resources", "about"] as const;
const navHrefs = ["/sign-up/role", "/sign-up/role", "/sign-up/role", "/"] as const;

export function PublicMarketingHeader({ surface }: { surface: Surface }) {
  const t = useTranslations("public");
  const isAuth = surface === "auth";
  const [menuOpen, setMenuOpen] = useState(false);

  const ghostNavMarketing =
    "rounded-xl px-4 py-2 text-sm font-remixa font-medium text-[var(--joballa-muted)] transition hover:bg-[var(--joballa-row-hover)] hover:text-[var(--joballa-fg)]";

  const ghostNavAuth =
    "rounded-xl px-4 py-2 text-sm font-remixa font-medium text-[color:var(--auth-fg-muted)] transition hover:bg-[color:var(--auth-outline-hover)] hover:text-[color:var(--auth-fg)]";

  const drawerNavMarketing =
    "block rounded-xl px-3 py-3 text-base font-remixa font-medium text-[var(--joballa-fg)] transition hover:bg-[var(--joballa-row-hover)]";

  const drawerNavAuth =
    "block rounded-xl px-3 py-3 text-base font-remixa font-medium text-[color:var(--auth-fg)] transition hover:bg-[color:var(--auth-outline-hover)]";

  const navBtnBase =
    "inline-flex h-11 min-w-[120px] items-center justify-center rounded-full px-6 text-sm font-remixa font-medium transition";

  const ghostHeaderBtnMarketing = cn(
    navBtnBase,
    "border border-[var(--joballa-border)] bg-transparent text-[var(--joballa-fg)] hover:bg-[var(--joballa-row-hover)]",
  );

  const ghostHeaderBtnAuth = cn(authOutlineButtonClassName, navBtnBase, "w-auto shadow-none");

  const primaryCtaAuth = cn(authPrimaryButtonClassName, navBtnBase, "w-auto");

  const primaryCtaMarketing = cn(
    authPrimaryButtonClassName,
    navBtnBase,
    "bg-[var(--joballa-primary)] text-white",
  );

  const drawerBtnOutlineMarketing = cn(
    ghostHeaderBtnMarketing,
    "h-12 w-full min-w-0",
  );

  const drawerBtnPrimaryMarketing = cn(primaryCtaMarketing, "h-12 w-full min-w-0");

  const drawerBtnOutlineAuth = cn(ghostHeaderBtnAuth, "h-12 w-full min-w-0");

  const drawerBtnPrimaryAuth = cn(primaryCtaAuth, "h-12 w-full min-w-0");

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  const navLinkClass = isAuth ? ghostNavAuth : ghostNavMarketing;
  const drawerNavClass = isAuth ? drawerNavAuth : drawerNavMarketing;

  return (
    <>
      <header className="flex w-full items-center justify-between gap-3">
        <JoballaAuthNavLogo variant={isAuth ? "auth" : "marketing"} />

        <nav
          className="hidden flex-1 flex-nowrap items-center justify-center gap-1 lg:flex"
          aria-label={t("nav.navAria")}
        >
          {navKeys.map((key, i) => (
            <Link key={key} href={navHrefs[i]} className={navLinkClass}>
              {t(`nav.${key}`)}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 sm:gap-3 lg:flex">
          <LocaleSwitcher variant={isAuth ? "light" : "dark"} />
          <Link href="/sign-in" className={isAuth ? ghostHeaderBtnAuth : ghostHeaderBtnMarketing}>
            {t("nav.logIn")}
          </Link>
          <Link href="/sign-up/role" className={isAuth ? primaryCtaAuth : primaryCtaMarketing}>
            {t("nav.signUp")}
          </Link>
        </div>

        <button
          type="button"
          className={cn(
            "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl transition lg:hidden",
            isAuth
              ? "text-[color:var(--auth-fg)] hover:bg-[color:var(--auth-outline-hover)]"
              : "text-[var(--joballa-fg)] hover:bg-[var(--joballa-row-hover)]",
          )}
          aria-expanded={menuOpen}
          aria-controls="marketing-mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="size-6" aria-hidden strokeWidth={2} /> : <Menu className="size-6" aria-hidden strokeWidth={2} />}
          <span className="sr-only">{menuOpen ? t("nav.menuClose") : t("nav.menuOpen")}</span>
        </button>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-[100] overflow-hidden lg:hidden transition-opacity duration-300 ease-out",
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        role="presentation"
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className="absolute inset-0 h-dvh w-full cursor-pointer bg-black/55 backdrop-blur-[2px]"
          aria-label={t("nav.menuClose")}
          tabIndex={menuOpen ? 0 : -1}
          onClick={closeMenu}
        />
        <aside
          id="marketing-mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-hidden={!menuOpen}
          aria-label={t("nav.menuTitle")}
          className={cn(
            "fixed right-0 top-0 flex h-dvh w-[min(100%,20rem)] flex-col border-l shadow-2xl transition-transform duration-300 ease-out",
            menuOpen ? "translate-x-0" : "translate-x-full",
            isAuth
              ? "border-[color:var(--auth-border)] bg-[color:var(--auth-page-bg)]"
              : "border-[var(--joballa-border)] bg-[var(--joballa-page)]",
          )}
        >
            <div
              className={cn(
                "flex items-center justify-between border-b px-4 py-4",
                isAuth ? "border-[color:var(--auth-border)]" : "border-[var(--joballa-border)]",
              )}
            >
              <JoballaAuthNavLogo variant={isAuth ? "auth" : "marketing"} />
              <button
                type="button"
                className={cn(
                  "inline-flex size-10 cursor-pointer items-center justify-center rounded-xl transition",
                  isAuth
                    ? "text-[color:var(--auth-fg)] hover:bg-[color:var(--auth-outline-hover)]"
                    : "text-[var(--joballa-fg)] hover:bg-[var(--joballa-row-hover)]",
                )}
                onClick={closeMenu}
              >
                <X className="size-5" aria-hidden strokeWidth={2} />
                <span className="sr-only">{t("nav.menuClose")}</span>
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-4" aria-label={t("nav.navAria")}>
              {navKeys.map((key, i) => (
                <Link key={key} href={navHrefs[i]} className={drawerNavClass} onClick={closeMenu}>
                  {t(`nav.${key}`)}
                </Link>
              ))}
            </nav>

            <div
              className={cn(
                "flex flex-col gap-3 border-t px-4 py-5",
                isAuth ? "border-[color:var(--auth-border)]" : "border-[var(--joballa-border)]",
              )}
            >
              <div className="w-full [&_button]:w-full [&_button]:justify-between">
                <LocaleSwitcher variant={isAuth ? "light" : "dark"} className="w-full" />
              </div>
              <Link
                href="/sign-in"
                className={isAuth ? drawerBtnOutlineAuth : drawerBtnOutlineMarketing}
                onClick={closeMenu}
              >
                {t("nav.logIn")}
              </Link>
              <Link
                href="/sign-up/role"
                className={isAuth ? drawerBtnPrimaryAuth : drawerBtnPrimaryMarketing}
                onClick={closeMenu}
              >
                {t("nav.signUp")}
              </Link>
            </div>
          </aside>
      </div>
    </>
  );
}
