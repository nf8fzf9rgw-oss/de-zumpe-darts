"use client";

import { BESCHIKBARE_SEIZOENEN } from "@/lib/seasons";
import { useAuth } from "@/context/AuthContext";
import { useSpeelavond } from "@/context/SpeelavondContext";

export default function SeasonSelector() {
  const { actiefSeizoen, setActiefSeizoen, actiefSeizoenLabel } =
    useSpeelavond();
  const { isBestuur } = useAuth();

  if (!isBestuur) {
    return (
      <p className="text-sm text-zinc-400">
        Seizoen:{" "}
        <span className="font-semibold text-white">{actiefSeizoenLabel}</span>
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="seizoen-select" className="text-sm text-zinc-400">
        Seizoen:
      </label>
      <select
        id="seizoen-select"
        value={actiefSeizoen}
        onChange={(e) => setActiefSeizoen(e.target.value)}
        className="min-h-11 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-semibold text-white focus:border-red-600 focus:outline-none"
      >
        {BESCHIKBARE_SEIZOENEN.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
