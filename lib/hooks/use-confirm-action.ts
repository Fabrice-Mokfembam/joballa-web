"use client";

import { useCallback, useState } from "react";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
};

const idle = {
  open: false,
  title: "",
  description: undefined as string | undefined,
  confirmLabel: "",
  cancelLabel: "",
  destructive: false,
  onConfirm: () => {},
};

export function useConfirmAction() {
  const [state, setState] = useState(idle);
  const [busy, setBusy] = useState(false);

  const requestConfirm = useCallback((opts: ConfirmOptions) => {
    setState({
      open: true,
      title: opts.title,
      description: opts.description,
      confirmLabel: opts.confirmLabel,
      cancelLabel: opts.cancelLabel,
      destructive: opts.destructive ?? false,
      onConfirm: opts.onConfirm,
    });
  }, []);

  const close = useCallback(() => {
    if (!busy) setState(idle);
  }, [busy]);

  const runConfirm = useCallback(async () => {
    setBusy(true);
    try {
      await state.onConfirm();
      setState(idle);
    } finally {
      setBusy(false);
    }
  }, [state]);

  return {
    requestConfirm,
    dialogProps: {
      open: state.open,
      onOpenChange: (open: boolean) => {
        if (!open) close();
      },
      title: state.title,
      description: state.description,
      confirmLabel: state.confirmLabel,
      cancelLabel: state.cancelLabel,
      destructive: state.destructive,
      onConfirm: runConfirm,
      busy,
    },
  };
}
