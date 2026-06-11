"use client";

import { useMemo, useState } from "react";
import MatchCard from "@/components/player/MatchCard";
import MobileScoreEntry from "@/components/player/MobileScoreEntry";
import PlayerCard from "@/components/player/PlayerCard";
import StandingsTable from "@/components/StandingsTable";
import DartboardAccent from "@/components/ui/DartboardAccent";
import { useSpeelavond } from "@/context/SpeelavondContext";
import {
  berekenBordStand,
  filterSpelersOpZoekterm,
  laadOpgeslagenSpelerNaam,
  slaSpelerNaamOp,
  verzamelAlleSpelers,
  vindBordVoorSpeler,
  vindWedstrijdenVoorSpeler,
} from "@/lib/player-utils";
import type { SpelerWedstrijdInfo } from "@/lib/player-utils";

export default function MijnPoulePage() {
  const { leden, gasten, borden, updateWedstrijd } = useSpeelavond();
  const [spelerNaam, setSpelerNaam] = useState(() => laadOpgeslagenSpelerNaam());
  const [zoekterm, setZoekterm] = useState(() => laadOpgeslagenSpelerNaam());
  const [toonSuggesties, setToonSuggesties] = useState(false);
  const [openWedstrijd, setOpenWedstrijd] = useState<SpelerWedstrijdInfo | null>(
    null
  );

  const alleSpelers = useMemo(
    () => verzamelAlleSpelers(leden, gasten, borden),
    [leden, gasten, borden]
  );

  const suggesties = useMemo(
    () => filterSpelersOpZoekterm(alleSpelers, zoekterm),
    [alleSpelers, zoekterm]
  );

  const bord = spelerNaam ? vindBordVoorSpeler(borden, spelerNaam) : null;
  const wedstrijden = spelerNaam
    ? vindWedstrijdenVoorSpeler(borden, spelerNaam)
    : [];
  const pouleStand = bord ? berekenBordStand(bord) : [];

  const selecteerSpeler = (naam: string) => {
    setSpelerNaam(naam);
    setZoekterm(naam);
    slaSpelerNaamOp(naam);
    setToonSuggesties(false);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-3">
        <DartboardAccent size="md" />
        <div>
          <h2 className="text-xl font-bold text-white lg:text-2xl">Mijn Poule</h2>
          <p className="text-sm text-zinc-400">
            Jouw bord, wedstrijden en mini-stand van vanavond.
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <label htmlFor="poule-speler" className="text-sm font-semibold text-zinc-300">
          Selecteer je naam
        </label>
        <div className="relative mt-2">
          <input
            id="poule-speler"
            type="search"
            value={zoekterm}
            onChange={(e) => {
              setZoekterm(e.target.value);
              setToonSuggesties(true);
            }}
            onFocus={() => setToonSuggesties(true)}
            onBlur={() => setTimeout(() => setToonSuggesties(false), 150)}
            placeholder="Typ je naam..."
            className="min-h-12 w-full rounded-xl border border-zinc-700 bg-black px-4 text-white focus:border-red-600 focus:outline-none"
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
                    className="flex min-h-12 w-full px-4 py-2 text-left text-sm text-white hover:bg-red-900/40"
                  >
                    {naam}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {!spelerNaam && (
        <div className="rounded-2xl border border-dashed border-zinc-700 px-6 py-12 text-center">
          <p className="text-4xl">🎯</p>
          <p className="mt-3 font-semibold text-white">Kies je naam</p>
          <p className="mt-1 text-sm text-zinc-400">
            Je poule en wedstrijden verschijnen hier.
          </p>
        </div>
      )}

      {spelerNaam && !bord && (
        <div className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-6 text-center">
          <p className="font-semibold text-amber-200">
            {spelerNaam} is nog niet ingedeeld op een bord.
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Wacht tot wedstrijdleiding de competitie genereert.
          </p>
        </div>
      )}

      {spelerNaam && bord && (
        <>
          <PlayerCard
            naam={spelerNaam}
            subtekst={`${bord.naam} · ${bord.spelers.length} spelers`}
            highlight
          />

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-red-500">
              Spelers in jouw poule
            </h3>
            <ul className="mt-3 space-y-2">
              {bord.spelers.map((speler) => (
                <li
                  key={speler}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    speler === spelerNaam
                      ? "border-red-700 bg-red-950/40 font-semibold text-white"
                      : "border-zinc-800 bg-zinc-900 text-zinc-300"
                  }`}
                >
                  {speler}
                  {speler === spelerNaam && (
                    <span className="ml-2 text-xs text-red-400">(jij)</span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-red-500">
              Jouw wedstrijden
            </h3>
            <div className="mt-3 space-y-2">
              {wedstrijden.map(({ bordNaam, wedstrijd }) => (
                <MatchCard
                  key={wedstrijd.id}
                  wedstrijd={wedstrijd}
                  bordNaam={bordNaam}
                  onOpen={
                    !wedstrijd.gespeeld
                      ? () => setOpenWedstrijd({ bordNaam, wedstrijd })
                      : undefined
                  }
                />
              ))}
            </div>
          </section>

          {pouleStand.length > 0 && (
            <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-red-500">
                Mini-stand poule
              </h3>
              <StandingsTable
                stand={pouleStand}
                compact
                highlightNaam={spelerNaam}
              />
            </section>
          )}
        </>
      )}

      {openWedstrijd && (
        <MobileScoreEntry
          bordNaam={openWedstrijd.bordNaam}
          wedstrijd={openWedstrijd.wedstrijd}
          onClose={() => setOpenWedstrijd(null)}
          onSave={(updates) => {
            updateWedstrijd(
              openWedstrijd.bordNaam,
              openWedstrijd.wedstrijd.id,
              updates
            );
            setOpenWedstrijd(null);
          }}
        />
      )}
    </div>
  );
}
