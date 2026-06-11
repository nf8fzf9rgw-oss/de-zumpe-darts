"use client";

import type { Wedstrijd } from "@/types/competition";

interface MatchCardProps {
  wedstrijd: Wedstrijd;
  bordNaam: string;
  onOpen?: () => void;
  compact?: boolean;
}

export default function MatchCard({
  wedstrijd,
  bordNaam,
  onOpen,
  compact = false,
}: MatchCardProps) {
  const statusIcon = wedstrijd.gespeeld ? "✔" : "⏳";
  const statusLabel = wedstrijd.gespeeld ? "Gespeeld" : "Nog spelen";
  const scoreTekst =
    wedstrijd.gespeeld && wedstrijd.winnaar
      ? `${wedstrijd.score1} – ${wedstrijd.score2}`
      : null;

  const Wrapper = onOpen ? "button" : "div";

  return (
    <Wrapper
      type={onOpen ? "button" : undefined}
      onClick={onOpen}
      className={`w-full rounded-xl border text-left transition ${
        wedstrijd.gespeeld
          ? "border-green-900/50 bg-green-950/20"
          : "border-zinc-800 bg-zinc-900 hover:border-red-800/40"
      } ${onOpen ? "min-h-12 cursor-pointer active:scale-[0.99]" : ""} ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className={`font-semibold text-white ${compact ? "text-sm" : "text-base"}`}>
            {wedstrijd.speler1}
            <span className="mx-1.5 font-normal text-zinc-500">vs</span>
            {wedstrijd.speler2}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">{bordNaam}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
            wedstrijd.gespeeld
              ? "bg-green-900/50 text-green-300"
              : "bg-amber-900/40 text-amber-300"
          }`}
          title={statusLabel}
        >
          {statusIcon} {statusLabel}
        </span>
      </div>

      {scoreTekst && (
        <p className="mt-2 text-sm font-bold text-green-400">
          {scoreTekst}
          {wedstrijd.winnaar && (
            <span className="ml-2 text-xs font-normal text-zinc-400">
              · Winnaar: {wedstrijd.winnaar.split(" ")[0]}
            </span>
          )}
        </p>
      )}

      {onOpen && !wedstrijd.gespeeld && (
        <p className="mt-2 text-xs font-semibold text-red-400">
          Tik om uitslag in te voeren →
        </p>
      )}
    </Wrapper>
  );
}
