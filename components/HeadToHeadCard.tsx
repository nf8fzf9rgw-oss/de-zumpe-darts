"use client";

import { berekenHeadToHead } from "@/lib/head-to-head";
import { useSpeelavond } from "@/context/SpeelavondContext";

interface HeadToHeadCardProps {
  spelerA: string;
  spelerB: string;
}

export default function HeadToHeadCard({
  spelerA,
  spelerB,
}: HeadToHeadCardProps) {
  const { seizoenHistorie, borden, laatsteOpslag } = useSpeelavond();
  const h2h = berekenHeadToHead(
    spelerA,
    spelerB,
    seizoenHistorie,
    borden,
    laatsteOpslag
  );

  if (h2h.ontmoetingen === 0) {
    return (
      <p className="text-xs text-zinc-500">
        {spelerA} vs {spelerB} · nog geen onderlinge wedstrijden
      </p>
    );
  }

  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2.5">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Onderling
      </p>
      <p className="mt-1 text-sm font-semibold text-white">
        {spelerA} vs {spelerB}
      </p>
      <p className="mt-1 text-xs text-zinc-400">
        {h2h.ontmoetingen} ontmoetingen · {spelerA.split(" ")[0]} won {h2h.winstA} ·{" "}
        {spelerB.split(" ")[0]} won {h2h.winstB}
      </p>
    </article>
  );
}
