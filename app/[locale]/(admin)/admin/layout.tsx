import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { PortalRequireAuth } from "@/components/auth/portal-require-auth";
import { AppShell } from "@/components/layout/app-shell";
import { ADMIN_PORTAL_ROLES } from "@/lib/auth/protected-portal-roles";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations("admin");

  return (
    <PortalRequireAuth allowedRoles={ADMIN_PORTAL_ROLES}>
      <AppShell
        brand={t("brand")}
        title={t("shell.title")}
        subtitle={t("shell.subtitle")}
        utilityLabel={t("shell.utility")}
        navItems={[
          { href: "/admin", label: t("nav.dashboard") },
          { href: "/admin/users", label: t("nav.users") },
          { href: "/admin/jobs", label: t("nav.jobs") },
          { href: "/admin/disputes", label: t("nav.disputes") },
          { href: "/admin/departments", label: t("nav.departments") },
          { href: "/admin/reports", label: t("nav.reports") },
          { href: "/admin/settings", label: t("nav.settings") },
        ]}
      >
        {children}
      </AppShell>
    </PortalRequireAuth>
  );
}
