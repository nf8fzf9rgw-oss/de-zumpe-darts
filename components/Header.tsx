"use client";

import { useSpeelavond } from "@/context/SpeelavondContext";

export default function Header() {
  const { laatsteOpslagLabel } = useSpeelavond();
  const vandaag = new Date().toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="no-print sticky top-0 z-30 border-b border-zinc-800 bg-black/90 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-4 lg:px-8 lg:py-5">
        <div className="min-w-0">
          <p className="hidden text-xs font-semibold uppercase tracking-[0.25em] text-red-500 md:block">
            Vrijdagavond Competitie
          </p>
          <h2 className="truncate text-lg font-bold text-white md:text-xl lg:text-2xl">
            🎯 De Zumpe
          </h2>
          <p className="mt-0.5 truncate text-xs capitalize text-zinc-400 md:text-sm lg:mt-1">
            {vandaag}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 md:text-xs">
            Laatste opslag
          </p>
          <p className="mt-0.5 text-xs font-semibold text-white md:text-sm">
            {laatsteOpslagLabel}
          </p>
        </div>
      </div>
    </header>
  );
}
