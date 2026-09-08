"use client";

import { namenZijnGelijk } from "@/lib/namen";

interface PouleSpelerLijstProps {
  spelers: string[];
  actieveNaam: string;
  eigenNaam: string;
  onSelecteer: (naam: string) => void;
}

export default function PouleSpelerLijst({
  spelers,
  actieveNaam,
  eigenNaam,
  onSelecteer,
}: PouleSpelerLijstProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-red-500">
        Spelers
      </h3>
      <p className="mt-1 text-xs text-zinc-500">
        Tik op een naam om direct diens wedstrijden te zien.
      </p>
      <ul className="mt-3 space-y-2">
        {spelers.map((speler) => {
          const isActief = namenZijnGelijk(speler, actieveNaam);
          const isEigen =
            eigenNaam !== "" && namenZijnGelijk(speler, eigenNaam);

          return (
            <li key={speler}>
              <button
                type="button"
                onClick={() => onSelecteer(speler)}
                aria-pressed={isActief}
                className={`flex min-h-12 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition active:scale-[0.99] ${
                  isActief
                    ? "border-red-600 bg-red-950/50 font-bold text-white"
                    : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-red-800/60 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <span className="truncate">{speler}</span>
                <span className="flex shrink-0 items-center gap-1.5 text-zinc-500">
                  {isEigen && (
                    <span className="rounded-full bg-red-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      Jij
                    </span>
                  )}
                  <span aria-hidden>{isActief ? "●" : "→"}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
