"use client";

import { useState } from "react";
import { formatWedstrijd } from "@/lib/competition";
import { isGeldigeFinish } from "@/lib/scoring";
import type { Wedstrijd } from "@/types/competition";
import type { WedstrijdUpdate } from "@/lib/competition";
import { toast } from "@/lib/ui-feedback";
import Numpad from "@/components/ui/Numpad";

interface MobileScoreEntryProps {
  bordNaam: string;
  wedstrijd: Wedstrijd;
  onClose: () => void;
  onSave: (updates: WedstrijdUpdate) => void;
}

export default function MobileScoreEntry({
  bordNaam,
  wedstrijd,
  onClose,
  onSave,
}: MobileScoreEntryProps) {
  const [score1, setScore1] = useState(wedstrijd.score1);
  const [score2, setScore2] = useState(wedstrijd.score2);
  const [aantal180Speler1, setAantal180Speler1] = useState(
    wedstrijd.aantal180Speler1
  );
  const [aantal180Speler2, setAantal180Speler2] = useState(
    wedstrijd.aantal180Speler2
  );
  const [hoogsteFinishSpeler1, setHoogsteFinishSpeler1] = useState<
    number | null
  >(wedstrijd.hoogsteFinishSpeler1);
  const [hoogsteFinishSpeler2, setHoogsteFinishSpeler2] = useState<
    number | null
  >(wedstrijd.hoogsteFinishSpeler2);
  const [gespeeld, setGespeeld] = useState(wedstrijd.gespeeld);
  const [activeScore, setActiveScore] = useState<"score1" | "score2" | null>(
    null
  );
  const [useNumpad, setUseNumpad] = useState(true);

  const clampScore = (waarde: string) =>
    Math.max(0, Math.min(9, parseInt(waarde, 10) || 0));

  const clamp180 = (waarde: string) =>
    Math.max(0, Math.min(20, parseInt(waarde, 10) || 0));

  const handleFinish = (waarde: string, setter: (v: number | null) => void) => {
    if (!waarde) {
      setter(null);
      return;
    }
    const nummer = parseInt(waarde, 10);
    if (isGeldigeFinish(nummer)) setter(nummer);
  };

  const handleOpslaan = () => {
    onSave({
      score1,
      score2,
      aantal180Speler1,
      aantal180Speler2,
      hoogsteFinishSpeler1,
      hoogsteFinishSpeler2,
      gespeeld,
    });
    if (navigator.vibrate) navigator.vibrate(30);
    toast("✓ Uitslag opgeslagen", "success");
  };

  const voornaam1 = wedstrijd.speler1.split(" ")[0];
  const voornaam2 = wedstrijd.speler2.split(" ")[0];

  return (
    <div className="fixed inset-0 z-[160] flex flex-col bg-black/90 lg:items-center lg:justify-center lg:p-6">
      <div className="flex min-h-0 flex-1 flex-col bg-zinc-950 lg:max-h-[90vh] lg:max-w-lg lg:flex-none lg:rounded-2xl lg:border lg:border-zinc-800">
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <div>
            <p className="text-xs text-zinc-500">{bordNaam}</p>
            <p className="text-sm font-bold text-white">
              {formatWedstrijd(wedstrijd)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 min-w-12 rounded-xl border border-zinc-700 text-lg text-zinc-300 hover:bg-zinc-900"
            aria-label="Sluiten"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-3 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setUseNumpad(true)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold ${useNumpad ? "bg-red-700 text-white" : "bg-zinc-800 text-zinc-400"}`}
            >
              Numpad
            </button>
            <button
              type="button"
              onClick={() => setUseNumpad(false)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold ${!useNumpad ? "bg-red-700 text-white" : "bg-zinc-800 text-zinc-400"}`}
            >
              Toetsenbord
            </button>
          </div>

          {useNumpad && activeScore ? (
            <div className="space-y-4">
              <Numpad
                label={activeScore === "score1" ? voornaam1 : voornaam2}
                value={activeScore === "score1" ? score1 : score2}
                onChange={(v) =>
                  activeScore === "score1" ? setScore1(v) : setScore2(v)
                }
              />
              <button
                type="button"
                onClick={() => setActiveScore(null)}
                className="min-h-11 w-full rounded-xl border border-zinc-700 text-sm text-zinc-300"
              >
                Terug naar overzicht
              </button>
            </div>
          ) : (
          <div className="flex items-center justify-center gap-4 py-4">
            <div className="flex flex-col items-center gap-2">
              <span className="max-w-[100px] truncate text-sm font-semibold text-white">
                {voornaam1}
              </span>
              {useNumpad ? (
                <button
                  type="button"
                  onClick={() => setActiveScore("score1")}
                  className="flex h-16 w-20 items-center justify-center rounded-2xl border-2 border-red-700 bg-black text-3xl font-bold text-white"
                >
                  {score1}
                </button>
              ) : (
                <input
                  type="number"
                  min={0}
                  max={9}
                  value={score1}
                  onChange={(e) => setScore1(clampScore(e.target.value))}
                  className="h-16 w-20 rounded-2xl border-2 border-red-700 bg-black text-center text-3xl font-bold text-white focus:outline-none"
                  aria-label={`Score ${wedstrijd.speler1}`}
                />
              )}
            </div>
            <span className="text-2xl font-bold text-zinc-600">vs</span>
            <div className="flex flex-col items-center gap-2">
              <span className="max-w-[100px] truncate text-sm font-semibold text-white">
                {voornaam2}
              </span>
              {useNumpad ? (
                <button
                  type="button"
                  onClick={() => setActiveScore("score2")}
                  className="flex h-16 w-20 items-center justify-center rounded-2xl border-2 border-red-700 bg-black text-3xl font-bold text-white"
                >
                  {score2}
                </button>
              ) : (
                <input
                  type="number"
                  min={0}
                  max={9}
                  value={score2}
                  onChange={(e) => setScore2(clampScore(e.target.value))}
                  className="h-16 w-20 rounded-2xl border-2 border-red-700 bg-black text-center text-3xl font-bold text-white focus:outline-none"
                  aria-label={`Score ${wedstrijd.speler2}`}
                />
              )}
            </div>
          </div>
          )}

          {!activeScore && (
          <>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
              <p className="mb-2 truncate text-xs font-bold uppercase text-zinc-500">
                {voornaam1}
              </p>
              <label className="mb-2 flex flex-col gap-1 text-xs text-zinc-400">
                180&apos;s
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={aantal180Speler1}
                  onChange={(e) =>
                    setAantal180Speler1(clamp180(e.target.value))
                  }
                  className="min-h-12 rounded-lg border border-zinc-700 bg-black px-3 text-center text-lg text-white"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-zinc-400">
                Hoogste finish
                <input
                  type="number"
                  min={100}
                  max={170}
                  value={hoogsteFinishSpeler1 ?? ""}
                  placeholder="—"
                  onChange={(e) =>
                    handleFinish(e.target.value, setHoogsteFinishSpeler1)
                  }
                  className="min-h-12 rounded-lg border border-zinc-700 bg-black px-3 text-center text-lg text-white"
                />
              </label>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
              <p className="mb-2 truncate text-xs font-bold uppercase text-zinc-500">
                {voornaam2}
              </p>
              <label className="mb-2 flex flex-col gap-1 text-xs text-zinc-400">
                180&apos;s
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={aantal180Speler2}
                  onChange={(e) =>
                    setAantal180Speler2(clamp180(e.target.value))
                  }
                  className="min-h-12 rounded-lg border border-zinc-700 bg-black px-3 text-center text-lg text-white"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-zinc-400">
                Hoogste finish
                <input
                  type="number"
                  min={100}
                  max={170}
                  value={hoogsteFinishSpeler2 ?? ""}
                  placeholder="—"
                  onChange={(e) =>
                    handleFinish(e.target.value, setHoogsteFinishSpeler2)
                  }
                  className="min-h-12 rounded-lg border border-zinc-700 bg-black px-3 text-center text-lg text-white"
                />
              </label>
            </div>
          </div>

          <label className="mt-4 flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4">
            <input
              type="checkbox"
              checked={gespeeld}
              onChange={(e) => setGespeeld(e.target.checked)}
              className="h-6 w-6 rounded accent-red-600"
            />
            <span className="font-semibold text-white">Wedstrijd gespeeld</span>
          </label>
          {gespeeld && score1 === score2 && (
            <p className="mt-2 text-center text-xs text-zinc-400">
              Gelijkspel — geen winnaar, wel bonuspunten mogelijk
            </p>
          )}
          </>
          )}
        </div>

        <div className="border-t border-zinc-800 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={handleOpslaan}
            className="min-h-14 w-full rounded-2xl bg-red-700 text-lg font-bold text-white shadow-lg shadow-red-900/40 hover:bg-red-600 active:scale-[0.99]"
          >
            Opslaan
          </button>
        </div>
      </div>
    </div>
  );
}
