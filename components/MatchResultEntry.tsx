"use client";

import { formatWedstrijd } from "@/lib/competition";
import type { Wedstrijd } from "@/types/competition";

interface MatchResultEntryProps {
  wedstrijd: Wedstrijd;
  onUpdate: (updates: {
    gespeeld?: boolean;
    score1?: number;
    score2?: number;
  }) => void;
  compact?: boolean;
}

export default function MatchResultEntry({
  wedstrijd,
  onUpdate,
  compact = false,
}: MatchResultEntryProps) {
  const handleScore = (veld: "score1" | "score2", waarde: string) => {
    const nummer = Math.max(0, Math.min(9, parseInt(waarde, 10) || 0));
    onUpdate({ [veld]: nummer });
  };

  return (
    <div
      className={`rounded-xl border transition ${
        wedstrijd.gespeeld
          ? "border-green-800/60 bg-green-950/30"
          : "border-zinc-800 bg-zinc-900"
      } ${compact ? "p-3" : "p-4"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p
          className={`font-semibold text-white ${compact ? "text-sm" : "text-base"}`}
        >
          {formatWedstrijd(wedstrijd)}
        </p>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
          <input
            type="checkbox"
            checked={wedstrijd.gespeeld}
            onChange={(e) => onUpdate({ gespeeld: e.target.checked })}
            className="h-5 w-5 rounded border-zinc-600 accent-red-600"
          />
          Gespeeld
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="max-w-[120px] truncate text-xs text-zinc-400 sm:max-w-none sm:text-sm">
            {wedstrijd.speler1.split(" ")[0]}
          </span>
          <input
            type="number"
            min={0}
            max={9}
            value={wedstrijd.score1}
            onChange={(e) => handleScore("score1", e.target.value)}
            className="w-14 rounded-lg border border-zinc-700 bg-black px-2 py-2 text-center text-lg font-bold text-white focus:border-red-600 focus:outline-none"
            aria-label={`Score ${wedstrijd.speler1}`}
          />
        </div>
        <span className="text-zinc-600">—</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={9}
            value={wedstrijd.score2}
            onChange={(e) => handleScore("score2", e.target.value)}
            className="w-14 rounded-lg border border-zinc-700 bg-black px-2 py-2 text-center text-lg font-bold text-white focus:border-red-600 focus:outline-none"
            aria-label={`Score ${wedstrijd.speler2}`}
          />
          <span className="max-w-[120px] truncate text-xs text-zinc-400 sm:max-w-none sm:text-sm">
            {wedstrijd.speler2.split(" ")[0]}
          </span>
        </div>
      </div>

      {wedstrijd.gespeeld && wedstrijd.winnaar && (
        <p className="mt-2 text-xs font-semibold text-green-400">
          Winnaar: {wedstrijd.winnaar}
        </p>
      )}
      {wedstrijd.gespeeld && !wedstrijd.winnaar && (
        <p className="mt-2 text-xs text-amber-400">Gelijkspel — geen punten</p>
      )}
    </div>
  );
}
