"use client";

import { useCallback, useEffect, useState } from "react";
import {
  registerToast,
  type ToastType,
} from "@/lib/ui-feedback";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

const TYPE_STYLES: Record<ToastType, string> = {
  success: "border-zinc-700 bg-zinc-900 text-white",
  error: "border-red-700 bg-red-950 text-red-200",
  info: "border-zinc-700 bg-zinc-900 text-zinc-200",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    registerToast(showToast);
  }, [showToast]);

  return (
    <>
      {children}
      <div
        className="pointer-events-none fixed bottom-20 left-4 right-4 z-[200] flex flex-col gap-2 lg:bottom-6 lg:left-auto lg:right-6 lg:max-w-sm"
        aria-live="polite"
        aria-label="Meldingen"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm font-semibold shadow-xl ${TYPE_STYLES[item.type]}`}
          >
            {item.message}
          </div>
        ))}
      </div>
    </>
  );
}
