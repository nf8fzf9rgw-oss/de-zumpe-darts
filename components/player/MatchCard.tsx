"use client";

import type { Wedstrijd } from "@/types/competition";
import {
  wedstrijdPrestatieRegels,
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
  const prestaties = wedstrijdPrestatieRegels(wedstrijd);
  const randClass =
    status.key === "gewonnen"
      ? "border-red-600/70 bg-red-950/20"
      : status.key === "bezig"
        ? "border-red-600/70 bg-red-950/25 scoreboard-stripe"
        : "border-zinc-800 bg-zinc-900 hover:border-red-800/50";

  const renderNaam = (naam: string, groot = false) => {
    const isPerspectief =
      Boolean(perspectiefNaam) && namenZijnGelijk(naam, perspectiefNaam ?? "");
    const classes = `${groot ? "text-base font-bold lg:text-lg" : "font-semibold"} ${
      isPerspectief ? "text-white" : "text-zinc-100"
    } ${onSpelerKlik ? "cursor-pointer hover:text-red-300" : ""}`;

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
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
          {volgnummer != null ? `Wedstrijd ${volgnummer}` : "Wedstrijd"}
        </p>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${status.badgeClass}`}
          title={status.label}
        >
          {status.icoon} {status.label}
        </span>
      </div>

      {compact ? (
        <div className="mt-2">
          <p className="font-semibold">
            {renderNaam(wedstrijd.speler1)}
          </p>
          <p
            className={`stat-number my-1 text-2xl font-bold ${
              status.key === "bezig" ? "text-red-500" : "text-white"
            }`}
          >
            {wedstrijd.score1} — {wedstrijd.score2}
          </p>
          <p className="font-semibold">{renderNaam(wedstrijd.speler2)}</p>
        </div>
      ) : (
        <div className="mt-2 space-y-0.5">
          {renderNaam(wedstrijd.speler1, true)}
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            vs
          </p>
          {renderNaam(wedstrijd.speler2, true)}
        </div>
      )}

      {wedstrijd.teller && (
        <p className="mt-2 text-xs text-zinc-300">
          🧑‍⚖️ Teller: <span className="font-semibold text-white">{wedstrijd.teller}</span>
        </p>
      )}

      <p className="mt-1 text-xs text-zinc-500">{bordNaam}</p>

      {uitslag && !compact && (
        <>
          {!wedstrijd.bye && (
            <p
              className={`stat-number mt-2 text-xl font-bold lg:text-2xl ${
                status.key === "gewonnen" ? "text-red-400" : "text-white"
              }`}
            >
              {wedstrijd.score1} — {wedstrijd.score2}
            </p>
          )}
          <p className="mt-0.5 text-xs text-zinc-400">{uitslag}</p>
        </>
      )}

      {prestaties.length > 0 && (
        <ul className="mt-2 space-y-0.5">
          {prestaties.map((regel) => (
            <li key={regel} className="text-xs text-zinc-300">
              {regel}
            </li>
          ))}
        </ul>
      )}

      {onOpen && (
        <button
          type="button"
          onClick={onOpen}
          className="mt-2 min-h-11 w-full rounded-lg text-left text-xs font-semibold text-red-400 hover:text-red-300"
        >
          {wedstrijd.gespeeld
            ? "Uitslag bekijken of aanpassen →"
            : "Uitslag invoeren →"}
        </button>
      )}
    </article>
  );
}
