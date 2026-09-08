"use client";

import { berekenAvondScores } from "@/lib/player-of-evening";
import { useSpeelavond } from "@/context/SpeelavondContext";
import { formatPunten } from "@/lib/format";

export default function SpelerVanDeAvondBanner() {
  const { spelerVanDeAvond, borden } = useSpeelavond();

  if (!spelerVanDeAvond || borden.length === 0) return null;

  const score = berekenAvondScores(borden).find(
    (rij) => rij.naam === spelerVanDeAvond
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-4 scoreboard-stripe lg:px-6 lg:py-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-500">
        🏆 Speler van de Avond
      </p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-white lg:text-3xl">
        {spelerVanDeAvond}
      </p>
      {score && (
        <p className="mt-2 text-sm text-zinc-400">
          <span className="stat-number text-lg font-bold text-white">
            {formatPunten(score.totaal)}
          </span>{" "}
          punten vanavond · {score.overwinningen} wins · {score.bonus180} × 180
        </p>
      )}
    </section>
  );
}
