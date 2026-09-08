"use client";

import { useSpeelavond } from "@/context/SpeelavondContext";
import type { GrafiekDataPunt } from "@/types/competition";

function StaafGrafiek({
  titel,
  data,
  kleur = "bg-red-600",
}: {
  titel: string;
  data: GrafiekDataPunt[];
  kleur?: string;
}) {
  const max = Math.max(...data.map((d) => d.waarde), 1);

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <h4 className="font-bold text-white">{titel}</h4>
        <p className="mt-4 text-sm text-zinc-500">Nog geen data beschikbaar</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl md:p-6">
      <h4 className="mb-4 font-bold text-white">{titel}</h4>
      <div className="flex items-end gap-1 overflow-x-auto pb-2 sm:gap-2">
        {data.map((punt) => (
          <div
            key={`${titel}-${punt.label}`}
            className="flex min-w-[36px] flex-1 flex-col items-center gap-1"
          >
            <span className="text-[10px] font-semibold text-zinc-300 sm:text-xs">
              {punt.waarde}
            </span>
            <div
              className={`w-full rounded-t-md ${kleur} transition-all`}
              style={{ height: `${Math.max(8, (punt.waarde / max) * 120)}px` }}
              title={`${punt.label}: ${punt.waarde}`}
            />
            <span className="truncate text-[9px] text-zinc-500 sm:text-[10px]">
              {punt.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StatisticsCharts() {
  const { grafieken } = useSpeelavond();

  return (
    <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
      <StaafGrafiek
        titel="Opkomst per avond"
        data={grafieken.opkomstPerAvond}
        kleur="bg-red-600"
      />
      <StaafGrafiek
        titel="Spelersontwikkeling"
        data={grafieken.spelersOntwikkeling}
        kleur="bg-zinc-600"
      />
      <StaafGrafiek
        titel="Wedstrijden per avond"
        data={grafieken.wedstrijdenPerAvond}
        kleur="bg-zinc-600"
      />
    </div>
  );
}
