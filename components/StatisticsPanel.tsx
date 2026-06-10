"use client";

import { useSpeelavond } from "@/context/SpeelavondContext";

const statKaarten = [
  {
    key: "totaalAvonden",
    label: "Totaal gespeelde avonden",
    suffix: "",
    icon: "📅",
  },
  {
    key: "gemiddeldSpelers",
    label: "Gemiddeld aantal spelers",
    suffix: "",
    icon: "👥",
  },
  {
    key: "meestAanwezig",
    label: "Meest aanwezige speler",
    suffix: "",
    icon: "🏆",
  },
  {
    key: "gemiddeldBorden",
    label: "Gemiddeld aantal borden",
    suffix: "",
    icon: "🎯",
  },
] as const;

export default function StatisticsPanel() {
  const { statistieken } = useSpeelavond();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-2 lg:gap-8 xl:grid-cols-4">
      {statKaarten.map((kaart) => {
        let waarde: string | number = statistieken[kaart.key];

        if (kaart.key === "meestAanwezig" && statistieken.meestAanwezigAantal > 0) {
          waarde = `${statistieken.meestAanwezig} (${statistieken.meestAanwezigAantal}x)`;
        }

        return (
          <div
            key={kaart.key}
            className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl transition md:rounded-2xl md:p-6 lg:hover:border-red-800"
          >
            <div className="mb-4 text-3xl">{kaart.icon}</div>
            <p className="text-3xl font-bold text-white">{waarde}</p>
            <p className="mt-2 text-sm text-zinc-400">{kaart.label}</p>
          </div>
        );
      })}
    </div>
  );
}
