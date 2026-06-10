"use client";

import { useSpeelavond } from "@/context/SpeelavondContext";

export default function SpeelavondPanel() {
  const { aanwezigen, gasten, laatsteOpslagLabel, dashboardStats } =
    useSpeelavond();

  const items = [
    { label: "Aanwezige leden", value: aanwezigen.length },
    { label: "Gastspelers", value: gasten.length },
    { label: "Totaal spelers", value: dashboardStats.totaalSpelers },
    { label: "Actieve borden", value: dashboardStats.aantalBorden },
  ];

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl lg:p-6">
      <div className="mb-4 lg:mb-6">
        <h3 className="text-lg font-bold text-white lg:text-xl">Speelavond</h3>
        <p className="mt-1 text-sm text-zinc-400">
          Live overzicht voor wedstrijdleiding
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3 lg:px-4 lg:py-4"
          >
            <p className="text-2xl font-bold text-white lg:text-3xl">
              {item.value}
            </p>
            <p className="mt-1 text-xs text-zinc-400 lg:text-sm">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-zinc-800 bg-black px-4 py-3 lg:mt-6">
        <p className="text-xs uppercase tracking-wider text-zinc-500">
          Laatste opslag
        </p>
        <p className="mt-1 text-sm font-semibold text-white lg:text-base">
          {laatsteOpslagLabel}
        </p>
      </div>
    </section>
  );
}
