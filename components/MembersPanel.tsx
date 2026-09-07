"use client";

import { useMemo, useState } from "react";
import { useSpeelavond } from "@/context/SpeelavondContext";
import { haalHistorischeSpeler } from "@/lib/historische-tussenstand";

interface MembersPanelProps {
  variant?: "default" | "desktop";
}

export default function MembersPanel({
  variant = "default",
}: MembersPanelProps) {
  const {
    leden,
    aanwezigen,
    toggleLid,
    selecteerAlleLeden,
    deselecteerAlleLeden,
    actiefSeizoen,
  } = useSpeelavond();
  const [zoekterm, setZoekterm] = useState("");

  const gefilterdeLeden = useMemo(
    () =>
      leden.filter((lid) =>
        lid.toLowerCase().includes(zoekterm.toLowerCase())
      ),
    [leden, zoekterm]
  );

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl lg:rounded-2xl lg:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">Leden</h3>
          <p className="mt-1 text-sm text-zinc-400">
            {aanwezigen.length} van {leden.length} geselecteerd
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={selecteerAlleLeden}
            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            Selecteer alles
          </button>
          <button
            type="button"
            onClick={deselecteerAlleLeden}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-900"
          >
            Deselecteer alles
          </button>
        </div>
      </div>

      <input
        value={zoekterm}
        onChange={(event) => setZoekterm(event.target.value)}
        placeholder="Zoek speler..."
        className="mb-4 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-red-600 focus:outline-none"
      />

      <div
        className={`space-y-2 overflow-y-auto pr-1 ${
          variant === "desktop"
            ? "max-h-[420px] lg:max-h-[calc(100vh-18rem)]"
            : "max-h-[420px] lg:max-h-[calc(100vh-18rem)]"
        }`}
      >
        {gefilterdeLeden.map((lid) => {
          const isAanwezig = aanwezigen.includes(lid);
          const officieel = haalHistorischeSpeler(actiefSeizoen, lid);
          return (
            <button
              key={lid}
              type="button"
              onClick={() => toggleLid(lid)}
              className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition active:scale-[0.98] ${
                isAanwezig
                  ? "bg-red-700 text-white shadow-lg shadow-red-900/30"
                  : "bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              <span>{lid}</span>
              <span className="flex shrink-0 items-center gap-2">
                {officieel && (
                  <span
                    className={`text-xs ${
                      isAanwezig ? "text-white/70" : "text-zinc-500"
                    }`}
                    title="Positie op de officiële tussenstand"
                  >
                    #{officieel.positie}
                  </span>
                )}
                <span>{isAanwezig ? "☑" : "☐"}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
