"use client";

import { SimpleDialog } from "@/components/worker/dashboard/simple-dialog";
import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void | Promise<void>;
  busy?: boolean;
  destructive?: boolean;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  busy = false,
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <SimpleDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={
        <>
          <button
            type="button"
            disabled={busy}
            onClick={() => onOpenChange(false)}
            className="rounded-full border border-[var(--joballa-border-strong)] bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--joballa-fg)] transition hover:bg-[var(--joballa-row-hover)] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void onConfirm()}
            className={cn(
              "rounded-full px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50",
              destructive ? "bg-red-600 hover:bg-red-700" : "bg-[var(--joballa-primary)] hover:opacity-90",
            )}
          >
            {confirmLabel}
          </button>
        </>
      }
    />
  );
}
