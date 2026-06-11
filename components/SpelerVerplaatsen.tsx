"use client";

import { useState } from "react";
import ProtectedAction from "@/components/ProtectedAction";
import { useSpeelavond } from "@/context/SpeelavondContext";

export default function SpelerVerplaatsen() {
  const { borden, verplaatsSpeler } = useSpeelavond();
  const [speler, setSpeler] = useState("");
  const [vanBord, setVanBord] = useState("");
  const [naarBord, setNaarBord] = useState("");

  if (borden.length < 2) return null;

  const alleSpelers = [...new Set(borden.flatMap((b) => b.spelers))];

  return (
    <ProtectedAction>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <h3 className="mb-3 text-sm font-bold text-white">Speler verplaatsen</h3>
        <div className="grid gap-2 sm:grid-cols-3">
          <select
            value={speler}
            onChange={(e) => {
              setSpeler(e.target.value);
              const bord = borden.find((b) => b.spelers.includes(e.target.value));
              if (bord) setVanBord(bord.naam);
            }}
            className="min-h-11 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-sm text-white"
            aria-label="Speler"
          >
            <option value="">Speler…</option>
            {alleSpelers.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={naarBord}
            onChange={(e) => setNaarBord(e.target.value)}
            className="min-h-11 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-sm text-white"
            aria-label="Naar bord"
          >
            <option value="">Naar bord…</option>
            {borden
              .filter((b) => b.naam !== vanBord)
              .map((b) => (
                <option key={b.naam} value={b.naam}>
                  {b.naam} ({b.spelers.length} spelers)
                </option>
              ))}
          </select>
          <button
            type="button"
            disabled={!speler || !vanBord || !naarBord}
            onClick={() => {
              verplaatsSpeler(speler, vanBord, naarBord);
              setSpeler("");
              setNaarBord("");
            }}
            className="min-h-11 rounded-xl bg-red-700 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
          >
            Verplaats
          </button>
        </div>
      </div>
    </ProtectedAction>
  );
}
