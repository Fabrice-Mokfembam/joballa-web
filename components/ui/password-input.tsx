"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export type PasswordInputProps = Omit<React.ComponentProps<"input">, "type">;

export function PasswordInput({ className, disabled, ...props }: PasswordInputProps) {
  const t = useTranslations("ui.passwordInput");
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        disabled={disabled}
        className={cn(className, "pr-12")}
        {...props}
      />
      <button
        type="button"
        disabled={disabled}
        className={cn(
          "absolute right-1 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200",
          disabled && "pointer-events-none opacity-40"
        )}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t("hidePassword") : t("showPassword")}
        aria-pressed={visible}
      >
        {visible ? <EyeOff className="size-5" aria-hidden strokeWidth={1.7} /> : <Eye className="size-5" aria-hidden strokeWidth={1.7} />}
      </button>
    </div>
  );
}
