"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { EmployerAsyncState } from "@/components/employer/employer-async-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useEmployerWorkforceWorker,
  usePatchEmployerWorkforceStatus,
} from "@/features/employer/hooks";
import type { EmployerWorkforceListItem } from "@/features/employer/types/employer-portal";
import { IconClose } from "@/components/worker/icons";
import {
  portalAvatarPlaceholderClass,
  portalDetailSectionClass,
  portalOutlineButtonClass,
  portalStatusActiveBadgeClass,
  portalStatusInactiveBadgeClass,
} from "@/components/portal/portal-ui";
import { cn } from "@/lib/utils";
import { buttonClassName } from "@/components/ui/button";

function workerName(worker: EmployerWorkforceListItem): string {
  return String(worker.fullName ?? worker.name ?? "Worker");
}

export function EmployerWorkforceWorkerPanel({
  workerId: id,
  fallback,
  onClose,
}: {
  workerId: string;
  fallback?: EmployerWorkforceListItem | null;
  onClose?: () => void;
}) {
  const t = useTranslations("employer.workforce");
  const detail = useEmployerWorkforceWorker(id);
  const patchStatus = usePatchEmployerWorkforceStatus(id);
  const [confirmTerminateOpen, setConfirmTerminateOpen] = useState(false);

  const profile = detail.data ?? fallback;
  const worker = profile as EmployerWorkforceListItem | undefined;
  const name = worker ? workerName(worker) : "-";
  const role = String(worker?.role ?? "-");
  const status = String(worker?.status ?? "active");
  const engagementId = worker?.engagementId != null ? String(worker.engagementId) : undefined;
  const avatarUrl = String(
    (profile as Record<string, unknown> | undefined)?.photoUrl ??
      (profile as Record<string, unknown> | undefined)?.avatarUrl ??
      (profile as Record<string, unknown> | undefined)?.profilePhotoUrl ??
      (profile as Record<string, unknown> | undefined)?.photo ??
      "",
  );

  function terminateWorker() {
    patchStatus.mutate(
      { status: "terminated", engagementId, reason: "End of contract" },
      { onSuccess: () => setConfirmTerminateOpen(false) },
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {onClose ? (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label={t("closePanel")}
            className={cn(portalOutlineButtonClass, "size-10 shrink-0 p-0")}
          >
            <IconClose className="size-5" />
          </button>
        </div>
      ) : null}

      <EmployerAsyncState
        isLoading={detail.isLoading && !fallback}
        isError={detail.isError}
        error={detail.error}
        onRetry={() => void detail.refetch()}
      >
        <section className={portalDetailSectionClass}>
          <div className="flex w-full items-center gap-4 text-left">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="size-16 rounded-full object-cover" />
            ) : (
              <span className={cn(portalAvatarPlaceholderClass, "size-16 text-xl")}>
                {name.charAt(0)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-[var(--joballa-fg)]">{name}</h2>
              <p className="text-sm text-[var(--joballa-muted)]">{role}</p>
              <span
                className={cn(
                  "mt-2",
                  status === "active" ? portalStatusActiveBadgeClass : portalStatusInactiveBadgeClass,
                )}
              >
                {status}
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--joballa-border)] pt-5">
            <button
              type="button"
              disabled={patchStatus.isPending || status !== "active"}
              onClick={() => setConfirmTerminateOpen(true)}
              className={cn(buttonClassName("outline"), "text-xs")}
            >
              {t("actions.terminate")}
            </button>
            <button
              type="button"
              disabled={patchStatus.isPending || status === "active"}
              onClick={() => patchStatus.mutate({ status: "active", engagementId })}
              className={cn(buttonClassName("outline"), "text-xs")}
            >
              {t("actions.reinstate")}
            </button>
          </div>
        </section>
      </EmployerAsyncState>

      <ConfirmDialog
        open={confirmTerminateOpen}
        onOpenChange={setConfirmTerminateOpen}
        title={t("terminateConfirm.title")}
        description={t("terminateConfirm.description", { name, role })}
        confirmLabel={t("terminateConfirm.confirm")}
        cancelLabel={t("terminateConfirm.cancel")}
        destructive
        busy={patchStatus.isPending}
        onConfirm={terminateWorker}
      />
    </div>
  );
}
