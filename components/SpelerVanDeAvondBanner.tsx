"use client";

import { berekenAvondScores } from "@/lib/player-of-evening";
import { useSpeelavond } from "@/context/SpeelavondContext";

export default function SpelerVanDeAvondBanner() {
  const { spelerVanDeAvond, borden } = useSpeelavond();

  if (borden.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 px-4 py-5 lg:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
          🏆 Speler van de avond
        </p>
        <p className="mt-2 text-base text-zinc-400">
          Nog geen speler van de avond bepaald.
        </p>
      </section>
    );
  }

  if (!spelerVanDeAvond) {
    return (
      <section className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 px-4 py-5 lg:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
          🏆 Speler van de avond
        </p>
        <p className="mt-2 text-base text-zinc-400">
          Nog geen speler van de avond bepaald.
        </p>
      </section>
    );
  }

  const score = berekenAvondScores(borden).find(
    (rij) => rij.naam === spelerVanDeAvond
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-4 scoreboard-stripe lg:px-6 lg:py-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-500">
        🏆 SPELER VAN DE AVOND
      </p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-white lg:text-3xl">
        {spelerVanDeAvond}
      </p>
      {score && (
        <ul className="mt-3 space-y-1 text-sm text-zinc-300">
          <li>🎯 {score.overwinningen} gewonnen</li>
          <li>🎯 {score.aantal180s} × 180</li>
          <li>
            💯 Hoogste finish:{" "}
            {score.hoogsteFinish > 0 ? score.hoogsteFinish : "—"}
          </li>
        </ul>
      )}
    </section>
  );
}
