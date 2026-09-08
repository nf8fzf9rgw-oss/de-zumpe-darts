"use client";

import Link from "next/link";
import { useSpeelavond } from "@/context/SpeelavondContext";
import EmptyState from "@/components/ui/EmptyState";
import { mijnPoulePad } from "@/lib/wedstrijd-overzicht";

const RECORDS = [
  { key: "meeste180s", icon: "🎯", titel: "Meeste 180's ooit" },
  { key: "hoogsteFinish", icon: "💯", titel: "Hoogste finish ooit" },
  { key: "meesteOverwinningen", icon: "🏆", titel: "Meeste overwinningen ooit" },
  { key: "hoogsteWinstpercentage", icon: "📈", titel: "Hoogste winstpercentage ooit" },
  { key: "langsteWinstreeks", icon: "🔥", titel: "Langste winstreeks ooit" },
] as const;

export default function HallOfFamePanel() {
  const { clubRecords, actiefSeizoenLabel } = useSpeelavond();
  const heeftRecords = RECORDS.some(
    (record) => clubRecords[record.key].waarde > 0
  );

  if (!heeftRecords) {
    return (
      <EmptyState
        icon="🏆"
        titel="De Hall of Fame wordt gevuld zodra er records zijn."
        tekst={`Nog geen clubrecords voor ${actiefSeizoenLabel}.`}
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-400">{actiefSeizoenLabel}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {RECORDS.map((record) => {
          const data = clubRecords[record.key];
          const heeftWaarde = data.waarde > 0 && data.naam !== "-";
          return (
            <article
              key={record.key}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                {record.icon} {record.titel}
              </p>
              <p
                className={`stat-number mt-3 text-4xl font-bold ${
                  heeftWaarde ? "text-red-500" : "text-zinc-600"
                }`}
              >
                {heeftWaarde ? data.waarde : "—"}
              </p>
              {heeftWaarde ? (
                <Link
                  href={mijnPoulePad(data.naam)}
                  className="mt-2 block text-lg font-bold text-white hover:text-red-300"
                >
                  {data.naam} →
                </Link>
              ) : (
                <p className="mt-2 text-lg font-semibold text-zinc-500">Nog open</p>
              )}
              <p className="mt-1 text-sm text-zinc-400">{data.label}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
