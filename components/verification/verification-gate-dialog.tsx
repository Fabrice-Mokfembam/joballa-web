"use client";

import { useTranslations } from "next-intl";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type VerificationGateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status?: string | null;
  subject: "worker" | "employer";
  action?: "apply" | "post-job";
  onVerify: () => void;
};

export function VerificationGateDialog({
  open,
  onOpenChange,
  status,
  subject,
  action = "apply",
  onVerify,
}: VerificationGateDialogProps) {
  const t = useTranslations("verification.gate");
  const normalized = String(status ?? "").toUpperCase();
  const pending = normalized === "PENDING";
  const employer = subject === "employer";
  const workerPostJob = subject === "worker" && action === "post-job";

  const title = pending
    ? employer
      ? t("employerPendingTitle")
      : t("workerKycPendingTitle")
    : employer
      ? t("employerTitle")
      : t("workerKycTitle");

  const description = pending
    ? t("pendingDescription")
    : employer
      ? t("employerDescription")
      : workerPostJob
        ? t("workerPostJobDescription")
        : t("workerApplyDescription");

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      cancelLabel={t("cancel")}
      confirmLabel={pending ? t("viewStatus") : t("verify")}
      onConfirm={() => {
        onOpenChange(false);
        onVerify();
      }}
    />
  );
}
