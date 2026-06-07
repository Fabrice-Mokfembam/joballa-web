"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { usePatchEmployerWorkforceStatus } from "@/features/employer/hooks";
import {
  WORKFORCE_STATUS_SELECT_VALUES,
  workforceStatusSelectValue,
} from "@/features/employer/lib/workforce-display";
import type { EmployerWorkforceListItem } from "@/features/employer/types/employer-portal";
import { portalInputClass } from "@/components/portal/portal-ui";
import { cn } from "@/lib/utils";

export function EmployerWorkforceStatusSelect({
  worker,
  statusLabels,
  className,
}: {
  worker: EmployerWorkforceListItem;
  statusLabels: Record<string, string>;
  className?: string;
}) {
  const t = useTranslations("employer.workforce");
  const workerId = String(worker.workerId ?? worker.id ?? "");
  const engagementId = worker.engagementId != null ? String(worker.engagementId) : undefined;
  const rowStatus = String(worker.status ?? "active");
  const selectValue = workforceStatusSelectValue(rowStatus);
  const patchStatus = usePatchEmployerWorkforceStatus(workerId);

  const [value, setValue] = useState(selectValue);
  const [confirmTerminateOpen, setConfirmTerminateOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  useEffect(() => {
    setValue(workforceStatusSelectValue(rowStatus));
  }, [rowStatus]);

  function applyStatus(next: string) {
    patchStatus.mutate(
      {
        status: next,
        engagementId,
        reason: next === "terminated" ? "End of contract" : undefined,
      },
      {
        onSuccess: () => {
          setValue(workforceStatusSelectValue(next));
          setConfirmTerminateOpen(false);
          setPendingStatus(null);
        },
        onError: () => {
          setValue(workforceStatusSelectValue(rowStatus));
          setConfirmTerminateOpen(false);
          setPendingStatus(null);
        },
      },
    );
  }

  function handleChange(next: string) {
    if (next === selectValue) return;
    if (next === "terminated") {
      setPendingStatus(next);
      setConfirmTerminateOpen(true);
      return;
    }
    setValue(workforceStatusSelectValue(next));
    applyStatus(next);
  }

  const displayLabel = statusLabels[rowStatus] ?? statusLabels[selectValue] ?? rowStatus;

  return (
    <>
      <select
        aria-label={t("table.statusFor", { name: String(worker.fullName ?? worker.name ?? "Worker") })}
        className={cn(
          portalInputClass,
          "h-8 w-full min-w-[7.5rem] cursor-pointer py-1 text-xs font-semibold",
          selectValue === "active"
            ? "border-[var(--joballa-jade-4)] bg-[var(--joballa-jade-3)] text-[var(--joballa-primary)]"
            : "border-[var(--joballa-danger-border)] bg-[var(--joballa-danger-soft)] text-[var(--joballa-danger-fg)]",
          className,
        )}
        value={value}
        disabled={!workerId || patchStatus.isPending}
        onChange={(event) => handleChange(event.target.value)}
      >
        {WORKFORCE_STATUS_SELECT_VALUES.map((option) => (
          <option key={option} value={option}>
            {statusLabels[option] ?? option}
          </option>
        ))}
      </select>

      <ConfirmDialog
        open={confirmTerminateOpen}
        onOpenChange={(open) => {
          setConfirmTerminateOpen(open);
          if (!open) {
            setValue(workforceStatusSelectValue(rowStatus));
            setPendingStatus(null);
          }
        }}
        title={t("terminateConfirm.title")}
        description={t("terminateConfirm.description", {
          name: String(worker.fullName ?? worker.name ?? "Worker"),
          role: String(worker.role ?? displayLabel),
        })}
        confirmLabel={t("terminateConfirm.confirm")}
        cancelLabel={t("terminateConfirm.cancel")}
        destructive
        busy={patchStatus.isPending}
        onConfirm={() => {
          if (pendingStatus) applyStatus(pendingStatus);
        }}
      />
    </>
  );
}
