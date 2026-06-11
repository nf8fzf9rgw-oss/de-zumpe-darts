"use client";

import { useCallback, useState } from "react";

export function usePrintState() {
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [printAvond, setPrintAvond] = useState<import("@/types/competition").Speelavond | null>(
    null
  );

  const openPrintPreview = useCallback(() => {
    setPrintAvond(null);
    setPrintPreviewOpen(true);
  }, []);

  const sluitPrintPreview = useCallback(() => {
    setPrintPreviewOpen(false);
    setPrintAvond(null);
  }, []);

  const printSchema = useCallback(() => {
    setPrintPreviewOpen(false);
    requestAnimationFrame(() => {
      window.print();
      setPrintAvond(null);
    });
  }, []);

  const exportPdf = useCallback(() => {
    setPrintPreviewOpen(false);
    requestAnimationFrame(() => {
      window.print();
      setPrintAvond(null);
    });
  }, []);

  return {
    printPreviewOpen,
    printAvond,
    setPrintAvond,
    openPrintPreview,
    sluitPrintPreview,
    printSchema,
    exportPdf,
  };
}
