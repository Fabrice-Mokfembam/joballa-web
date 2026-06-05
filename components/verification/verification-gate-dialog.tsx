"use client";

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
  const normalized = String(status ?? "").toUpperCase();
  const pending = normalized === "PENDING";
  const employer = subject === "employer";
  const workerPostJob = subject === "worker" && action === "post-job";

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        pending
          ? employer
            ? "Business verification is pending"
            : "KYC verification is pending"
          : employer
            ? "Verify your business first"
            : "Verify your KYC first"
      }
      description={
        pending
          ? "Your documents are already under review. Verification can take up to 24 hours or less."
          : employer
            ? "Employers need approved business registration documents before posting jobs on Joballa."
            : workerPostJob
              ? "Workers need approved KYC before posting jobs on Joballa."
              : "Workers need approved KYC before applying for jobs on Joballa."
      }
      cancelLabel="Cancel"
      confirmLabel={pending ? "View status" : "Verify"}
      onConfirm={() => {
        onOpenChange(false);
        onVerify();
      }}
    />
  );
}
