"use client";

import {
  COMFORTABEL_MAX_SPELERS,
  MIN_SPELERS_PER_BORD,
  berekenBordVerdeling,
} from "@/lib/competition";

interface SpelersTellerProps {
  aantal: number;
  label?: string;
  className?: string;
}

/** Toont "10/30" tijdens het aanmelden, met de bordverdeling die daarbij hoort. */
export default function SpelersTeller({
  aantal,
  label = "Aangemeld",
  className = "",
}: SpelersTellerProps) {
  const teVeel = aantal > COMFORTABEL_MAX_SPELERS;
  const percentage = Math.min(
    100,
    Math.round((aantal / COMFORTABEL_MAX_SPELERS) * 100)
  );
  const verdeling = berekenBordVerdeling(aantal);

  let toelichting: string;
  if (aantal < MIN_SPELERS_PER_BORD) {
    toelichting = `Nog minimaal ${MIN_SPELERS_PER_BORD - aantal} speler(s) nodig`;
  } else if (teVeel) {
    toelichting = `Meer dan ${COMFORTABEL_MAX_SPELERS} spelers — borden worden voller dan 5`;
  } else if (verdeling) {
    toelichting = `${verdeling.length} ${
      verdeling.length === 1 ? "bord" : "borden"
    }: ${verdeling.join(" + ")}`;
  } else {
    toelichting = "Te veel spelers voor een verdeling";
  }

  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        teVeel
          ? "border-red-800 bg-red-950/40"
          : "border-zinc-800 bg-zinc-900"
      } ${className}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          {label}
        </span>
        <span className="text-2xl font-bold tabular-nums text-white">
          {aantal}
          <span className="text-base font-semibold text-zinc-500">
            /{COMFORTABEL_MAX_SPELERS}
          </span>
        </span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all ${
            teVeel ? "bg-red-500" : "bg-red-600"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-zinc-400">{toelichting}</p>
    </div>
  );
}
