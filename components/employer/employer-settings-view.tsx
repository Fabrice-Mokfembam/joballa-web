"use client";

import {
  Bell,
  Building2,
  Globe2,
  LogOut,
  Mail,
  MessageSquare,
  Palette,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { LocaleSwitcher } from "@/components/navigation/locale-switcher";
import { useJoballaTheme } from "@/components/providers/joballa-theme-provider";
import {
  SettingsActionLink,
  SettingsIcon,
  SettingsSectionHeader,
  SettingsSelectControl,
  SettingsToggleRow,
} from "@/components/settings/portal-settings-ui";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useEmployerNotificationSettings,
  usePatchEmployerNotificationSettings,
} from "@/features/employer/hooks";
import { useRouter } from "@/lib/i18n/navigation";
import { signOut } from "@/lib/auth/session-lifecycle";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { JoballaThemeChoice } from "@/lib/theme/joballa-theme";
import { cn } from "@/lib/utils";

export function EmployerSettingsView() {
  const t = useTranslations("employer.settings");
  const tc = useTranslations("common.confirm");
  const router = useRouter();
  const qc = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { theme, setTheme } = useJoballaTheme();
  const notificationSettingsQuery = useEmployerNotificationSettings();
  const patchNotificationSettings = usePatchEmployerNotificationSettings();
  const notificationSettings = notificationSettingsQuery.data;
  const [signingOut, setSigningOut] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);

  async function logout() {
    setSigningOut(true);
    try {
      await signOut({ router, queryClient: qc, accessToken });
      setSignOutOpen(false);
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-6 bg-[var(--joballa-page-tint)] text-sm">
      <header>
        <h1 className="text-2xl font-bold leading-8 text-[var(--joballa-fg)]">{t("pageTitle")}</h1>
        <p className="mt-2 text-sm font-medium leading-6 text-[var(--joballa-muted)]">{t("pageDescription")}</p>
      </header>

      <section className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:p-6">
        <SettingsSectionHeader
          icon={<Bell className="size-6" aria-hidden strokeWidth={1.8} />}
          title={t("notifications.title")}
          description={t("notifications.description")}
        />
        <SettingsToggleRow
          icon={<Smartphone className="size-6" aria-hidden strokeWidth={1.8} />}
          title={t("notifications.push.title")}
          description={t("notifications.push.description")}
          enabled={notificationSettings?.pushEnabled}
          onChange={(enabled) => patchNotificationSettings.mutate({ ...notificationSettings, pushEnabled: enabled })}
          disabled={patchNotificationSettings.isPending}
        />
        <SettingsToggleRow
          icon={<Mail className="size-6" aria-hidden strokeWidth={1.8} />}
          title={t("notifications.email.title")}
          description={t("notifications.email.description")}
          enabled={notificationSettings?.emailEnabled ?? true}
          onChange={(enabled) => patchNotificationSettings.mutate({ ...notificationSettings, emailEnabled: enabled })}
          disabled={patchNotificationSettings.isPending}
        />
        <SettingsToggleRow
          icon={<Users className="size-6" aria-hidden strokeWidth={1.8} />}
          title={t("notifications.applicants.title")}
          description={t("notifications.applicants.description")}
          enabled={notificationSettings?.applicantsEnabled ?? true}
          onChange={(enabled) => patchNotificationSettings.mutate({ ...notificationSettings, applicantsEnabled: enabled })}
          disabled={patchNotificationSettings.isPending}
        />
        <SettingsToggleRow
          icon={<MessageSquare className="size-6" aria-hidden strokeWidth={1.8} />}
          title={t("notifications.messages.title")}
          description={t("notifications.messages.description")}
          enabled={notificationSettings?.messagesEnabled ?? false}
          onChange={(enabled) => patchNotificationSettings.mutate({ ...notificationSettings, messagesEnabled: enabled })}
          disabled={patchNotificationSettings.isPending}
        />
      </section>

      <section className="grid gap-4 rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:grid-cols-[48px_minmax(0,1fr)_minmax(14rem,17rem)] sm:items-center sm:p-6">
        <SettingsIcon>
          <Globe2 className="size-6" aria-hidden strokeWidth={1.8} />
        </SettingsIcon>
        <div className="min-w-0">
          <h2 className="text-lg font-bold leading-7 text-[var(--joballa-fg)]">{t("language.title")}</h2>
          <p className="mt-1 text-sm leading-5 text-[var(--joballa-muted)]">{t("language.description")}</p>
        </div>
        <LocaleSwitcher variant="light" align="end" className="w-full [&>button]:w-full [&>button]:justify-between [&>button]:rounded-[8px]" />
      </section>

      <section className="grid gap-4 rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:grid-cols-[48px_minmax(0,1fr)_minmax(14rem,17rem)] sm:items-center sm:p-6">
        <SettingsIcon>
          <Palette className="size-6" aria-hidden strokeWidth={1.8} />
        </SettingsIcon>
        <div className="min-w-0">
          <h2 className="text-lg font-bold leading-7 text-[var(--joballa-fg)]">{t("appearance.title")}</h2>
          <p className="mt-1 text-sm leading-5 text-[var(--joballa-muted)]">{t("appearance.description")}</p>
        </div>
        <SettingsSelectControl
          label={t("appearance.controlLabel")}
          value={theme}
          onChange={(value) => setTheme(value as JoballaThemeChoice)}
          options={[
            { value: "system", label: t("appearance.options.system") },
            { value: "light", label: t("appearance.options.light") },
            { value: "dark", label: t("appearance.options.dark") },
          ]}
        />
      </section>

      <section className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:p-6">
        <SettingsSectionHeader
          icon={<ShieldCheck className="size-6" aria-hidden strokeWidth={1.8} />}
          title={t("account.title")}
          description={t("account.description")}
        />
        <SettingsActionLink
          href="/employer/profile"
          icon={<Building2 className="size-6" aria-hidden strokeWidth={1.8} />}
          title={t("account.profile.title")}
          description={t("account.profile.description")}
        />
        <div className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-4 border-t border-[var(--joballa-border)] pt-5">
          <SettingsIcon>
            <LogOut className="size-6" aria-hidden strokeWidth={1.8} />
          </SettingsIcon>
          <div className="min-w-0">
            <h3 className="text-sm font-bold leading-6 text-[var(--joballa-fg)]">{t("account.signOut.title")}</h3>
            <p className="mt-0.5 text-sm leading-5 text-[var(--joballa-muted)]">{t("account.signOut.description")}</p>
          </div>
          <button
            type="button"
            disabled={signingOut}
            onClick={() => setSignOutOpen(true)}
            className={cn(
              "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-bold outline-none transition focus-visible:ring-2 disabled:opacity-60",
              "border-[color-mix(in_srgb,var(--joballa-danger-fg)_40%,var(--joballa-border))] bg-[var(--joballa-danger-bg)] text-[var(--joballa-danger-fg)]",
              "hover:border-[color-mix(in_srgb,var(--joballa-danger-fg)_55%,var(--joballa-border))] focus-visible:ring-[color-mix(in_srgb,var(--joballa-danger-fg)_35%,transparent)]",
            )}
          >
            <LogOut className="size-4" aria-hidden strokeWidth={1.8} />
            <span className="hidden sm:inline">{signingOut ? t("account.signOut.busy") : t("account.signOut.button")}</span>
          </button>
        </div>
      </section>
      <ConfirmDialog
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        title={tc("signOut.title")}
        description={tc("signOut.description")}
        confirmLabel={tc("signOut.confirm")}
        cancelLabel={tc("cancel")}
        onConfirm={logout}
        busy={signingOut}
        destructive
      />
    </div>
  );
}
