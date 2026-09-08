"use client";

import ProtectedAction from "@/components/ProtectedAction";
import { geldigeTellers } from "@/lib/wedstrijd-planning";
import type { Wedstrijd } from "@/types/competition";

interface TellerRegelProps {
  wedstrijd: Wedstrijd;
  kandidaten?: string[];
  onWijzig?: (teller: string) => void;
  toonLabel?: boolean;
}

export default function TellerRegel({
  wedstrijd,
  kandidaten = [],
  onWijzig,
  toonLabel = true,
}: TellerRegelProps) {
  if (wedstrijd.bye) return null;
  const opties = geldigeTellers(wedstrijd, kandidaten);

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-300">
      {toonLabel && (
        <p>
          🧑‍⚖️ Teller:{" "}
          <span className="font-semibold text-white">
            {wedstrijd.teller ?? "Nog niet bepaald"}
          </span>
        </p>
      )}
      {onWijzig && opties.length > 0 && (
        <ProtectedAction>
          <label className="inline-flex items-center gap-1 text-xs text-zinc-400">
            Wijzigen
            <select
              value={wedstrijd.teller ?? ""}
              onChange={(event) => onWijzig(event.target.value)}
              className="min-h-9 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-white"
              aria-label="Teller wijzigen"
            >
              {opties.map((naam) => (
                <option key={naam} value={naam}>
                  {naam}
                </option>
              ))}
            </select>
          </label>
        </ProtectedAction>
      )}
    </div>
  );
}
