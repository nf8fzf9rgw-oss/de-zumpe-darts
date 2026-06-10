"use client";

import CompetitionBoard from "@/components/CompetitionBoard";
import { useSpeelavond } from "@/context/SpeelavondContext";

interface CompetitionSummaryProps {
  variant?: "dashboard" | "full";
}

export default function CompetitionSummary({
  variant = "full",
}: CompetitionSummaryProps) {
  const { borden } = useSpeelavond();
  const isDashboard = variant === "dashboard";

  if (borden.length === 0) {
    return (
      <div
        className={`rounded-xl border border-dashed border-zinc-700 bg-zinc-950 text-center ${
          isDashboard ? "px-4 py-10" : "px-6 py-16 lg:rounded-2xl"
        }`}
      >
        <p className="text-3xl lg:text-4xl">🎯</p>
        <p className="mt-3 text-base font-semibold text-white lg:mt-4 lg:text-lg">
          Nog geen competitie gegenereerd
        </p>
        <p className="mt-2 text-xs text-zinc-400 lg:text-sm">
          Selecteer leden en gasten, en genereer daarna de competitie.
        </p>
      </div>
    );
  }

  if (isDashboard) {
    return (
      <div className="space-y-4">
        {borden.map((bord) => (
          <CompetitionBoard key={bord.naam} bord={bord} compact />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-2">
      {borden.map((bord) => (
        <CompetitionBoard key={bord.naam} bord={bord} />
      ))}
    </div>
  );
}
