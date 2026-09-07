"use client";

import type { SpelerStand } from "@/types/competition";
import { useSpeelavond } from "@/context/SpeelavondContext";
import { useAuth } from "@/context/AuthContext";
import { formatPunten } from "@/lib/format";
import { haalHistorischeTussenstand } from "@/lib/historische-tussenstand";

interface StandingsTableProps {
  stand?: SpelerStand[];
  compact?: boolean;
  highlightNaam?: string;
  uitgebreid?: boolean;
}

export default function StandingsTable({
  stand: standProp,
  compact = false,
  highlightNaam,
  uitgebreid,
}: StandingsTableProps) {
  const { stand: contextStand, actiefSeizoen, actiefSeizoenLabel } =
    useSpeelavond();
  const { isBestuur } = useAuth();
  const stand = standProp ?? contextStand;
  const toonUitgebreid = uitgebreid ?? isBestuur;
  const tussenstand = haalHistorischeTussenstand(actiefSeizoen);

  if (stand.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 px-6 py-16 text-center">
        <p className="text-4xl">🏆</p>
        <p className="mt-4 text-lg font-semibold text-white">Nog geen ranglijst</p>
        <p className="mt-2 text-sm text-zinc-400">
          Registreer uitslagen en 180&apos;s om de stand op te bouwen (
          {actiefSeizoenLabel}).
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {stand.map((rij) => (
          <div
            key={rij.naam}
            className={`flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 ${
              highlightNaam === rij.naam ? "border-red-700 bg-red-950/20" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-700 text-xs font-bold text-white">
                {rij.positie}
              </span>
              <span className="text-sm font-semibold text-white">{rij.naam}</span>
            </div>
            <span className="font-bold text-red-400">
              {formatPunten(rij.punten)} pt
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {tussenstand && (
        <p className="mb-3 text-xs text-zinc-500">
          Inclusief officiële tussenstand van{" "}
          {new Date(`${tussenstand.datum}T12:00:00`).toLocaleDateString("nl-NL")}{" "}
          · waarden zijn historisch vastgelegd
        </p>
      )}

      <div className="space-y-2 lg:hidden">
        {stand.map((rij) => (
          <div
            key={rij.naam}
            className={`rounded-xl border border-zinc-800 bg-zinc-900 p-3 ${
              highlightNaam === rij.naam ? "border-red-700" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-700 text-sm font-bold text-white">
                  {rij.positie}
                </span>
                <span className="font-semibold text-white">{rij.naam}</span>
              </div>
              <span className="text-lg font-bold text-red-400">
                {formatPunten(rij.punten)}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-400">
              <span>{rij.aanwezig}x aanwezig</span>
              <span className="text-amber-400">{rij.aantal180s}x180</span>
              <span>
                HF {rij.hoogsteFinish > 0 ? rij.hoogsteFinish : "—"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl lg:block">
        <table
          className={`w-full text-left text-sm ${
            toonUitgebreid ? "min-w-[1100px]" : "min-w-[720px]"
          }`}
        >
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/80">
              <th className="px-3 py-3 font-bold text-red-500 lg:px-4 lg:py-4">
                #
              </th>
              <th className="px-3 py-3 font-bold text-white lg:px-4 lg:py-4">
                Speler
              </th>
              <th className="px-3 py-3 font-bold text-white lg:px-4 lg:py-4">
                Punten
              </th>
              {!toonUitgebreid && (
                <>
                  <th className="px-3 py-3 font-bold text-white lg:px-4 lg:py-4">
                    Aanwezig
                  </th>
                  <th className="px-4 py-4 font-bold text-white">180&apos;s</th>
                  <th className="px-4 py-4 font-bold text-white">HF</th>
                </>
              )}
              {toonUitgebreid && (
                <>
                  <th className="px-3 py-3 font-bold text-zinc-300">Aanwezig</th>
                  <th className="px-3 py-3 font-bold text-emerald-400">
                    Poulept
                  </th>
                  <th className="px-3 py-3 font-bold text-sky-400">W-W</th>
                  <th className="px-3 py-3 font-bold text-sky-400">V-W</th>
                  <th className="px-3 py-3 font-bold text-violet-400">W-V</th>
                  <th className="px-3 py-3 font-bold text-violet-400">V-V</th>
                  <th className="px-3 py-3 font-bold text-orange-400">HF</th>
                  <th className="px-3 py-3 font-bold text-amber-400">
                    180&apos;s
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {stand.map((rij) => (
              <tr
                key={rij.naam}
                className={`border-b border-zinc-800/60 transition hover:bg-zinc-900/50 ${
                  highlightNaam === rij.naam ? "bg-red-950/30" : ""
                }`}
              >
                <td className="px-3 py-2 lg:px-4 lg:py-3">
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold lg:h-8 lg:w-8 lg:text-sm ${
                      rij.positie <= 3
                        ? "bg-red-700 text-white"
                        : "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    {rij.positie}
                  </span>
                </td>
                <td className="px-3 py-2 font-semibold text-white lg:px-4 lg:py-3">
                  {rij.naam}
                  {highlightNaam === rij.naam && (
                    <span className="ml-1 text-xs text-red-400">(jij)</span>
                  )}
                </td>
                <td className="px-3 py-2 font-bold text-red-400 lg:px-4 lg:py-3">
                  {formatPunten(rij.punten)}
                </td>
                {!toonUitgebreid && (
                  <>
                    <td className="px-3 py-2 text-zinc-300 lg:px-4 lg:py-3">
                      {rij.aanwezig}
                    </td>
                    <td className="px-4 py-3 text-amber-400">
                      {rij.aantal180s}x
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {rij.hoogsteFinish > 0 ? rij.hoogsteFinish : "—"}
                    </td>
                  </>
                )}
                {toonUitgebreid && (
                  <>
                    <td className="px-3 py-3 text-zinc-300">{rij.aanwezig}</td>
                    <td className="px-3 py-3 text-emerald-400">
                      {formatPunten(rij.poulepunten)}
                    </td>
                    <td className="px-3 py-3 text-sky-300">
                      {rij.winnaarsrondeLegsGewonnen}
                    </td>
                    <td className="px-3 py-3 text-sky-300/70">
                      {rij.winnaarsrondeLegsVerloren}
                    </td>
                    <td className="px-3 py-3 text-violet-300">
                      {rij.verliezersrondeLegsGewonnen}
                    </td>
                    <td className="px-3 py-3 text-violet-300/70">
                      {rij.verliezersrondeLegsVerloren}
                    </td>
                    <td className="px-3 py-3 text-orange-400">
                      {rij.hoogsteFinish > 0 ? rij.hoogsteFinish : "—"}
                    </td>
                    <td className="px-3 py-3 text-amber-400">
                      {rij.aantal180s}x
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
