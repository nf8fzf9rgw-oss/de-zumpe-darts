"use client";

import Link from "next/link";
import { formatDatum } from "@/lib/storage";
import { useSpeelavond } from "@/context/SpeelavondContext";

export default function DashboardWidgets() {
  const {
    historie,
    statistieken,
    huidigSeizoen,
    komendeSpeelavond,
    dashboardStats,
    aanwezigen,
    gasten,
  } = useSpeelavond();

  const laatsteAvond = [...historie].sort(
    (a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime()
  )[0];

  const widgets = [
    {
      titel: "Laatste speelavond",
      waarde: laatsteAvond ? formatDatum(laatsteAvond.datum) : "Nog geen historie",
      sub: laatsteAvond
        ? `${laatsteAvond.aanwezigen.length + laatsteAvond.gasten.length} spelers`
        : "Sla de eerste avond op",
      icon: "📅",
      href: "/speelavonden",
    },
    {
      titel: "Huidig seizoen",
      waarde: huidigSeizoen,
      sub: `${statistieken.totaalAvonden} avonden gespeeld`,
      icon: "🏅",
      href: "/stand",
    },
    {
      titel: "Meest aanwezig",
      waarde: statistieken.meestAanwezig,
      sub:
        statistieken.meestAanwezigAantal > 0
          ? `${statistieken.meestAanwezigAantal}x aanwezig`
          : "Nog geen data",
      icon: "⭐",
      href: "/statistieken",
    },
    {
      titel: "Komende speelavond",
      waarde: komendeSpeelavond,
      sub: `Vandaag: ${dashboardStats.totaalSpelers} spelers (${aanwezigen.length} leden + ${gasten.length} gasten)`,
      icon: "🎯",
      href: "/competitie",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
      {widgets.map((widget) => (
        <Link
          key={widget.titel}
          href={widget.href}
          className="group rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl transition hover:border-red-800/50 hover:bg-zinc-900/80 lg:p-5"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-2xl">{widget.icon}</span>
            <span className="text-xs text-zinc-600 group-hover:text-red-500">
              →
            </span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {widget.titel}
          </p>
          <p className="mt-1 truncate text-base font-bold text-white lg:text-lg">
            {widget.waarde}
          </p>
          <p className="mt-1 text-xs text-zinc-400">{widget.sub}</p>
        </Link>
      ))}
    </div>
  );
}
