"use client";

import { useEffect, useRef } from "react";
import PrintCompetition from "@/components/PrintCompetition";
import { useSpeelavond } from "@/context/SpeelavondContext";

export default function PrintPreviewModal() {
  const {
    printPreviewOpen,
    sluitPrintPreview,
    printSchema,
    borden,
  } = useSpeelavond();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!printPreviewOpen) return;
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") sluitPrintPreview();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [printPreviewOpen, sluitPrintPreview]);

  if (!printPreviewOpen || borden.length === 0) return null;

  return (
    <div
      className="no-print fixed inset-0 z-[100] flex items-end justify-center bg-black/80 p-4 sm:items-center"
      role="presentation"
      onClick={sluitPrintPreview}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="print-preview-title"
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 sm:px-6">
          <div>
            <h2 id="print-preview-title" className="font-bold text-white">
              Print preview
            </h2>
            <p className="text-xs text-zinc-400">Speelschema Vrijdagavond</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={sluitPrintPreview}
            className="rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white"
            aria-label="Sluiten"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-zinc-900 p-4 sm:p-6">
          <div className="mx-auto max-w-[210mm] rounded-lg border border-zinc-300 bg-white shadow-lg">
            <PrintCompetition variant="preview" />
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-zinc-800 p-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={sluitPrintPreview}
            className="min-h-11 rounded-xl border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-300 hover:bg-zinc-900"
          >
            Annuleren
          </button>
          <button
            type="button"
            onClick={printSchema}
            className="min-h-11 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500"
          >
            Printen / PDF
          </button>
        </div>
      </div>
    </div>
  );
}
