"use client";

import { useSpeelavond } from "@/context/SpeelavondContext";

export default function SpelerVanDeAvondBanner() {
  const { spelerVanDeAvond, borden } = useSpeelavond();

  if (!spelerVanDeAvond || borden.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-800/50 bg-gradient-to-r from-amber-950/80 to-zinc-950 px-4 py-3 shadow-lg lg:px-6 lg:py-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl lg:text-3xl">⭐</span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-500">
            Speler van de avond
          </p>
          <p className="text-lg font-bold text-white lg:text-xl">
            {spelerVanDeAvond}
          </p>
        </div>
      </div>
    </div>
  );
}
