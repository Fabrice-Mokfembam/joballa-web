import type { ReactNode } from "react";
import { JoballaPanelLogoMark } from "@/components/brand/joballa-panel-logo-mark";
import { Link } from "@/lib/i18n/navigation";
import { LogoutButton } from "@/components/auth/logout-button";

type NavItem = {
  href: string;
  label: string;
};

type AppShellProps = {
  brand: string;
  title: string;
  subtitle: string;
  navItems: NavItem[];
  utilityLabel: string;
  children: ReactNode;
};

export function AppShell({
  brand,
  title,
  subtitle,
  navItems,
  utilityLabel,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(28,131,106,0.18),_transparent_34%),linear-gradient(180deg,_#f7faf8_0%,_#eef3ef_45%,_#e7ece8_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6">
        <aside className="flex w-full flex-col rounded-[32px] border border-slate-200 bg-slate-950 px-6 py-7 text-white shadow-[0_24px_80px_rgba(15,23,42,0.26)] lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:w-72">
          <div className="shrink-0">
            <div className="flex items-start gap-3">
              <JoballaPanelLogoMark size={44} className="size-11 shadow-sm ring-1 ring-white/10" />
              <div className="min-w-0 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300/80">{brand}</p>
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                <p className="max-w-xs text-sm leading-6 text-slate-300">{subtitle}</p>
              </div>
            </div>
          </div>

          <nav className="mt-8 grid min-h-0 flex-1 gap-2 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-emerald-300/30 hover:bg-white/[0.08] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-6 shrink-0 space-y-4">
            <LogoutButton />
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4 text-sm text-slate-300">
              {utilityLabel}
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <main className="min-h-full rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_70px_rgba(15,23,42,0.08)] backdrop-blur md:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
