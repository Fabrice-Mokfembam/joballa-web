"use client";

import { FileText } from "lucide-react";
import { useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

function isImageFile(file: File) {
  return file.type.startsWith("image/") || /\.(jpe?g|png|gif|webp|bmp|heic|heif)$/i.test(file.name);
}

function isPdfFile(file: File) {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

type KycUploadFieldProps = {
  label: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  accept?: string;
  capture?: "user" | "environment";
  className?: string;
};

export function KycUploadField({ label, file, onFileChange, accept, capture, className }: KycUploadFieldProps) {
  const previewUrl = useMemo(() => {
    if (!file || !isImageFile(file)) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  return (
    <label
      className={cn(
        "block rounded-[12px] border border-dashed border-[var(--joballa-border)] p-4 text-sm text-[var(--joballa-muted)]",
        className,
      )}
    >
      <span className="font-semibold text-[var(--joballa-fg)]">{label}</span>
      {file ? (
        <div className="mt-3 overflow-hidden rounded-[8px] border border-[var(--joballa-border)] bg-[var(--joballa-tag-bg)]">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- blob preview from local file picker
            <img src={previewUrl} alt="" className="h-28 w-full object-contain bg-[var(--joballa-card)]" />
          ) : (
            <div className="flex h-28 flex-col items-center justify-center gap-2 px-3 text-center">
              {isPdfFile(file) ? (
                <FileText className="size-8 text-[var(--joballa-primary)]" aria-hidden />
              ) : null}
              <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--joballa-muted)]">
                {file.name.split(".").pop()?.slice(0, 4) ?? "FILE"}
              </span>
            </div>
          )}
        </div>
      ) : null}
      <input
        className="mt-3 block w-full text-xs file:mr-3 file:rounded-full file:border-0 file:bg-[var(--joballa-jade-3)] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[var(--joballa-primary)]"
        type="file"
        accept={accept}
        capture={capture}
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />
      {file ? <span className="mt-2 block truncate text-xs">{file.name}</span> : null}
    </label>
  );
}
