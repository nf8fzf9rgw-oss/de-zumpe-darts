"use client";

import { formatWedstrijd } from "@/lib/competition";
import { isGeldigeFinish } from "@/lib/scoring";
import type { Wedstrijd } from "@/types/competition";
import type { WedstrijdUpdate } from "@/lib/competition";

interface MatchResultEntryProps {
  wedstrijd: Wedstrijd;
  onUpdate: (updates: WedstrijdUpdate) => void;
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

  const handle180 = (veld: "aantal180Speler1" | "aantal180Speler2", waarde: string) => {
    const nummer = Math.max(0, Math.min(20, parseInt(waarde, 10) || 0));
    onUpdate({ [veld]: nummer });
  };

  const handleFinish = (
    veld: "hoogsteFinishSpeler1" | "hoogsteFinishSpeler2",
    waarde: string
  ) => {
    const nummer = parseInt(waarde, 10);
    if (!waarde) {
      onUpdate({ [veld]: null });
      return;
    }
    if (isGeldigeFinish(nummer)) {
      onUpdate({ [veld]: nummer });
    }
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
        <p className={`font-semibold text-white ${compact ? "text-sm" : "text-base"}`}>
          {formatWedstrijd(wedstrijd)}
        </p>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-zinc-400">
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
          <span className="max-w-[100px] truncate text-xs text-zinc-400 sm:text-sm">
            {wedstrijd.speler1.split(" ")[0]}
          </span>
          <input
            type="number"
            min={0}
            max={9}
            value={wedstrijd.score1}
            onChange={(e) => handleScore("score1", e.target.value)}
            className="h-11 w-14 rounded-lg border border-zinc-700 bg-black px-2 text-center text-lg font-bold text-white focus:border-red-600 focus:outline-none"
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
            className="h-11 w-14 rounded-lg border border-zinc-700 bg-black px-2 text-center text-lg font-bold text-white focus:border-red-600 focus:outline-none"
            aria-label={`Score ${wedstrijd.speler2}`}
          />
          <span className="max-w-[100px] truncate text-xs text-zinc-400 sm:text-sm">
            {wedstrijd.speler2.split(" ")[0]}
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-zinc-800 bg-black/50 p-2">
          <p className="mb-1 truncate text-[10px] font-semibold uppercase text-zinc-500">
            {wedstrijd.speler1.split(" ")[0]}
          </p>
          <div className="flex gap-2">
            <label className="flex flex-1 flex-col gap-0.5 text-[10px] text-zinc-500">
              180&apos;s
              <input
                type="number"
                min={0}
                max={20}
                value={wedstrijd.aantal180Speler1}
                onChange={(e) => handle180("aantal180Speler1", e.target.value)}
                className="h-9 rounded border border-zinc-700 bg-zinc-900 px-2 text-center text-sm text-white"
              />
            </label>
            <label className="flex flex-1 flex-col gap-0.5 text-[10px] text-zinc-500">
              Finish
              <input
                type="number"
                min={100}
                max={170}
                value={wedstrijd.hoogsteFinishSpeler1 ?? ""}
                placeholder="—"
                onChange={(e) => handleFinish("hoogsteFinishSpeler1", e.target.value)}
                className="h-9 rounded border border-zinc-700 bg-zinc-900 px-2 text-center text-sm text-white"
              />
            </label>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-black/50 p-2">
          <p className="mb-1 truncate text-[10px] font-semibold uppercase text-zinc-500">
            {wedstrijd.speler2.split(" ")[0]}
          </p>
          <div className="flex gap-2">
            <label className="flex flex-1 flex-col gap-0.5 text-[10px] text-zinc-500">
              180&apos;s
              <input
                type="number"
                min={0}
                max={20}
                value={wedstrijd.aantal180Speler2}
                onChange={(e) => handle180("aantal180Speler2", e.target.value)}
                className="h-9 rounded border border-zinc-700 bg-zinc-900 px-2 text-center text-sm text-white"
              />
            </label>
            <label className="flex flex-1 flex-col gap-0.5 text-[10px] text-zinc-500">
              Finish
              <input
                type="number"
                min={100}
                max={170}
                value={wedstrijd.hoogsteFinishSpeler2 ?? ""}
                placeholder="—"
                onChange={(e) => handleFinish("hoogsteFinishSpeler2", e.target.value)}
                className="h-9 rounded border border-zinc-700 bg-zinc-900 px-2 text-center text-sm text-white"
              />
            </label>
          </div>
        </div>
      </div>

      {wedstrijd.gespeeld && wedstrijd.winnaar && (
        <p className="mt-2 text-xs font-semibold text-green-400">
          Winnaar: {wedstrijd.winnaar}
        </p>
      )}
    </div>
  );
}
