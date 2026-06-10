"use client";

import { FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function isImageFile(file: File) {
  return file.type.startsWith("image/") || /\.(jpe?g|png|gif|webp|bmp)$/i.test(file.name);
}

function isPdfFile(file: File) {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

type SupportingDocumentPickerProps = {
  file: File;
  saving?: boolean;
  saveLabel: string;
  savingLabel?: string;
  cancelLabel: string;
  onSave: () => void;
  onCancel: () => void;
  className?: string;
};

export function SupportingDocumentPicker({
  file,
  saving = false,
  saveLabel,
  savingLabel = "Saving...",
  cancelLabel,
  onSave,
  onCancel,
  className,
}: SupportingDocumentPickerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isImageFile(file)) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className={cn("rounded-[12px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-4", className)}>
      <div className="overflow-hidden rounded-[8px] border border-[var(--joballa-border)] bg-[var(--joballa-tag-bg)]">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- local file preview
          <img src={previewUrl} alt="" className="h-32 w-full object-contain bg-[var(--joballa-card)]" />
        ) : (
          <div className="flex h-32 flex-col items-center justify-center gap-2 px-3 text-center">
            {isPdfFile(file) ? <FileText className="size-8 text-[var(--joballa-primary)]" aria-hidden /> : null}
            <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--joballa-muted)]">
              {file.name.split(".").pop()?.slice(0, 4) ?? "FILE"}
            </span>
          </div>
        )}
      </div>
      <p className="mt-3 truncate text-sm font-semibold text-[var(--joballa-fg)]">{file.name}</p>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={onCancel}
          className="h-9 rounded-[10px] border border-[var(--joballa-border)] px-4 text-sm font-medium text-[var(--joballa-fg)] disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={onSave}
          className="h-9 rounded-[10px] bg-[var(--joballa-primary)] px-4 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? savingLabel : saveLabel}
        </button>
      </div>
    </div>
  );
}
