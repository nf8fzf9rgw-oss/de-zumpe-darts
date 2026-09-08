"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import BestuurLoginModal from "@/components/BestuurLoginModal";
import ProtectedAction from "@/components/ProtectedAction";
import SeasonSelector from "@/components/SeasonSelector";
import WhatsAppShare from "@/components/WhatsAppShare";
import { useAuth } from "@/context/AuthContext";
import { useSpeelavond } from "@/context/SpeelavondContext";
import { toast } from "@/lib/ui-feedback";
import {
  exportDataBackup,
  importDataBackup,
} from "@/lib/storage";
import {
  downloadCsv,
  exportStandCsv,
  exportHistorieCsv,
  exportSpelersCsv,
  exportRecordsCsv,
} from "@/lib/export/csv";
import {
  downloadExcelHtml,
  printHtmlAlsPdf,
  recordsNaarTabelHtml,
  speelavondenNaarTabelHtml,
  spelersNaarTabelHtml,
  standNaarTabelHtml,
} from "@/lib/export/excel";
import FinishBonusInstellingen from "@/components/FinishBonusInstellingen";
import type { ZumpeDataBackup } from "@/types/competition";

export default function InstellingenPage() {
  const {
    laatsteOpslagLabel,
    opslaan,
    nieuweAvond,
    openPrintPreview,
    printSchema,
    borden,
    actiefSeizoenLabel,
    stand,
    historie,
    clubRecords,
    leden,
  } = useSpeelavond();
  const { isBestuur, logoutBestuur } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = () => {
    const backup = exportDataBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `de-zumpe-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast("Backup geëxporteerd.", "success");
  };

  const handleImportBackup = async (file: File) => {
    try {
      const text = await file.text();
      const backup = JSON.parse(text) as ZumpeDataBackup;
      const result = importDataBackup(backup);
      if (!result.success) {
        toast(result.error ?? "Import mislukt.", "error");
        return;
      }
      toast("Backup geïmporteerd. Pagina wordt ververst.", "success");
      setTimeout(() => window.location.reload(), 800);
    } catch {
      toast("Ongeldig JSON-bestand.", "error");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Meer</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Extra pagina&apos;s, delen en instellingen voor wedstrijdleiding.
          </p>
        </div>
        <SeasonSelector />
      </div>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 lg:p-6">
        <h3 className="text-lg font-bold text-white">Wedstrijdleiding</h3>
        <p className="mt-1 text-sm text-zinc-400">
          {isBestuur
            ? "Je werkt nu als wedstrijdleiding met volledige beheertoegang."
            : "Bezoekers gebruiken de site zonder account. Wedstrijdleiding opent extra beheer."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {isBestuur ? (
            <>
              <Link
                href="/beheer"
                className="min-h-11 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
              >
                Naar beheer dashboard
              </Link>
              <button
                type="button"
                onClick={logoutBestuur}
                className="min-h-11 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-900"
              >
                Bestuur Uitloggen
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="min-h-11 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-600"
            >
              Bestuur Login
            </button>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <Link
          href="/speelavonden"
          className="min-h-[88px] rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-red-800"
        >
          <span className="text-2xl">📅</span>
          <p className="mt-2 font-bold text-white">Speelavonden</p>
          <p className="text-sm text-zinc-400">Historie</p>
        </Link>
        <Link
          href="/statistieken"
          className="min-h-[88px] rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-red-800"
        >
          <span className="text-2xl">📈</span>
          <p className="mt-2 font-bold text-white">Statistieken</p>
          <p className="text-sm text-zinc-400">Grafieken</p>
        </Link>
        <Link
          href="/stand"
          className="min-h-[88px] rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-red-800"
        >
          <span className="text-2xl">🏆</span>
          <p className="mt-2 font-bold text-white">Ranglijst</p>
          <p className="text-sm text-zinc-400">Stand</p>
        </Link>
        <Link
          href="/hall-of-fame"
          className="min-h-[88px] rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-red-800"
        >
          <span className="text-2xl">🥇</span>
          <p className="mt-2 font-bold text-white">Hall of Fame</p>
          <p className="text-sm text-zinc-400">Records</p>
        </Link>
        <Link
          href="/competitie"
          className="min-h-[88px] rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-red-800"
        >
          <span className="text-2xl">🎯</span>
          <p className="mt-2 font-bold text-white">Competitie</p>
          <p className="text-sm text-zinc-400">Alle borden</p>
        </Link>
        <Link
          href="/mijn-poule"
          className="min-h-[88px] rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-red-800"
        >
          <span className="text-2xl">📋</span>
          <p className="mt-2 font-bold text-white">Mijn Poule</p>
          <p className="text-sm text-zinc-400">Jouw wedstrijden</p>
        </Link>
      </div>

      <WhatsAppShare />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h3 className="text-lg font-bold text-white">Opslag</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Gegevens worden lokaal opgeslagen in de browser.
          </p>
          <p className="mt-4 text-sm text-zinc-300">
            Laatste opslag:{" "}
            <span className="font-semibold text-white">{laatsteOpslagLabel}</span>
          </p>
          <p className="mt-2 text-sm text-zinc-300">
            Seizoen:{" "}
            <span className="font-semibold text-white">{actiefSeizoenLabel}</span>
          </p>
          <ProtectedAction>
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={handleExportBackup}
                className="min-h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Export JSON backup
              </button>
              <input
                ref={importRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImportBackup(file);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => importRef.current?.click()}
                className="min-h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Import JSON backup
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadCsv(
                    exportStandCsv(stand, actiefSeizoenLabel),
                    `stand-${actiefSeizoenLabel}.csv`
                  )
                }
                className="min-h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Export stand (CSV)
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadCsv(
                    exportHistorieCsv(historie),
                    "speelavonden.csv"
                  )
                }
                className="min-h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Export speelavonden (CSV)
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadCsv(exportSpelersCsv(leden), "spelers.csv")
                }
                className="min-h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Export spelers (CSV)
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadCsv(exportRecordsCsv(clubRecords), "records.csv")
                }
                className="min-h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Export records (CSV)
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadExcelHtml(
                    standNaarTabelHtml(stand, actiefSeizoenLabel),
                    `ranglijst-${actiefSeizoenLabel}.xls`
                  )
                }
                className="min-h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Export ranglijst (Excel)
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadExcelHtml(
                    speelavondenNaarTabelHtml(historie),
                    "speelavonden.xls"
                  )
                }
                className="min-h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Export speelavonden (Excel)
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadExcelHtml(spelersNaarTabelHtml(leden), "spelers.xls")
                }
                className="min-h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Export spelers (Excel)
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadExcelHtml(
                    recordsNaarTabelHtml(clubRecords, actiefSeizoenLabel),
                    `records-${actiefSeizoenLabel}.xls`
                  )
                }
                className="min-h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Export records (Excel)
              </button>
              <button
                type="button"
                onClick={() =>
                  printHtmlAlsPdf(
                    standNaarTabelHtml(stand, actiefSeizoenLabel),
                    `Ranglijst ${actiefSeizoenLabel}`
                  )
                }
                className="min-h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Export ranglijst (PDF)
              </button>
              <button
                type="button"
                onClick={() =>
                  printHtmlAlsPdf(
                    recordsNaarTabelHtml(clubRecords, actiefSeizoenLabel),
                    `Records ${actiefSeizoenLabel}`
                  )
                }
                className="min-h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Export records (PDF)
              </button>
            </div>
          </ProtectedAction>
        </section>

        <ProtectedAction>
          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h3 className="text-lg font-bold text-white">Beheer acties</h3>
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={opslaan}
                className="min-h-11 w-full rounded-lg bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-500"
              >
                Speelavond opslaan
              </button>
              <button
                type="button"
                onClick={openPrintPreview}
                disabled={borden.length === 0}
                className="min-h-11 w-full rounded-xl bg-zinc-700 px-4 py-3 font-semibold text-white hover:bg-zinc-600 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                Print preview
              </button>
              <button
                type="button"
                onClick={printSchema}
                disabled={borden.length === 0}
                className="min-h-11 w-full rounded-xl bg-zinc-700 px-4 py-3 font-semibold text-white hover:bg-zinc-600 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                Printen / PDF
              </button>
              <button
                type="button"
                onClick={nieuweAvond}
                className="min-h-11 w-full rounded-xl border border-red-800 bg-red-950 px-4 py-3 font-semibold text-red-300 hover:bg-red-900"
              >
                Nieuwe speelavond
              </button>
            </div>
          </section>
        </ProtectedAction>
      </div>

      <ProtectedAction>
        <FinishBonusInstellingen />
      </ProtectedAction>

      <BestuurLoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
