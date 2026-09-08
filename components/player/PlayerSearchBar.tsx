"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSpeelavond } from "@/context/SpeelavondContext";
import {
  filterSpelersOpZoekterm,
  verzamelAlleSpelers,
} from "@/lib/player-utils";
import { waarMoetIkSpelen } from "@/lib/live";
import { mijnPoulePad } from "@/lib/wedstrijd-overzicht";

export default function PlayerSearchBar() {
  const { leden, gasten, borden, stand } = useSpeelavond();
  const [zoekterm, setZoekterm] = useState("");
  const [geselecteerd, setGeselecteerd] = useState<string | null>(null);
  const [toonSuggesties, setToonSuggesties] = useState(false);

  const alleSpelers = useMemo(
    () =>
      verzamelAlleSpelers(
        leden,
        gasten,
        borden,
        stand.map((rij) => rij.naam)
      ),
    [leden, gasten, borden, stand]
  );

  const suggesties = useMemo(
    () => filterSpelersOpZoekterm(alleSpelers, zoekterm),
    [alleSpelers, zoekterm]
  );

  const info = geselecteerd ? waarMoetIkSpelen(borden, geselecteerd) : null;

  const selecteerSpeler = (naam: string) => {
    setGeselecteerd(naam);
    setZoekterm(naam);
    setToonSuggesties(false);
  };

  return (
    <section className="relative rounded-2xl border border-zinc-800 bg-zinc-950 p-4 lg:p-6">
      <h2 className="text-lg font-bold text-white lg:text-xl">
        🎯 Waar moet ik spelen?
      </h2>
      <p className="mt-1 text-sm text-zinc-400">Zoek je naam</p>

      <div className="relative mt-4">
        <input
          type="search"
          value={zoekterm}
          onChange={(e) => {
            setZoekterm(e.target.value);
            setToonSuggesties(true);
            if (!e.target.value.trim()) setGeselecteerd(null);
          }}
          onFocus={() => setToonSuggesties(true)}
          onBlur={() => setTimeout(() => setToonSuggesties(false), 150)}
          placeholder="🔍 Zoek speler..."
          className="min-h-12 w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white placeholder:text-zinc-500 focus:border-red-600 focus:outline-none"
          aria-label="Zoek speler"
          autoComplete="off"
        />

        {toonSuggesties && suggesties.length > 0 && (
          <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl">
            {suggesties.map((naam) => (
              <li key={naam}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selecteerSpeler(naam)}
                  className="flex min-h-12 w-full items-center px-4 py-2 text-left text-sm text-white hover:bg-red-900/40"
                >
                  {naam}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {geselecteerd && info && (
        <article className="mt-4 rounded-2xl border border-red-800/50 bg-red-950/20 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-400">
            {geselecteerd}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white">
            {info.bordNaam}
          </p>
          <p className="mt-2 text-base text-zinc-200">
            Tegen {info.tegenstander}
          </p>
          <p className="stat-number mt-2 text-3xl font-bold text-white">
            {info.wedstrijd.score1} — {info.wedstrijd.score2}
          </p>
          <span
            className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${info.status.badgeClass}`}
          >
            {info.status.icoon} {info.status.label}
          </span>
          <Link
            href={mijnPoulePad(geselecteerd)}
            className="mt-4 flex min-h-11 items-center justify-center rounded-xl bg-red-700 text-sm font-bold text-white hover:bg-red-600"
          >
            Open spelerprofiel →
          </Link>
        </article>
      )}

      {geselecteerd && !info && (
        <p className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-400">
          {geselecteerd} is vanavond nog niet ingedeeld op een bord.
        </p>
      )}
    </section>
  );
}
