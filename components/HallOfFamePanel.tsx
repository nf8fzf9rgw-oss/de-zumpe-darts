"use client";

import { useSpeelavond } from "@/context/SpeelavondContext";

const RECORDS = [
  { key: "meeste180s", icon: "🎯", titel: "Meeste 180's ooit" },
  { key: "hoogsteFinish", icon: "🔥", titel: "Hoogste finish ooit" },
  { key: "meesteOverwinningen", icon: "🏆", titel: "Meeste overwinningen ooit" },
  { key: "hoogsteWinstpercentage", icon: "📈", titel: "Hoogste winstpercentage" },
  { key: "langsteWinstreeks", icon: "⚡", titel: "Langste winstreeks" },
] as const;

export default function HallOfFamePanel() {
  const { clubRecords, actiefSeizoenLabel } = useSpeelavond();

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-400">{actiefSeizoenLabel}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {RECORDS.map((record) => {
          const data = clubRecords[record.key];
          return (
            <article
              key={record.key}
              className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-950 to-black p-5 shadow-xl transition hover:border-red-800/50"
            >
              <span className="text-3xl">{record.icon}</span>
              <h3 className="mt-3 font-bold text-white">{record.titel}</h3>
              <p className="mt-2 text-2xl font-bold text-red-400">{data.naam}</p>
              <p className="mt-1 text-sm text-zinc-400">{data.label}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
