"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { LocaleSwitcher } from "@/components/navigation/locale-switcher";
import { ThemeSwitcher } from "@/components/navigation/theme-switcher";
import { SettingsToggle } from "@/components/settings/portal-settings-ui";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useEmployerNotificationSettings,
  usePatchEmployerNotificationSettings,
} from "@/features/employer/hooks";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { signOut } from "@/lib/auth/session-lifecycle";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";

const SETTINGS_ITEM_COUNT = 8;

function settingsCellClass(index: number) {
  const lastRowStart = SETTINGS_ITEM_COUNT - (SETTINGS_ITEM_COUNT % 2 === 0 ? 2 : 1);
  return cn(
    "min-w-0 border-b border-[var(--joballa-border)] py-5 sm:py-6",
    index % 2 === 0 && "lg:border-r lg:pr-8",
    index % 2 === 1 && "lg:pl-8",
    index >= lastRowStart && "border-b-0",
  );
}

function SettingsItemLabel({ title, description }: { title: string; description: string }) {
  return (
    <div className="min-w-0">
      <h3 className="text-sm font-bold leading-6 text-[var(--joballa-fg)]">{title}</h3>
      <p className="mt-0.5 text-sm leading-5 text-[var(--joballa-muted)]">{description}</p>
    </div>
  );
}

function NotificationToggleCell({
  index,
  title,
  description,
  enabled,
  disabled,
  onToggle,
}: {
  index: number;
  title: string;
  description: string;
  enabled: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={settingsCellClass(index)}>
      <div className="flex items-center justify-between gap-4">
        <SettingsItemLabel title={title} description={description} />
        <button
          type="button"
          disabled={disabled}
          onClick={onToggle}
          className="shrink-0 rounded-full outline-none ring-[var(--joballa-primary)] focus-visible:ring-2 disabled:opacity-60"
          aria-pressed={enabled}
        >
          <SettingsToggle enabled={enabled} />
        </button>
      </div>
    </div>
  );
}

export function EmployerSettingsView() {
  const t = useTranslations("employer.settings");
  const tc = useTranslations("common.confirm");
  const router = useRouter();
  const qc = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
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

  function patchNotifications(patch: Partial<NonNullable<typeof notificationSettings>>) {
    patchNotificationSettings.mutate({ ...notificationSettings, ...patch });
  }

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-6 bg-[var(--joballa-page-tint)] text-sm">
      <header>
        <h1 className="text-2xl font-bold leading-8 text-[var(--joballa-fg)]">{t("pageTitle")}</h1>
        <p className="mt-2 text-sm font-medium leading-6 text-[var(--joballa-muted)]">{t("pageDescription")}</p>
      </header>

      <section className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:p-6">
        <div className="grid lg:grid-cols-2">
          <NotificationToggleCell
            index={0}
            title={t("notifications.push.title")}
            description={t("notifications.push.description")}
            enabled={notificationSettings?.pushEnabled ?? false}
            disabled={patchNotificationSettings.isPending}
            onToggle={() => patchNotifications({ pushEnabled: !(notificationSettings?.pushEnabled ?? false) })}
          />

          <NotificationToggleCell
            index={1}
            title={t("notifications.email.title")}
            description={t("notifications.email.description")}
            enabled={notificationSettings?.emailEnabled ?? true}
            disabled={patchNotificationSettings.isPending}
            onToggle={() => patchNotifications({ emailEnabled: !(notificationSettings?.emailEnabled ?? true) })}
          />

          <NotificationToggleCell
            index={2}
            title={t("notifications.applicants.title")}
            description={t("notifications.applicants.description")}
            enabled={notificationSettings?.applicantsEnabled ?? true}
            disabled={patchNotificationSettings.isPending}
            onToggle={() =>
              patchNotifications({ applicantsEnabled: !(notificationSettings?.applicantsEnabled ?? true) })
            }
          />

          <NotificationToggleCell
            index={3}
            title={t("notifications.messages.title")}
            description={t("notifications.messages.description")}
            enabled={notificationSettings?.messagesEnabled ?? false}
            disabled={patchNotificationSettings.isPending}
            onToggle={() =>
              patchNotifications({ messagesEnabled: !(notificationSettings?.messagesEnabled ?? false) })
            }
          />

          <div className={settingsCellClass(4)}>
            <div className="flex min-h-full flex-col gap-4">
              <SettingsItemLabel title={t("language.title")} description={t("language.description")} />
              <LocaleSwitcher variant="light" className="w-fit" />
            </div>
          </div>

          <div className={settingsCellClass(5)}>
            <div className="flex min-h-full flex-col gap-4">
              <SettingsItemLabel title={t("appearance.title")} description={t("appearance.description")} />
              <ThemeSwitcher className="w-fit" />
            </div>
          </div>

          <div className={settingsCellClass(6)}>
            <Link
              href="/employer/profile"
              className="block min-w-0 outline-none ring-[var(--joballa-primary)] transition hover:opacity-90 focus-visible:ring-2"
            >
              <SettingsItemLabel title={t("account.profile.title")} description={t("account.profile.description")} />
            </Link>
          </div>

          <div className={settingsCellClass(7)}>
            <div className="flex min-h-full flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <SettingsItemLabel title={t("account.signOut.title")} description={t("account.signOut.description")} />
              <button
                type="button"
                disabled={signingOut}
                onClick={() => setSignOutOpen(true)}
                className={cn(
                  "inline-flex h-10 shrink-0 items-center rounded-full border px-4 text-sm font-bold outline-none transition focus-visible:ring-2 disabled:opacity-60",
                  "border-[color-mix(in_srgb,var(--joballa-danger-fg)_40%,var(--joballa-border))] bg-[var(--joballa-danger-bg)] text-[var(--joballa-danger-fg)]",
                  "hover:border-[color-mix(in_srgb,var(--joballa-danger-fg)_55%,var(--joballa-border))] focus-visible:ring-[color-mix(in_srgb,var(--joballa-danger-fg)_35%,transparent)]",
                )}
              >
                {signingOut ? t("account.signOut.busy") : t("account.signOut.button")}
              </button>
            </div>
          </div>
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
