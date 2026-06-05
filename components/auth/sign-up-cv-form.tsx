"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { UploadCloud } from "lucide-react";
import { useRouter } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { authOutlineButtonClassName, authPrimaryButtonClassName } from "@/lib/auth-ui";
import { useAuthStore } from "@/lib/stores/auth-store";
import { writeOnboardingCv } from "@/lib/onboarding-signup-state";

export function SignUpCvForm() {
  const t = useTranslations("auth.signUpProfile");
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  useEffect(() => {
    if (!token) router.replace("/sign-up/phone");
  }, [router, token]);

  function onFiles(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    setFileName(f.name);
    writeOnboardingCv({ fileName: f.name, stagedAt: new Date().toISOString() });
  }

  function onContinue() {
    router.push("/sign-up/interests");
  }

  return (
    <div className="text-[color:var(--auth-fg)]">
      <h1 className="text-4xl font-bold leading-tight tracking-normal sm:text-5xl sm:leading-[48px]">{t("title")}</h1>
      <p className="mt-4 max-w-xl text-base font-medium leading-6 text-[color:var(--auth-fg-muted)]">{t("subtitle")}</p>

      <div className="mt-4 pt-4">
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
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-[color:var(--auth-dropzone-border)] bg-[color:var(--auth-dropzone-bg)] px-2.5 py-8 transition",
            drag && "border-[color:var(--auth-dropzone-drag-border)] bg-[color:var(--auth-dropzone-drag-surface)]",
          )}
        >
          <UploadCloud className="size-6 text-[color:var(--auth-fg-muted)]" aria-hidden strokeWidth={1.7} />
          <p className="text-center text-sm font-semibold leading-5 text-[color:var(--auth-fg-muted)]">{t("dropTitle")}</p>
          <p className="text-center text-xs leading-4 text-[color:var(--auth-fg-muted)]">{t("dropHint")}</p>
          <span
            role="presentation"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex"
          >
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={cn(authOutlineButtonClassName, "h-8 w-auto px-3 text-sm")}
            >
              {t("browse")}
            </button>
          </span>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
            className="sr-only"
            onChange={(e) => onFiles(e.target.files)}
          />
          {fileName ? <p className="text-xs font-medium text-[color:var(--auth-primary)]">{fileName}</p> : null}
        </div>
      </div>

      <button type="button" onClick={onContinue} className={cn(authPrimaryButtonClassName, "mt-[22px]")}>
        {t("actions.continue")}
      </button>
    </div>
  );
}
