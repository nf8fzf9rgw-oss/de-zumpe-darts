"use client";

import { useSpeelavond } from "@/context/SpeelavondContext";

const statItems = [
  { key: "totaalAvonden", label: "Gespeelde avonden", icon: "📅" },
  { key: "gemiddeldSpelers", label: "Gem. spelers", icon: "👥" },
  { key: "meestAanwezig", label: "Top aanwezig", icon: "🏆" },
  { key: "gemiddeldBorden", label: "Gem. borden", icon: "🎯" },
] as const;

export default function DashboardStatisticsPanel() {
  const { statistieken } = useSpeelavond();

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl lg:p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white lg:text-xl">Statistieken</h3>
        <p className="mt-1 text-sm text-zinc-400">Clubhistorie van avonden</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {statItems.map((item) => {
          let waarde: string | number = statistieken[item.key];

          if (
            item.key === "meestAanwezig" &&
            statistieken.meestAanwezigAantal > 0
          ) {
            waarde = `${statistieken.meestAanwezig} (${statistieken.meestAanwezigAantal}x)`;
          }

          return (
            <div
              key={item.key}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3 transition hover:border-red-800/60 lg:px-4 lg:py-4"
            >
              <span className="text-lg lg:text-xl">{item.icon}</span>
              <p className="mt-2 text-lg font-bold text-white lg:text-2xl">
                {waarde}
              </p>
              <p className="mt-1 text-xs text-zinc-400">{item.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
