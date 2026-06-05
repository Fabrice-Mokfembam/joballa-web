"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { signOut } from "@/lib/auth/session-lifecycle";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";

export function LogoutButton({ className }: { className?: string }) {
  const t = useTranslations("auth.logout");
  const tc = useTranslations("common.confirm");
  const router = useRouter();
  const qc = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await signOut({ router, queryClient: qc, accessToken });
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() => setOpen(true)}
        className={cn(
          "w-full rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-red-400/40 hover:bg-red-950/40 hover:text-white disabled:opacity-50",
          className,
        )}
      >
        {busy ? t("busy") : t("button")}
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={tc("signOut.title")}
        description={tc("signOut.description")}
        confirmLabel={tc("signOut.confirm")}
        cancelLabel={tc("cancel")}
        onConfirm={logout}
        busy={busy}
        destructive
      />
    </>
  );
}
