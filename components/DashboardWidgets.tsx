"use client";

import Link from "next/link";
import { formatDatum } from "@/lib/storage";
import { useSpeelavond } from "@/context/SpeelavondContext";

export default function DashboardWidgets() {
  const {
    seizoenHistorie,
    statistieken,
    actiefSeizoenLabel,
    komendeSpeelavond,
    dashboardStats,
    spelerVanDeAvond,
    clubRecords,
  } = useSpeelavond();

  const laatsteAvond = [...seizoenHistorie].sort(
    (a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime()
  )[0];

  const widgets = [
    {
      titel: "Leden",
      waarde: dashboardStats.totaalLeden,
      sub: `${dashboardStats.totaalSpelers} actief vanavond`,
      icon: "👥",
      href: "/leden",
    },
    {
      titel: "Gem. opkomst",
      waarde: statistieken.gemiddeldSpelers,
      sub: `${statistieken.totaalAvonden} avonden`,
      icon: "📊",
      href: "/statistieken",
    },
    {
      titel: "Speler van de avond",
      waarde: spelerVanDeAvond ?? "Nog niet bepaald",
      sub: laatsteAvond?.spelerVanDeAvond
        ? `Vorige: ${laatsteAvond.spelerVanDeAvond}`
        : "Registreer uitslagen",
      icon: "⭐",
      href: "/competitie",
    },
    {
      titel: "Laatste speelavond",
      waarde: laatsteAvond ? formatDatum(laatsteAvond.datum) : "Geen historie",
      sub: actiefSeizoenLabel,
      icon: "📅",
      href: "/speelavonden",
    },
    {
      titel: "Clubrecord 180",
      waarde: clubRecords.meeste180s.naam,
      sub: clubRecords.meeste180s.label,
      icon: "🎯",
      href: "/hall-of-fame",
    },
    {
      titel: "Meest aanwezig",
      waarde: statistieken.meestAanwezig,
      sub:
        statistieken.meestAanwezigAantal > 0
          ? `${statistieken.meestAanwezigAantal}x aanwezig`
          : "Nog geen data",
      icon: "🏅",
      href: "/statistieken",
    },
    {
      titel: "Komende avond",
      waarde: komendeSpeelavond,
      sub: `${dashboardStats.aantalBorden} borden actief`,
      icon: "🗓",
      href: "/",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {widgets.map((widget) => (
        <Link
          key={widget.titel}
          href={widget.href}
          className="group rounded-2xl border border-zinc-800 bg-zinc-950 p-3 shadow-xl transition hover:border-red-800/50 lg:p-4"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xl">{widget.icon}</span>
            <span className="text-xs text-zinc-600 group-hover:text-red-500">→</span>
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 lg:text-xs">
            {widget.titel}
          </p>
          <p className="mt-1 truncate text-sm font-bold text-white lg:text-base">
            {widget.waarde}
          </p>
          <p className="mt-0.5 truncate text-[10px] text-zinc-400 lg:text-xs">
            {widget.sub}
          </p>
        </Link>
      ))}
    </div>
  );
}
