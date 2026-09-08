"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import HeadToHeadCard from "@/components/HeadToHeadCard";
import MatchCard from "@/components/player/MatchCard";
import MobileScoreEntry from "@/components/player/MobileScoreEntry";
import PouleSpelerLijst from "@/components/player/PouleSpelerLijst";
import SpelerStatsGrid from "@/components/player/SpelerStatsGrid";
import StandingsTable from "@/components/StandingsTable";
import EmptyState from "@/components/ui/EmptyState";
import { useSpeelavond } from "@/context/SpeelavondContext";
import { namenZijnGelijk } from "@/lib/namen";
import { berekenSpelerProfiel } from "@/lib/standings";
import {
  berekenBordStand,
  filterSpelersOpZoekterm,
  laadOpgeslagenSpelerNaam,
  pouleBordVoorSpeler,
  slaSpelerNaamOp,
  verzamelAlleSpelers,
  vindBordenVoorSpeler,
  vindWedstrijdenVoorSpeler,
} from "@/lib/player-utils";
import type { SpelerWedstrijdInfo } from "@/lib/player-utils";
import {
  MIJN_POULE_SPELER_PARAM,
  mijnPoulePad,
} from "@/lib/wedstrijd-overzicht";

export default function MijnPoulePage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-6 py-12 text-center text-zinc-400">
          Poule laden...
        </div>
      }
    >
      <MijnPouleInhoud />
    </Suspense>
  );
}

function MijnPouleInhoud() {
  const {
    leden,
    gasten,
    borden,
    updateWedstrijd,
    seizoenHistorie,
    actiefSeizoen,
    laatsteOpslag,
  } = useSpeelavond();
  const router = useRouter();
  const searchParams = useSearchParams();
  const spelerParam = searchParams.get(MIJN_POULE_SPELER_PARAM)?.trim() ?? "";

  const [eigenNaam, setEigenNaam] = useState("");
  const [actieveNaam, setActieveNaam] = useState("");
  const [zoekterm, setZoekterm] = useState("");
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

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- localStorage hydratie na mount */
    setEigenNaam(laadOpgeslagenSpelerNaam());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    const opgeslagen = laadOpgeslagenSpelerNaam();
    /* eslint-disable react-hooks/set-state-in-effect -- URL-parameter naar weergavestaat */
    if (spelerParam) {
      const match =
        alleSpelers.find((naam) => namenZijnGelijk(naam, spelerParam)) ??
        spelerParam;
      setActieveNaam(match);
      setZoekterm(match);
      return;
    }
    if (opgeslagen) {
      setActieveNaam((huidig) => huidig || opgeslagen);
      setZoekterm((huidig) => huidig || opgeslagen);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [spelerParam, alleSpelers]);

  const pouleBord = actieveNaam
    ? pouleBordVoorSpeler(borden, actieveNaam)
    : null;
  const alleBordenSpeler = actieveNaam
    ? vindBordenVoorSpeler(borden, actieveNaam)
    : [];
  const wedstrijden = actieveNaam
    ? vindWedstrijdenVoorSpeler(borden, actieveNaam)
    : [];
  const pouleStand = pouleBord ? berekenBordStand(pouleBord) : [];
  const extraRondes = alleBordenSpeler
    .filter((bord) => bord.naam !== pouleBord?.naam)
    .map((bord) => bord.naam);
  const profiel = actieveNaam
    ? berekenSpelerProfiel(
        actieveNaam,
        seizoenHistorie,
        borden,
        actiefSeizoen,
        laatsteOpslag
      )
    : null;
  const pouleTegenstanders = pouleBord
    ? pouleBord.spelers.filter((naam) => !namenZijnGelijk(naam, actieveNaam))
    : [];

  const toonSpeler = (naam: string, alsEigen: boolean) => {
    setActieveNaam(naam);
    setZoekterm(naam);
    setToonSuggesties(false);
    setOpenWedstrijd(null);
    if (alsEigen) {
      setEigenNaam(naam);
      slaSpelerNaamOp(naam);
    }
    router.replace(mijnPoulePad(naam), { scroll: false });
  };

  const subtekst = pouleBord
    ? `${pouleBord.naam} · ${pouleBord.spelers.length} spelers${
        extraRondes.length > 0 ? ` · ${extraRondes.join(" · ")}` : ""
      }`
    : undefined;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white lg:text-2xl">Mijn Poule</h2>
          <p className="text-sm text-zinc-400">
            Klik op een speler en zie direct bord, poule en wedstrijden.
          </p>
        </div>
        <Link
          href="/competitie"
          className="min-h-11 rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-red-400 hover:border-red-700 hover:text-red-300"
        >
          Alle wedstrijden →
        </Link>
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
                    onClick={() => toonSpeler(naam, true)}
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

      {!actieveNaam && (
        <EmptyState
          icon="🎯"
          titel="Kies je naam"
          tekst="Je bord, poule en wedstrijden verschijnen hier."
        />
      )}

      {actieveNaam && !pouleBord && (
        <div className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-6 text-center">
          <p className="font-semibold text-amber-200">
            {actieveNaam} is nog niet ingedeeld op een bord.
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Wacht tot wedstrijdleiding de competitie genereert.
          </p>
        </div>
      )}

      {actieveNaam && pouleBord && (
        <>
          <section className="rounded-2xl border border-red-800/40 bg-red-950/20 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-500">
              🎯 {actieveNaam}
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white">
              {pouleBord.naam}
            </p>
            <p className="mt-1 text-sm text-zinc-400">{subtekst}</p>
          </section>

          {profiel && (
            <section className="space-y-3">
              <SpelerStatsGrid profiel={profiel} />
              {profiel.badges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profiel.badges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-300"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </section>
          )}

          <PouleSpelerLijst
            spelers={pouleBord.spelers}
            actieveNaam={actieveNaam}
            eigenNaam={eigenNaam}
            onSelecteer={(naam) => toonSpeler(naam, false)}
          />

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-red-500">
              Wedstrijden van {actieveNaam.split(" ")[0]}
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              {wedstrijden.filter((item) => item.wedstrijd.gespeeld).length}/
              {wedstrijden.length} gespeeld
            </p>
            <div className="mt-3 space-y-2">
              {wedstrijden.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  Nog geen wedstrijden voor deze speler.
                </p>
              ) : (
                wedstrijden.map(({ bordNaam, wedstrijd }, index) => (
                  <MatchCard
                    key={wedstrijd.id}
                    wedstrijd={wedstrijd}
                    bordNaam={bordNaam}
                    volgnummer={index + 1}
                    perspectiefNaam={actieveNaam}
                    onSpelerKlik={(naam) => toonSpeler(naam, false)}
                    onOpen={() => setOpenWedstrijd({ bordNaam, wedstrijd })}
                  />
                ))
              )}
            </div>
          </section>

          {pouleTegenstanders.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                Onderlinge statistieken
              </h3>
              {pouleTegenstanders.map((tegenstander) => (
                <HeadToHeadCard
                  key={tegenstander}
                  spelerA={actieveNaam}
                  spelerB={tegenstander}
                />
              ))}
            </section>
          )}

          {pouleStand.length > 0 && (
            <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-red-500">
                Mini-stand poule
              </h3>
              <StandingsTable
                stand={pouleStand}
                compact
                highlightNaam={actieveNaam}
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
