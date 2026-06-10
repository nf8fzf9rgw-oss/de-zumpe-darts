"use client";

import MatchResultEntry from "@/components/MatchResultEntry";
import { useSpeelavond } from "@/context/SpeelavondContext";
import type { Bord, BordStatus } from "@/types/competition";

interface CompetitionBoardProps {
  bord: Bord;
  compact?: boolean;
  toonUitslagen?: boolean;
}

const STATUS_LABELS: Record<BordStatus, { label: string; kleur: string }> = {
  wachtend: { label: "Wachtend", kleur: "bg-zinc-700" },
  actief: { label: "Actief", kleur: "bg-amber-600" },
  voltooid: { label: "Voltooid", kleur: "bg-green-700" },
};

export default function CompetitionBoard({
  bord,
  compact = false,
  toonUitslagen = true,
}: CompetitionBoardProps) {
  const { updateWedstrijd } = useSpeelavond();
  const status = STATUS_LABELS[bord.status];
  const gespeeld = bord.wedstrijden.filter((w) => w.gespeeld).length;

  return (
    <article className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-xl lg:rounded-2xl">
      <div
        className={`border-b border-zinc-800 bg-gradient-to-r from-red-900/40 to-black ${
          compact ? "px-4 py-3" : "px-6 py-4"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <h3
            className={`font-bold text-white ${
              compact ? "text-base lg:text-lg" : "text-xl"
            }`}
          >
            <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-600 bg-black text-sm">
              🎯
            </span>
            {bord.naam}
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white lg:px-3 lg:py-1 lg:text-xs ${status.kleur}`}
            >
              {status.label}
            </span>
            <span className="rounded-full bg-red-700 px-2.5 py-0.5 text-[10px] font-semibold text-white lg:px-3 lg:py-1 lg:text-xs">
              {bord.spelers.length} spelers
            </span>
          </div>
        </div>
        <p className="mt-1 text-xs text-zinc-400 lg:text-sm">
          {gespeeld}/{bord.wedstrijden.length} wedstrijden gespeeld
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
            {toonUitslagen ? "Wedstrijden & uitslagen" : "Wedstrijdschema"}
          </h4>
          {toonUitslagen ? (
            <div className="space-y-2">
              {bord.wedstrijden.map((wedstrijd) => (
                <MatchResultEntry
                  key={wedstrijd.id}
                  wedstrijd={wedstrijd}
                  compact={compact}
                  onUpdate={(updates) =>
                    updateWedstrijd(bord.naam, wedstrijd.id, updates)
                  }
                />
              ))}
            </div>
          ) : (
            <ul className="space-y-1.5 lg:space-y-2">
              {bord.wedstrijden.map((wedstrijd) => (
                <li
                  key={wedstrijd.id}
                  className="rounded-lg border border-zinc-700 bg-black px-3 py-1.5 text-xs text-zinc-200 lg:px-4 lg:py-2 lg:text-sm"
                >
                  {wedstrijd.speler1} vs {wedstrijd.speler2}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}
