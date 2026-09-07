"use client";

import { useSpeelavond } from "@/context/SpeelavondContext";
import { MAX_SPELERS_PER_AVOND } from "@/lib/competition";

export default function SpeelavondPanel() {
  const {
    aanwezigen,
    gasten,
    laatsteOpslagLabel,
    dashboardStats,
    speelDatumLabel,
  } = useSpeelavond();

  const items = [
    { label: "Aanwezige leden", value: aanwezigen.length, icon: "👥" },
    { label: "Gastspelers", value: gasten.length, icon: "🧑" },
    {
      label: "Totaal spelers",
      value: `${dashboardStats.totaalSpelers}/${MAX_SPELERS_PER_AVOND}`,
      icon: "🎯",
    },
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

  const progress =
    dashboardStats.totaalWedstrijden > 0
      ? Math.round(
          (dashboardStats.gespeeldeWedstrijden /
            dashboardStats.totaalWedstrijden) *
            100
        )
      : 0;

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

      {dashboardStats.totaalWedstrijden > 0 && (
        <div className="mt-4 lg:mt-6">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Voortgang wedstrijden</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-red-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 lg:mt-6 lg:gap-4">
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
