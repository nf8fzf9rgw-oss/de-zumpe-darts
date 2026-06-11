"use client";

import Link from "next/link";
import MatchCard from "@/components/player/MatchCard";
import PlayerSearchBar from "@/components/player/PlayerSearchBar";
import DartboardAccent from "@/components/ui/DartboardAccent";
import SpelerVanDeAvondBanner from "@/components/SpelerVanDeAvondBanner";
import { useSpeelavond } from "@/context/SpeelavondContext";
import {
  komendeWedstrijden,
  laatsteWinnaar,
  laadOpgeslagenSpelerNaam,
} from "@/lib/player-utils";

export default function PlayerHome() {
  const {
    dashboardStats,
    spelerVanDeAvond,
    clubRecords,
    komendeSpeelavond,
    speelDatumLabel,
    laatsteOpslag,
    laatsteOpslagLabel,
    borden,
  } = useSpeelavond();

  const winnaar = laatsteWinnaar(borden);
  const opgeslagenSpeler = laadOpgeslagenSpelerNaam();
  const komende = komendeWedstrijden(borden, opgeslagenSpeler || null, 5);

  const stats = [
    {
      label: "Spelers vanavond",
      waarde: dashboardStats.totaalSpelers,
      icon: "👥",
    },
    {
      label: "Borden actief",
      waarde: dashboardStats.aantalBorden,
      icon: "🎯",
    },
    {
      label: "Wedstrijden",
      waarde: `${dashboardStats.gespeeldeWedstrijden}/${dashboardStats.totaalWedstrijden}`,
      icon: "🏆",
    },
  ];

  const records = [
    {
      label: "Meeste 180's",
      naam: clubRecords.meeste180s.naam,
      detail: clubRecords.meeste180s.label,
    },
    {
      label: "Hoogste finish",
      naam: clubRecords.hoogsteFinish.naam,
      detail: clubRecords.hoogsteFinish.label,
    },
    {
      label: "Meeste overwinningen",
      naam: clubRecords.meesteOverwinningen.naam,
      detail: clubRecords.meesteOverwinningen.label,
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-black to-red-950/20 p-4 shadow-xl lg:p-8">
        <div className="absolute -right-8 -top-8 opacity-20">
          <DartboardAccent size="lg" className="h-32 w-32" />
        </div>
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
            Vrijdagavond Competitie
          </p>
          <h2 className="mt-1 text-2xl font-bold text-white lg:text-3xl">
            Welkom bij De Zumpe
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            {speelDatumLabel || komendeSpeelavond} · Laatste opslag:{" "}
            {laatsteOpslagLabel}
          </p>
        </div>

        <div className="relative mt-4 grid grid-cols-3 gap-2 lg:gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-zinc-800/80 bg-black/50 px-2 py-3 text-center lg:px-4 lg:py-4"
            >
              <span className="text-lg">{s.icon}</span>
              <p className="mt-1 text-lg font-bold text-white lg:text-2xl">
                {s.waarde}
              </p>
              <p className="mt-0.5 text-[10px] text-zinc-500 lg:text-xs">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <PlayerSearchBar />

      <SpelerVanDeAvondBanner />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 lg:p-6">
          <h3 className="text-lg font-bold text-white">Vanavond</h3>
          <dl className="mt-4 space-y-3">
            <div className="flex justify-between gap-2 border-b border-zinc-800 pb-2">
              <dt className="text-sm text-zinc-400">Speelavond</dt>
              <dd className="text-sm font-semibold text-white">
                {laatsteOpslag ? speelDatumLabel : komendeSpeelavond}
              </dd>
            </div>
            {winnaar && (
              <div className="flex justify-between gap-2 border-b border-zinc-800 pb-2">
                <dt className="text-sm text-zinc-400">Laatste winnaar</dt>
                <dd className="text-sm font-semibold text-green-400">
                  🏅 {winnaar}
                </dd>
              </div>
            )}
            <div className="flex justify-between gap-2">
              <dt className="text-sm text-zinc-400">Speler van de avond</dt>
              <dd className="text-sm font-semibold text-amber-400">
                {spelerVanDeAvond ?? "Nog niet bepaald"}
              </dd>
            </div>
          </dl>
          <Link
            href="/mijn-poule"
            className="mt-4 flex min-h-12 items-center justify-center rounded-xl bg-red-700 text-sm font-bold text-white hover:bg-red-600"
          >
            Bekijk mijn poule →
          </Link>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 lg:p-6">
          <h3 className="text-lg font-bold text-white">Clubrecords</h3>
          <ul className="mt-4 space-y-3">
            {records.map((r) => (
              <li
                key={r.label}
                className="flex items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2"
              >
                <div>
                  <p className="text-xs text-zinc-500">{r.label}</p>
                  <p className="font-semibold text-white">{r.naam}</p>
                </div>
                <span className="text-xs font-semibold text-red-400">
                  {r.detail}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href="/hall-of-fame"
            className="mt-4 block text-center text-sm font-semibold text-red-400 hover:text-red-300"
          >
            Alle records bekijken →
          </Link>
        </section>
      </div>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 lg:p-6">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-white">Komende wedstrijden</h3>
          <Link
            href="/competitie"
            className="text-xs font-semibold text-red-400 hover:text-red-300"
          >
            Alle borden →
          </Link>
        </div>
        {komende.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
            {borden.length === 0
              ? "Nog geen competitie — wacht tot de avond start."
              : "Alle wedstrijden zijn gespeeld! 🎉"}
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {komende.map(({ bordNaam, wedstrijd }) => (
              <MatchCard
                key={`${bordNaam}-${wedstrijd.id}`}
                wedstrijd={wedstrijd}
                bordNaam={bordNaam}
                compact
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
