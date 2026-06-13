"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { readOnboardingCv, writeOnboardingCv } from "@/lib/onboarding-signup-state";

export function WorkerProfileDocuments() {
  const t = useTranslations("worker.settings.documents");
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(() => readOnboardingCv()?.fileName ?? null);
  const [drag, setDrag] = useState(false);

  function onFiles(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    setFileName(f.name);
    writeOnboardingCv({ fileName: f.name, stagedAt: new Date().toISOString() });
  }

  return (
    <div className="rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-[var(--joballa-fg)]">{t("title")}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--joballa-muted)]">{t("description")}</p>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          onFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-[var(--joballa-border)] bg-[var(--joballa-page-tint)] px-2.5 py-8 transition",
          drag && "border-[var(--joballa-primary)] bg-[var(--joballa-tag-bg)]",
        )}
      >
        <UploadCloud className="size-6 text-[var(--joballa-muted)]" aria-hidden strokeWidth={1.7} />
        <p className="text-center text-sm font-semibold leading-5 text-[var(--joballa-fg)]">{t("dropTitle")}</p>
        <p className="text-center text-xs leading-4 text-[var(--joballa-muted)]">{t("dropHint")}</p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
          className="mt-1 inline-flex h-9 cursor-pointer items-center justify-center rounded-xl border border-[var(--joballa-border)] bg-[var(--joballa-card)] px-4 text-sm font-medium text-[var(--joballa-fg)] shadow-sm transition hover:bg-[var(--joballa-row-hover)]"
        >
          {t("browse")}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          className="sr-only"
          onChange={(e) => onFiles(e.target.files)}
        />
        {fileName ? <p className="text-xs font-medium text-[var(--joballa-primary)]">{fileName}</p> : null}
      </div>
    </div>
  );
}
