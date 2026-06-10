"use client";

import { useSpeelavond } from "@/context/SpeelavondContext";

const kaarten = [
  {
    key: "aanwezigeLeden",
    label: "Aanwezige leden",
    icon: "👥",
    kleur: "from-red-700 to-red-900",
  },
  {
    key: "gastspelers",
    label: "Gastspelers",
    icon: "🧑",
    kleur: "from-zinc-700 to-zinc-900",
  },
  {
    key: "totaalSpelers",
    label: "Totaal spelers",
    icon: "🎯",
    kleur: "from-red-800 to-black",
  },
  {
    key: "aantalBorden",
    label: "Aantal borden",
    icon: "📋",
    kleur: "from-zinc-800 to-zinc-950",
  },
  {
    key: "totaalWedstrijden",
    label: "Totaal wedstrijden",
    icon: "🏆",
    kleur: "from-red-900 to-zinc-950",
  },
] as const;

export default function DashboardCards() {
  const { dashboardStats } = useSpeelavond();

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-5 lg:gap-4">
      {kaarten.map((kaart) => (
        <div
          key={kaart.key}
          className={`group rounded-xl border border-zinc-800 bg-gradient-to-br ${kaart.kleur} p-3 shadow-xl transition-all md:rounded-2xl md:p-4 lg:p-5 lg:hover:-translate-y-1 lg:hover:border-red-700/50 lg:hover:shadow-2xl lg:hover:shadow-red-900/20`}
        >
          <div className="mb-2 flex items-center justify-between md:mb-3 lg:mb-4">
            <span className="text-lg md:text-xl lg:text-2xl">{kaart.icon}</span>
            <span className="hidden h-2 w-2 rounded-full bg-red-500 opacity-70 group-hover:opacity-100 lg:block" />
          </div>
          <p className="text-xl font-bold text-white md:text-2xl lg:text-3xl">
            {dashboardStats[kaart.key]}
          </p>
          <p className="mt-1 text-[11px] text-zinc-300 md:text-xs lg:mt-2 lg:text-sm">
            {kaart.label}
          </p>
        </div>
      ))}
    </div>
  );
}
