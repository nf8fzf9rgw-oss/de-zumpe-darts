"use client";

import { useSpeelavond } from "@/context/SpeelavondContext";

interface GuestsPanelProps {
  compact?: boolean;
}

export default function GuestsPanel({ compact = false }: GuestsPanelProps) {
  const { gasten, gastNaam, setGastNaam, voegGastToe, verwijderGast } =
    useSpeelavond();

  return (
    <section
      className={`rounded-xl border border-zinc-800 bg-zinc-950 shadow-xl ${
        compact ? "p-4 lg:p-5" : "p-4 lg:rounded-2xl lg:p-6"
      }`}
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white">Gastspelers</h3>
        <p className="mt-1 text-sm text-zinc-400">{gasten.length} gasten</p>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          value={gastNaam}
          onChange={(event) => setGastNaam(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") voegGastToe();
          }}
          placeholder="Naam gastspeler"
          className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-red-600 focus:outline-none"
        />
        <button
          type="button"
          onClick={voegGastToe}
          className="rounded-xl bg-red-700 px-5 py-3 font-semibold text-white transition hover:bg-red-600"
        >
          Toevoegen
        </button>
      </div>

      <div className="space-y-2">
        {gasten.length === 0 && (
          <p className="rounded-xl bg-zinc-900 px-4 py-6 text-center text-sm text-zinc-500">
            Nog geen gastspelers toegevoegd
          </p>
        )}

        {gasten.map((gast) => (
          <div
            key={gast}
            className="flex items-center justify-between rounded-xl bg-zinc-900 px-4 py-3"
          >
            <span className="text-white">{gast}</span>
            <button
              type="button"
              onClick={() => verwijderGast(gast)}
              className="rounded-lg border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-300 transition hover:border-red-700 hover:text-red-400"
            >
              Verwijderen
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
