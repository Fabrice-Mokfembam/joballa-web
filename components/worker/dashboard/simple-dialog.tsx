"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function SimpleDialog({ open, onOpenChange, title, description, children, footer, className }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onClose = () => onOpenChange(false);
    el.addEventListener("close", onClose);
    return () => el.removeEventListener("close", onClose);
  }, [onOpenChange]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={cn(
        "z-[200] m-auto w-[min(calc(100vw-2rem),420px)] max-h-[min(90vh,560px)] overflow-hidden rounded-[14px] border border-[var(--joballa-border)] bg-[var(--joballa-card)] p-0 text-[var(--joballa-fg)] shadow-xl backdrop:bg-black/45 open:flex open:flex-col",
        className,
      )}
      onClick={(e) => {
        if (e.target === ref.current) onOpenChange(false);
      }}
    >
      <div className="flex max-h-[min(90vh,560px)] flex-col">
        <div className="border-b border-[var(--joballa-border)] px-5 py-4">
          <h2 className="text-lg font-semibold leading-7">{title}</h2>
          {description ? <div className="mt-2 text-sm leading-6 text-[var(--joballa-muted)]">{description}</div> : null}
        </div>
        {children ? <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div> : null}
        {footer ? <div className="border-t border-[var(--joballa-border)] bg-[var(--joballa-page-tint)] px-5 py-4">{footer}</div> : null}
      </div>
    </dialog>
  );
}
