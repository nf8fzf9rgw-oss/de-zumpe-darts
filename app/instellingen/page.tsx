"use client";

import Link from "next/link";
import { useSpeelavond } from "@/context/SpeelavondContext";

export default function InstellingenPage() {
  const {
    laatsteOpslagLabel,
    opslaan,
    nieuweAvond,
    openPrintPreview,
    exportPdf,
    borden,
    huidigSeizoen,
  } = useSpeelavond();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Meer</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Instellingen, export en navigatie naar overige onderdelen.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        <Link
          href="/speelavonden"
          className="min-h-[88px] rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-red-800"
        >
          <span className="text-2xl">📅</span>
          <p className="mt-2 font-bold text-white">Speelavonden</p>
          <p className="text-sm text-zinc-400">Historie bekijken</p>
        </Link>
        <Link
          href="/statistieken"
          className="min-h-[88px] rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-red-800"
        >
          <span className="text-2xl">📈</span>
          <p className="mt-2 font-bold text-white">Statistieken</p>
          <p className="text-sm text-zinc-400">Grafieken & trends</p>
        </Link>
        <Link
          href="/stand"
          className="min-h-[88px] rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-red-800"
        >
          <span className="text-2xl">🏆</span>
          <p className="mt-2 font-bold text-white">Stand</p>
          <p className="text-sm text-zinc-400">Ranglijst</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h3 className="text-lg font-bold text-white">Opslag</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Gegevens worden lokaal opgeslagen in de browser.
          </p>
          <p className="mt-4 text-sm text-zinc-300">
            Laatste opslag:{" "}
            <span className="font-semibold text-white">
              {laatsteOpslagLabel}
            </span>
          </p>
          <p className="mt-2 text-sm text-zinc-300">
            Seizoen:{" "}
            <span className="font-semibold text-white">{huidigSeizoen}</span>
          </p>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h3 className="text-lg font-bold text-white">Acties</h3>
          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={opslaan}
              className="min-h-11 w-full rounded-xl bg-orange-700 px-4 py-3 font-semibold text-white hover:bg-orange-600"
            >
              Speelavond opslaan
            </button>
            <button
              type="button"
              onClick={openPrintPreview}
              disabled={borden.length === 0}
              className="min-h-11 w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              Print preview
            </button>
            <button
              type="button"
              onClick={exportPdf}
              disabled={borden.length === 0}
              className="min-h-11 w-full rounded-xl bg-zinc-700 px-4 py-3 font-semibold text-white hover:bg-zinc-600 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              Opslaan als PDF
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
      </div>
    </div>
  );
}
