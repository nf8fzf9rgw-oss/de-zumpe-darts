"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface BestuurLoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function BestuurLoginModal({
  open,
  onClose,
}: BestuurLoginModalProps) {
  const { loginBestuur } = useAuth();
  const [code, setCode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      /* eslint-disable react-hooks/set-state-in-effect -- reset formulier bij openen modal */
      setCode("");
      /* eslint-enable react-hooks/set-state-in-effect */
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (loginBestuur(code)) {
        onClose();
      }
    },
    [code, loginBestuur, onClose]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-end justify-center bg-black/70 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bestuur-login-titel"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Sluiten"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
      >
        <h2
          id="bestuur-login-titel"
          className="text-lg font-bold text-white"
        >
          Bestuur Login
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Voer de 4-cijferige code in om beheertoegang te krijgen.
        </p>

        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="••••"
          className="mt-4 h-14 w-full rounded-xl border border-zinc-700 bg-black px-4 text-center text-2xl tracking-[0.5em] text-white focus:border-red-600 focus:outline-none"
          aria-label="Bestuur code"
        />

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 flex-1 rounded-xl border border-zinc-700 px-4 text-sm font-semibold text-zinc-300 hover:bg-zinc-900"
          >
            Annuleren
          </button>
          <button
            type="submit"
            disabled={code.length !== 4}
            className="min-h-12 flex-1 rounded-xl bg-red-700 px-4 text-sm font-bold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            Inloggen
          </button>
        </div>
      </form>
    </div>
  );
}
