"use client";

import { formatWedstrijd } from "@/lib/competition";
import type { Bord } from "@/types/competition";

interface CompetitionBoardProps {
  bord: Bord;
  compact?: boolean;
}

export default function CompetitionBoard({
  bord,
  compact = false,
}: CompetitionBoardProps) {
  return (
    <article
      className={`overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-xl lg:rounded-2xl ${
        compact ? "" : ""
      }`}
    >
      <div
        className={`border-b border-zinc-800 bg-gradient-to-r from-red-900/40 to-black ${
          compact ? "px-4 py-3" : "px-6 py-4"
        }`}
      >
        <div className="flex items-center justify-between">
          <h3
            className={`font-bold text-white ${
              compact ? "text-base lg:text-lg" : "text-xl"
            }`}
          >
            🎯 {bord.naam}
          </h3>
          <span className="rounded-full bg-red-700 px-2.5 py-0.5 text-[10px] font-semibold text-white lg:px-3 lg:py-1 lg:text-xs">
            {bord.spelers.length} spelers
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-400 lg:text-sm">
          {bord.wedstrijden.length} wedstrijden
        </p>
      </div>

      <div
        className={`grid gap-4 p-4 ${
          compact ? "grid-cols-1" : "gap-6 p-6 lg:grid-cols-2"
        }`}
      >
        <div>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-red-500 lg:mb-3 lg:text-sm">
            Spelers
          </h4>
          <ul className="space-y-1.5 lg:space-y-2">
            {bord.spelers.map((speler) => (
              <li
                key={speler}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-white lg:px-4 lg:py-2"
              >
                {speler}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-red-500 lg:mb-3 lg:text-sm">
            Wedstrijdschema
          </h4>
          <ul className="space-y-1.5 lg:space-y-2">
            {bord.wedstrijden.map((wedstrijd) => (
              <li
                key={`${wedstrijd.speler1}-${wedstrijd.speler2}`}
                className="rounded-lg border border-zinc-700 bg-black px-3 py-1.5 text-xs text-zinc-200 lg:px-4 lg:py-2 lg:text-sm"
              >
                {formatWedstrijd(wedstrijd)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
