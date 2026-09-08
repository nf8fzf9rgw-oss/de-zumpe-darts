"use client";

import ProtectedAction from "@/components/ProtectedAction";
import { telAvondStats } from "@/lib/standings";
import { formatDatum } from "@/lib/storage";
import { useSpeelavond } from "@/context/SpeelavondContext";

export default function SpeelavondenList() {
  const {
    seizoenHistorie,
    laadAvondUitHistorie,
    verwijderAvondUitHistorie,
    printAvondUitHistorie,
    actiefSeizoenLabel,
  } = useSpeelavond();

  const gesorteerd = [...seizoenHistorie].sort(
    (a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime()
  );

  if (gesorteerd.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 px-6 py-16 text-center">
        <p className="text-4xl">📅</p>
        <p className="mt-4 text-lg font-semibold text-white">Geen speelavonden</p>
        <p className="mt-2 text-sm text-zinc-400">
          Nog geen opgeslagen avonden voor {actiefSeizoenLabel}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {gesorteerd.map((avond) => {
        const stats = telAvondStats(avond);
        return (
          <article
            key={avond.datum}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl md:p-6"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {formatDatum(avond.datum)}
                </h3>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-zinc-400">
                  <span>👥 {stats.aantalSpelers} spelers</span>
                  <span>🧑 {stats.aantalGasten} gasten</span>
                  <span>🎯 {stats.aantalBorden} borden</span>
                  <span>🏆 {stats.aantalWedstrijden} wedstrijden</span>
                </div>
                {stats.spelerVanDeAvond && (
                  <p className="mt-2 text-sm font-semibold text-red-400">
                    ⭐ Speler van de avond: {stats.spelerVanDeAvond}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <ProtectedAction>
                  <button
                    type="button"
                    onClick={() => laadAvondUitHistorie(avond.datum)}
                    className="min-h-11 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
                  >
                    Heropenen
                  </button>
                </ProtectedAction>
                <button
                  type="button"
                  onClick={() => printAvondUitHistorie(avond.datum)}
                  className="min-h-11 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700"
                >
                  Printen
                </button>
                <ProtectedAction>
                  <button
                    type="button"
                    onClick={() => verwijderAvondUitHistorie(avond.datum)}
                    className="min-h-11 rounded-xl border border-red-900 bg-red-950 px-4 py-2.5 text-sm font-semibold text-red-300"
                  >
                    Verwijderen
                  </button>
                </ProtectedAction>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
