"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { LocaleSwitcher } from "@/components/navigation/locale-switcher";
import { ThemeSwitcher } from "@/components/navigation/theme-switcher";
import { SettingsToggle } from "@/components/settings/portal-settings-ui";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  usePatchWorkerNotificationSettings,
  useWorkerNotificationSettings,
} from "@/features/worker/hooks";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { signOut } from "@/lib/auth/session-lifecycle";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";

function settingsCellClass(index: number) {
  return cn(
    "min-w-0 border-b border-[var(--joballa-border)] py-5 sm:py-6",
    index % 2 === 0 && "lg:border-r lg:pr-8",
    index % 2 === 1 && "lg:pl-8",
    index >= 4 && "border-b-0",
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

export function WorkerSettingsView() {
  const t = useTranslations("worker.settings");
  const tc = useTranslations("common.confirm");
  const router = useRouter();
  const qc = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const notificationSettingsQuery = useWorkerNotificationSettings();
  const patchNotificationSettings = usePatchWorkerNotificationSettings();
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
        <div className="grid lg:grid-cols-2">
          <div className={settingsCellClass(0)}>
            <div className="flex items-center justify-between gap-4">
              <SettingsItemLabel
                title={t("notifications.email.title")}
                description={t("notifications.email.description")}
              />
              <button
                type="button"
                disabled={patchNotificationSettings.isPending}
                onClick={() =>
                  patchNotificationSettings.mutate({
                    ...notificationSettings,
                    emailEnabled: !(notificationSettings?.emailEnabled ?? true),
                  })
                }
                className="shrink-0 rounded-full outline-none ring-[var(--joballa-primary)] focus-visible:ring-2 disabled:opacity-60"
                aria-pressed={notificationSettings?.emailEnabled ?? true}
              >
                <SettingsToggle enabled={notificationSettings?.emailEnabled ?? true} />
              </button>
            </div>
          </div>

          <div className={settingsCellClass(1)}>
            <div className="flex min-h-full flex-col gap-4">
              <SettingsItemLabel title={t("language.title")} description={t("language.description")} />
              <LocaleSwitcher variant="light" className="w-fit" />
            </div>
          </div>

          <div className={settingsCellClass(2)}>
            <div className="flex min-h-full flex-col gap-4">
              <SettingsItemLabel title={t("appearance.title")} description={t("appearance.description")} />
              <ThemeSwitcher className="w-fit" />
            </div>
          </div>

          <div className={settingsCellClass(3)}>
            <Link
              href="/worker/profile/edit"
              className="block min-w-0 outline-none ring-[var(--joballa-primary)] transition hover:opacity-90 focus-visible:ring-2"
            >
              <SettingsItemLabel title={t("account.profile.title")} description={t("account.profile.description")} />
            </Link>
          </div>

          <div className={settingsCellClass(4)}>
            <Link
              href="/worker/engagements"
              className="block min-w-0 outline-none ring-[var(--joballa-primary)] transition hover:opacity-90 focus-visible:ring-2"
            >
              <SettingsItemLabel title={t("account.engagements.title")} description={t("account.engagements.description")} />
            </Link>
          </div>

          <div className={settingsCellClass(5)}>
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
