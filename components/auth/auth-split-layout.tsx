import type { ReactNode } from "react";
import { AuthBrandAside } from "@/components/auth/auth-brand-aside";

type AuthSplitLayoutProps = {
  children: ReactNode;
  /** Desktop-only chrome (e.g. locale switcher). Hidden below `lg`. */
  topBar?: ReactNode;
};

export async function AuthSplitLayout({ children, topBar }: AuthSplitLayoutProps) {
  return (
    <div className="joballa-auth-root flex min-h-screen flex-col bg-[color:var(--auth-shell-bg)] text-[color:var(--auth-fg)] lg:flex-row">
      <div className="order-1 flex min-h-0 flex-1 flex-col bg-[color:var(--auth-page-bg)] lg:order-1">
        {topBar ? (
          <div className="hidden w-full shrink-0 flex-wrap items-center gap-4 px-6 pb-2 pt-6 lg:flex lg:px-10 lg:pt-8">
            {topBar}
          </div>
        ) : null}
        <div className="flex flex-1 flex-col justify-center px-6 py-8 lg:px-[clamp(2rem,11vw,7rem)] lg:py-12 xl:px-24">
          <div className="mx-auto flex w-full max-w-lg flex-col gap-[22px]">{children}</div>
        </div>
      </div>
      <AuthBrandAside />
    </div>
  );
}
