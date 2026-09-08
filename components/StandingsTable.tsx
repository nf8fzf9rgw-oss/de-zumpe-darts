"use client";

import Link from "next/link";
import type { SpelerStand } from "@/types/competition";
import { useSpeelavond } from "@/context/SpeelavondContext";
import { useAuth } from "@/context/AuthContext";
import { formatPunten, ranglijstMedaille } from "@/lib/format";
import { haalHistorischeTussenstand } from "@/lib/historische-tussenstand";
import { mijnPoulePad } from "@/lib/wedstrijd-overzicht";

interface StandingsTableProps {
  stand?: SpelerStand[];
  compact?: boolean;
  highlightNaam?: string;
  uitgebreid?: boolean;
}

/** Kolomkoppen zoals ze op de officiële tussenstand staan. */
const KOLOM_TITELS = {
  aanwezig: "Aanwezig",
  poulepunten: "Aantal punten in poule",
  winnaarsrondeLegsGewonnen: "Gewonnen legs winnaars ronde",
  winnaarsrondeLegsVerloren: "Verloren legs winnaars ronde",
  verliezersrondeLegsGewonnen: "Gewonnen legs verliezers ronde",
  verliezersrondeLegsVerloren: "Verloren legs verliezers ronde",
  hoogsteFinish: "Hoogste uitgooi",
  aantal180s: "Aantal 180",
  punten: "Punten totaal",
} as const;

function telOp(stand: SpelerStand[], veld: keyof SpelerStand): number {
  return stand.reduce((som, rij) => som + (rij[veld] as number), 0);
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
  const toonBestuurskolommen = uitgebreid ?? isBestuur;
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
          <Link
            key={rij.naam}
            href={mijnPoulePad(rij.naam)}
            className={`flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 hover:border-red-800/60 ${
              highlightNaam === rij.naam ? "border-red-700 bg-red-950/20" : ""
            }`}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="w-7 text-center text-sm font-bold">
                {ranglijstMedaille(rij.positie)}
              </span>
              <span className="truncate text-sm font-semibold text-white">
                {rij.naam}
              </span>
            </div>
            <span className="stat-number font-bold text-red-400">
              {formatPunten(rij.punten)} pt
            </span>
          </Link>
        ))}
      </div>
    );
  }

  const totalen = {
    aanwezig: telOp(stand, "aanwezig"),
    poulepunten: telOp(stand, "poulepunten"),
    winnaarsrondeLegsGewonnen: telOp(stand, "winnaarsrondeLegsGewonnen"),
    winnaarsrondeLegsVerloren: telOp(stand, "winnaarsrondeLegsVerloren"),
    verliezersrondeLegsGewonnen: telOp(stand, "verliezersrondeLegsGewonnen"),
    verliezersrondeLegsVerloren: telOp(stand, "verliezersrondeLegsVerloren"),
    aantal180s: telOp(stand, "aantal180s"),
    punten: telOp(stand, "punten"),
  };

  return (
    <>
      {tussenstand && (
        <p className="mb-3 text-xs text-zinc-500">
          Inclusief officiële tussenstand van{" "}
          {new Date(`${tussenstand.datum}T12:00:00`).toLocaleDateString("nl-NL")}{" "}
          · alle kolommen komen één-op-één uit {tussenstand.bron.toLowerCase()}
        </p>
      )}

      <div className="space-y-2 lg:hidden">
        {stand.map((rij) => (
          <Link
            key={rij.naam}
            href={mijnPoulePad(rij.naam)}
            className={`block rounded-xl border border-zinc-800 bg-zinc-900 p-3 transition hover:border-red-800/60 ${
              highlightNaam === rij.naam ? "border-red-700" : ""
            } ${rij.positie <= 3 ? "bg-zinc-950" : ""}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-white">
                  {ranglijstMedaille(rij.positie)} {rij.naam}
                </p>
                <p className="stat-number mt-1 text-2xl font-bold text-red-500">
                  {formatPunten(rij.punten)}{" "}
                  <span className="text-sm font-semibold text-zinc-400">punten</span>
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  {rij.gewonnen} wins · {rij.aantal180s} × 180 · HF{" "}
                  {rij.hoogsteFinish > 0 ? rij.hoogsteFinish : "—"}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl lg:block">
        <table
          className={`w-full text-left text-sm ${
            toonBestuurskolommen ? "min-w-[1180px]" : "min-w-[1000px]"
          }`}
        >
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase tracking-wide">
              <th className="px-3 py-3 font-bold text-red-500 lg:px-4 lg:py-4">
                #
              </th>
              <th className="px-3 py-3 font-bold text-white lg:px-4 lg:py-4">
                Speler
              </th>
              <th
                className="px-3 py-3 text-right font-bold text-zinc-300"
                title={KOLOM_TITELS.aanwezig}
              >
                Aanwezig
              </th>
              <th
                className="px-3 py-3 text-right font-bold text-emerald-400"
                title={KOLOM_TITELS.poulepunten}
              >
                Poulept
              </th>
              <th
                className="px-3 py-3 text-right font-bold text-sky-400"
                title={KOLOM_TITELS.winnaarsrondeLegsGewonnen}
              >
                Legs W+
              </th>
              <th
                className="px-3 py-3 text-right font-bold text-sky-400/70"
                title={KOLOM_TITELS.winnaarsrondeLegsVerloren}
              >
                Legs W−
              </th>
              <th
                className="px-3 py-3 text-right font-bold text-violet-400"
                title={KOLOM_TITELS.verliezersrondeLegsGewonnen}
              >
                Legs V+
              </th>
              <th
                className="px-3 py-3 text-right font-bold text-violet-400/70"
                title={KOLOM_TITELS.verliezersrondeLegsVerloren}
              >
                Legs V−
              </th>
              <th
                className="px-3 py-3 text-right font-bold text-orange-400"
                title={KOLOM_TITELS.hoogsteFinish}
              >
                Hoogste uitgooi
              </th>
              <th
                className="px-3 py-3 text-right font-bold text-amber-400"
                title={KOLOM_TITELS.aantal180s}
              >
                180&apos;s
              </th>
              <th
                className="px-3 py-3 text-right font-bold text-white"
                title={KOLOM_TITELS.punten}
              >
                Punten totaal
              </th>
              {toonBestuurskolommen && (
                <>
                  <th
                    className="px-3 py-3 text-right font-bold text-zinc-400"
                    title="Punten behaald ná de officiële tussenstand"
                  >
                    Nieuw
                  </th>
                  <th
                    className="px-3 py-3 text-right font-bold text-zinc-400"
                    title="Positie op de officiële tussenstand"
                  >
                    Off. #
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
                    className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-xs font-bold lg:h-8 lg:text-sm ${
                      rij.positie <= 3
                        ? "bg-red-700 text-white"
                        : "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    {ranglijstMedaille(rij.positie)}
                  </span>
                </td>
                <td className="px-3 py-2 font-semibold text-white lg:px-4 lg:py-3">
                  <Link
                    href={mijnPoulePad(rij.naam)}
                    className="hover:text-red-300 hover:underline"
                  >
                    {rij.naam}
                  </Link>
                  {highlightNaam === rij.naam && (
                    <span className="ml-1 text-xs text-red-400">(jij)</span>
                  )}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-zinc-300">
                  {rij.aanwezig}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-emerald-400">
                  {formatPunten(rij.poulepunten)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-sky-300">
                  {rij.winnaarsrondeLegsGewonnen}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-sky-300/70">
                  {rij.winnaarsrondeLegsVerloren}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-violet-300">
                  {rij.verliezersrondeLegsGewonnen}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-violet-300/70">
                  {rij.verliezersrondeLegsVerloren}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-orange-400">
                  {rij.hoogsteFinish > 0 ? rij.hoogsteFinish : "—"}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-amber-400">
                  {rij.aantal180s}
                </td>
                <td className="px-3 py-3 text-right font-bold tabular-nums text-red-400">
                  {formatPunten(rij.punten)}
                </td>
                {toonBestuurskolommen && (
                  <>
                    <td className="px-3 py-3 text-right tabular-nums text-zinc-400">
                      {rij.nieuwePunten > 0
                        ? `+${formatPunten(rij.nieuwePunten)}`
                        : "—"}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-zinc-400">
                      {rij.officielePositie ?? "—"}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-zinc-700 bg-zinc-900/60 text-xs font-semibold">
              <td className="px-3 py-3 lg:px-4" />
              <td className="px-3 py-3 text-zinc-400 lg:px-4">
                Totaal ({stand.length} spelers)
              </td>
              <td className="px-3 py-3 text-right tabular-nums text-zinc-300">
                {totalen.aanwezig}
              </td>
              <td className="px-3 py-3 text-right tabular-nums text-emerald-400">
                {formatPunten(totalen.poulepunten)}
              </td>
              <td className="px-3 py-3 text-right tabular-nums text-sky-300">
                {totalen.winnaarsrondeLegsGewonnen}
              </td>
              <td className="px-3 py-3 text-right tabular-nums text-sky-300/70">
                {totalen.winnaarsrondeLegsVerloren}
              </td>
              <td className="px-3 py-3 text-right tabular-nums text-violet-300">
                {totalen.verliezersrondeLegsGewonnen}
              </td>
              <td className="px-3 py-3 text-right tabular-nums text-violet-300/70">
                {totalen.verliezersrondeLegsVerloren}
              </td>
              <td className="px-3 py-3" />
              <td className="px-3 py-3 text-right tabular-nums text-amber-400">
                {totalen.aantal180s}
              </td>
              <td className="px-3 py-3 text-right tabular-nums text-red-400">
                {formatPunten(totalen.punten)}
              </td>
              {toonBestuurskolommen && (
                <>
                  <td className="px-3 py-3" />
                  <td className="px-3 py-3" />
                </>
              )}
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="mt-3 text-xs text-zinc-500">
        Legs W+ / W− = gewonnen en verloren legs in de winnaarsronde, Legs V+ /
        V− = idem in de verliezersronde.
      </p>
    </>
  );
}
