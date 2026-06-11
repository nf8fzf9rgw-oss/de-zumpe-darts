"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  registerConfirm,
  type ConfirmOptions,
} from "@/lib/ui-feedback";

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback((result: boolean) => {
    setOpen(false);
    setOptions(null);
    resolveRef.current?.(result);
    resolveRef.current = null;
  }, []);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setOptions(opts);
      setOpen(true);
    });
  }, []);

  useEffect(() => {
    registerConfirm(confirm);
  }, [confirm]);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleClose]);

  if (!open || !options) return <>{children}</>;

  const confirmLabel = options.confirmLabel ?? "Bevestigen";
  const cancelLabel = options.cancelLabel ?? "Annuleren";

  return (
    <>
      {children}
      <div
        className="fixed inset-0 z-[250] flex items-end justify-center bg-black/80 p-4 sm:items-center"
        role="presentation"
        onClick={() => handleClose(false)}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          aria-describedby="confirm-modal-desc"
          className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-950 p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2
            id="confirm-modal-title"
            className="text-lg font-bold text-white"
          >
            {options.title}
          </h2>
          <p id="confirm-modal-desc" className="mt-2 text-sm text-zinc-400">
            {options.message}
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              ref={cancelRef}
              type="button"
              onClick={() => handleClose(false)}
              className="min-h-11 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={() => handleClose(true)}
              className={`min-h-11 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 ${
                options.destructive
                  ? "bg-red-700 hover:bg-red-600"
                  : "bg-red-700 hover:bg-red-600"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
