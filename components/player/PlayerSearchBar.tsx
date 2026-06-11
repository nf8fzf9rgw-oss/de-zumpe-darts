"use client";

import { useMemo, useState } from "react";
import PlayerCard from "@/components/player/PlayerCard";
import MatchCard from "@/components/player/MatchCard";
import MobileScoreEntry from "@/components/player/MobileScoreEntry";
import { useSpeelavond } from "@/context/SpeelavondContext";
import {
  filterSpelersOpZoekterm,
  laadOpgeslagenSpelerNaam,
  slaSpelerNaamOp,
  verzamelAlleSpelers,
  vindBordVoorSpeler,
  vindWedstrijdenVoorSpeler,
} from "@/lib/player-utils";
import type { SpelerWedstrijdInfo } from "@/lib/player-utils";

export default function PlayerSearchBar() {
  const { leden, gasten, borden, updateWedstrijd } = useSpeelavond();
  const [zoekterm, setZoekterm] = useState(() => laadOpgeslagenSpelerNaam());
  const [geselecteerd, setGeselecteerd] = useState<string | null>(() => {
    const opgeslagen = laadOpgeslagenSpelerNaam();
    return opgeslagen || null;
  });
  const [openWedstrijd, setOpenWedstrijd] = useState<SpelerWedstrijdInfo | null>(
    null
  );
  const [toonSuggesties, setToonSuggesties] = useState(false);

  const alleSpelers = useMemo(
    () => verzamelAlleSpelers(leden, gasten, borden),
    [leden, gasten, borden]
  );

  const suggesties = useMemo(
    () => filterSpelersOpZoekterm(alleSpelers, zoekterm),
    [alleSpelers, zoekterm]
  );

  const bord = geselecteerd ? vindBordVoorSpeler(borden, geselecteerd) : null;
  const wedstrijden = geselecteerd
    ? vindWedstrijdenVoorSpeler(borden, geselecteerd)
    : [];

  const selecteerSpeler = (naam: string) => {
    setGeselecteerd(naam);
    setZoekterm(naam);
    slaSpelerNaamOp(naam);
    setToonSuggesties(false);
  };

  return (
    <section className="relative rounded-2xl border border-red-900/30 bg-gradient-to-br from-red-950/30 to-zinc-950 p-4 shadow-xl lg:p-6">
      <h2 className="text-lg font-bold text-white lg:text-xl">
        Vind mijn wedstrijden
      </h2>
      <p className="mt-1 text-sm text-zinc-400">
        Zoek je naam en zie direct je bord en wedstrijden van vanavond.
      </p>

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
          placeholder="Typ je naam..."
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

      {geselecteerd && (
        <div className="mt-4 space-y-4">
          <PlayerCard
            naam={geselecteerd}
            subtekst={
              bord
                ? `${bord.naam} · ${bord.spelers.length} spelers in poule`
                : "Nog niet ingedeeld op een bord"
            }
            badge={bord ? "Actief" : undefined}
            highlight
          />

          {wedstrijden.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Jouw wedstrijden ({wedstrijden.filter((w) => w.wedstrijd.gespeeld).length}/
                {wedstrijden.length} gespeeld)
              </p>
              {wedstrijden.map(({ bordNaam, wedstrijd }) => (
                <MatchCard
                  key={wedstrijd.id}
                  wedstrijd={wedstrijd}
                  bordNaam={bordNaam}
                  compact
                  onOpen={
                    !wedstrijd.gespeeld
                      ? () => setOpenWedstrijd({ bordNaam, wedstrijd })
                      : undefined
                  }
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">
              Geen wedstrijden gevonden. Wacht tot de competitie is gegenereerd.
            </p>
          )}
        </div>
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
    </section>
  );
}
