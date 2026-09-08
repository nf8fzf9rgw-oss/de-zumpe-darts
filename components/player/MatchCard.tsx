"use client";

import type { Wedstrijd } from "@/types/competition";
import {
  wedstrijdUitslagTekst,
  wedstrijdWeergaveStatus,
} from "@/lib/wedstrijd-overzicht";
import { namenZijnGelijk } from "@/lib/namen";

interface MatchCardProps {
  wedstrijd: Wedstrijd;
  bordNaam: string;
  onOpen?: () => void;
  compact?: boolean;
  volgnummer?: number;
  perspectiefNaam?: string;
  onSpelerKlik?: (naam: string) => void;
}

export default function MatchCard({
  wedstrijd,
  bordNaam,
  onOpen,
  compact = false,
  volgnummer,
  perspectiefNaam,
  onSpelerKlik,
}: MatchCardProps) {
  const status = wedstrijdWeergaveStatus(wedstrijd, perspectiefNaam);
  const uitslag = wedstrijdUitslagTekst(wedstrijd);
  const randClass =
    status.key === "gewonnen" || status.key === "gespeeld"
      ? "border-green-900/50 bg-green-950/20"
      : status.key === "verloren"
        ? "border-red-900/40 bg-red-950/10"
        : status.key === "bezig"
          ? "border-red-800/60 bg-red-950/20"
          : "border-zinc-800 bg-zinc-900 hover:border-red-800/40";

  const renderNaam = (naam: string) => {
    const isPerspectief =
      Boolean(perspectiefNaam) && namenZijnGelijk(naam, perspectiefNaam ?? "");
    const classes = `rounded-md px-0.5 ${
      isPerspectief ? "font-bold text-white" : "text-white"
    } ${onSpelerKlik ? "cursor-pointer hover:text-red-300 hover:underline" : ""}`;

    if (!onSpelerKlik) {
      return <span className={classes}>{naam}</span>;
    }

    return (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onSpelerKlik(naam);
        }}
        className={classes}
      >
        {naam}
      </button>
    );
  };

  return (
    <article
      className={`w-full rounded-xl border text-left transition ${randClass} ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {volgnummer != null && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Wedstrijd {volgnummer}
            </p>
          )}
          <p
            className={`font-semibold ${compact ? "text-sm" : "text-base"}`}
          >
            {renderNaam(wedstrijd.speler1)}
            <span className="mx-1.5 font-normal text-zinc-500">vs</span>
            {renderNaam(wedstrijd.speler2)}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">{bordNaam}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${status.badgeClass}`}
          title={status.label}
        >
          {status.icoon} {status.label}
        </span>
      </div>

      {uitslag && (
        <p
          className={`mt-2 text-sm font-bold ${
            status.key === "verloren" ? "text-red-300" : "text-green-400"
          }`}
        >
          {uitslag}
        </p>
      )}

      {onOpen && (
        <button
          type="button"
          onClick={onOpen}
          className="mt-2 min-h-11 w-full rounded-lg text-left text-xs font-semibold text-red-400 hover:text-red-300"
        >
          {wedstrijd.gespeeld
            ? "Tik om uitslag te bekijken of aan te passen →"
            : "Tik om uitslag in te voeren →"}
        </button>
      )}
    </article>
  );
}
