"use client";

import { useSpeelavond } from "@/context/SpeelavondContext";

export default function SpeelavondPanel() {
  const {
    aanwezigen,
    gasten,
    laatsteOpslagLabel,
    dashboardStats,
    speelDatumLabel,
  } = useSpeelavond();

  const items = [
    { label: "Aanwezigen", value: aanwezigen.length, icon: "👥" },
    { label: "Gasten", value: gasten.length, icon: "🧑" },
    { label: "Totaal spelers", value: dashboardStats.totaalSpelers, icon: "🎯" },
    { label: "Actieve borden", value: dashboardStats.aantalBorden, icon: "📋" },
    {
      label: "Wedstrijden vandaag",
      value: dashboardStats.totaalWedstrijden,
      icon: "🏆",
    },
    {
      label: "Gespeeld",
      value: `${dashboardStats.gespeeldeWedstrijden}/${dashboardStats.totaalWedstrijden}`,
      icon: "✓",
    },
  ];

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl lg:p-6">
      <div className="mb-4 lg:mb-6">
        <h3 className="text-lg font-bold text-white lg:text-xl">Speelavond</h3>
        <p className="mt-1 text-sm text-zinc-400">
          Live overzicht voor wedstrijdleiding
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3 lg:px-4 lg:py-4"
          >
            <span className="text-sm">{item.icon}</span>
            <p className="mt-1 text-xl font-bold text-white lg:text-2xl">
              {item.value}
            </p>
            <p className="mt-1 text-xs text-zinc-400 lg:text-sm">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2 lg:mt-6">
        <div className="rounded-xl border border-zinc-800 bg-black px-4 py-3">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Datum</p>
          <p className="mt-1 text-sm font-semibold text-white lg:text-base">
            {speelDatumLabel}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-black px-4 py-3">
          <p className="text-xs uppercase tracking-wider text-zinc-500">
            Laatste opslag
          </p>
          <p className="mt-1 text-sm font-semibold text-white lg:text-base">
            {laatsteOpslagLabel}
          </p>
        </div>
      </div>
    </section>
  );
}
