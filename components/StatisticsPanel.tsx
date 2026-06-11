"use client";

import { useSpeelavond } from "@/context/SpeelavondContext";

const statKaarten = [
  { key: "totaalAvonden", label: "Totaal speelavonden", icon: "📅" },
  { key: "gemiddeldSpelers", label: "Gemiddeld aantal spelers", icon: "👥" },
  { key: "meestAanwezig", label: "Meest aanwezige speler", icon: "⭐" },
  { key: "meesteOverwinningen", label: "Meeste overwinningen", icon: "🏆" },
  { key: "hoogsteWinstpercentage", label: "Hoogste winstpercentage", icon: "📈" },
  { key: "meesteWedstrijden", label: "Meeste gespeelde wedstrijden", icon: "🎯" },
  { key: "meeste180s", label: "Meeste 180's", icon: "🔥" },
  { key: "gemiddeldBorden", label: "Gemiddeld aantal borden", icon: "📋" },
] as const;

export default function StatisticsPanel() {
  const { statistieken } = useSpeelavond();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {statKaarten.map((kaart) => {
        let waarde: string | number = statistieken[kaart.key];

        if (kaart.key === "meestAanwezig" && statistieken.meestAanwezigAantal > 0) {
          waarde = `${statistieken.meestAanwezig} (${statistieken.meestAanwezigAantal}x)`;
        }
        if (kaart.key === "meesteOverwinningen" && statistieken.meesteOverwinningenAantal > 0) {
          waarde = `${statistieken.meesteOverwinningen} (${statistieken.meesteOverwinningenAantal})`;
        }
        if (kaart.key === "hoogsteWinstpercentage" && statistieken.hoogsteWinstpercentageWaarde > 0) {
          waarde = `${statistieken.hoogsteWinstpercentage} (${statistieken.hoogsteWinstpercentageWaarde}%)`;
        }
        if (kaart.key === "meesteWedstrijden" && statistieken.meesteWedstrijdenAantal > 0) {
          waarde = `${statistieken.meesteWedstrijden} (${statistieken.meesteWedstrijdenAantal})`;
        }
        if (kaart.key === "meeste180s" && statistieken.meeste180sAantal > 0) {
          waarde = `${statistieken.meeste180s} (${statistieken.meeste180sAantal}x)`;
        }

        return (
          <div
            key={kaart.key}
            className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl md:rounded-2xl md:p-6 lg:hover:border-red-800"
          >
            <div className="mb-4 text-3xl">{kaart.icon}</div>
            <p className="text-2xl font-bold text-white md:text-3xl">{waarde}</p>
            <p className="mt-2 text-sm text-zinc-400">{kaart.label}</p>
          </div>
        );
      })}
    </div>
  );
}
