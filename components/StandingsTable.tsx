"use client";

import { useSpeelavond } from "@/context/SpeelavondContext";

export default function StandingsTable() {
  const { stand, actiefSeizoenLabel } = useSpeelavond();

  if (stand.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 px-6 py-16 text-center">
        <p className="text-4xl">🏆</p>
        <p className="mt-4 text-lg font-semibold text-white">Nog geen ranglijst</p>
        <p className="mt-2 text-sm text-zinc-400">
          Registreer uitslagen en 180&apos;s om de stand op te bouwen ({actiefSeizoenLabel}).
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/80">
            <th className="px-4 py-4 font-bold text-red-500">#</th>
            <th className="px-4 py-4 font-bold text-white">Speler</th>
            <th className="px-4 py-4 font-bold text-white">Punten</th>
            <th className="px-4 py-4 font-bold text-white">Winst</th>
            <th className="px-4 py-4 font-bold text-white">180&apos;s</th>
            <th className="px-4 py-4 font-bold text-white">HF</th>
            <th className="px-4 py-4 font-bold text-white">%</th>
          </tr>
        </thead>
        <tbody>
          {stand.map((rij) => (
            <tr
              key={rij.naam}
              className="border-b border-zinc-800/60 transition hover:bg-zinc-900/50"
            >
              <td className="px-4 py-3">
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    rij.positie <= 3
                      ? "bg-red-700 text-white"
                      : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  {rij.positie}
                </span>
              </td>
              <td className="px-4 py-3 font-semibold text-white">{rij.naam}</td>
              <td className="px-4 py-3 font-bold text-red-400">{rij.punten}</td>
              <td className="px-4 py-3 text-green-400">{rij.gewonnen}</td>
              <td className="px-4 py-3 text-amber-400">{rij.aantal180s}x</td>
              <td className="px-4 py-3 text-zinc-300">
                {rij.hoogsteFinish > 0 ? rij.hoogsteFinish : "—"}
              </td>
              <td className="px-4 py-3 text-zinc-400">{rij.percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
