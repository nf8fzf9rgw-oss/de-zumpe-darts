"use client";

import { useMemo, useState } from "react";
import BordSchemaKaart from "@/components/BordSchemaKaart";
import { useAvondWeergave } from "@/hooks/useAvondWeergave";
import { useSpeelavond } from "@/context/SpeelavondContext";
import {
  actieveBordNamen,
  filterBordenVoorSchema,
  groepeerBordenInRondes,
} from "@/lib/wedstrijd-overzicht";
import type { Bord } from "@/types/competition";

interface WedstrijdSchemaProps {
  startSpeler?: string;
  startBord?: string;
}

export default function WedstrijdSchema({
  startSpeler = "",
  startBord = "",
}: WedstrijdSchemaProps) {
  const { borden } = useSpeelavond();
  const { toonLiveBorden } = useAvondWeergave();
  const eigenNaam = startSpeler.trim();
  const [alleenMijnWedstrijden, setAlleenMijnWedstrijden] = useState(false);
  const [bordFilter, setBordFilter] = useState<string | null>(
    startBord || null
  );
  const [zoekterm, setZoekterm] = useState(startSpeler);

  const bordNamen = useMemo(() => actieveBordNamen(borden), [borden]);

  const gefilterd = useMemo(
    () =>
      filterBordenVoorSchema(borden, {
        bordNaam: bordFilter,
        spelerQuery: zoekterm,
        alleenMijnWedstrijden,
        eigenNaam,
      }),
    [borden, bordFilter, zoekterm, alleenMijnWedstrijden, eigenNaam]
  );

  const rondes = useMemo(
    () => groepeerBordenInRondes(gefilterd),
    [gefilterd]
  );

  const highlightNaam = alleenMijnWedstrijden
    ? eigenNaam
    : zoekterm.trim();

  const kiesAlle = () => {
    setAlleenMijnWedstrijden(false);
    setBordFilter(null);
    setZoekterm("");
  };

  if (borden.length === 0) {
    return (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-950 px-6 py-16 text-center lg:rounded-2xl">
          <p className="text-3xl lg:text-4xl">🎯</p>
          <p className="mt-3 text-base font-semibold text-white lg:mt-4 lg:text-lg">
            Er zijn vanavond nog geen wedstrijden.
          </p>
          <p className="mt-2 text-xs text-zinc-400 lg:text-sm">
            Selecteer leden en gasten, en genereer daarna de competitie.
          </p>
        </div>
    );
  }

  if (!toonLiveBorden) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-950 px-6 py-16 text-center lg:rounded-2xl">
        <p className="text-3xl lg:text-4xl">⚪</p>
        <p className="mt-3 text-base font-semibold text-white lg:mt-4 lg:text-lg">
          Geen actieve speelavond
        </p>
        <p className="mt-2 text-xs text-zinc-400 lg:text-sm">
          De wedstrijden van vrijdagavond blijven bewaard. Bekijk de laatste
          uitslagen of de stand.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex flex-wrap gap-2">
          <FilterChip
            actief={!alleenMijnWedstrijden && bordFilter === null && zoekterm === ""}
            onClick={kiesAlle}
            label="Alle"
          />
          <FilterChip
            actief={alleenMijnWedstrijden}
            onClick={() => {
              setAlleenMijnWedstrijden(true);
              setBordFilter(null);
              setZoekterm(eigenNaam);
            }}
            label="Mijn wedstrijden"
            disabled={!eigenNaam}
          />
          {bordNamen.map((naam) => (
            <FilterChip
              key={naam}
              actief={bordFilter === naam}
              onClick={() => {
                setBordFilter(naam);
                setAlleenMijnWedstrijden(false);
              }}
              label={naam}
            />
          ))}
        </div>

        <label htmlFor="wedstrijd-zoek" className="mt-4 block text-sm font-semibold text-zinc-300">
          Zoek speler
        </label>
        <input
          id="wedstrijd-zoek"
          type="search"
          value={zoekterm}
          onChange={(e) => {
            setZoekterm(e.target.value);
            setAlleenMijnWedstrijden(false);
          }}
          placeholder="Zoek speler..."
          className="mt-2 min-h-12 w-full rounded-xl border border-zinc-700 bg-black px-4 text-white focus:border-red-600 focus:outline-none"
          autoComplete="off"
        />
      </div>

      {gefilterd.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-700 px-6 py-12 text-center text-zinc-400">
          Geen wedstrijden gevonden voor deze filter.
        </div>
      ) : (
        <>
          {rondes.poule.length > 0 && (
            <RondeSectie
              titel="Ronde 1"
              ondertitel="Poulefase per bord"
              borden={rondes.poule}
              highlightNaam={highlightNaam}
              kolommen
            />
          )}
          {(rondes.winnaarsronde.length > 0 ||
            rondes.verliezersronde.length > 0) && (
            <section className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">Ronde 2</h3>
                <p className="text-sm text-zinc-400">
                  Winnaars- en verliezersronde na de poulefase.
                </p>
              </div>
              {rondes.winnaarsronde.length > 0 && (
                <RondeSectie
                  titel="🏆 Winnaarsronde"
                  borden={rondes.winnaarsronde}
                  highlightNaam={highlightNaam}
                />
              )}
              {rondes.verliezersronde.length > 0 && (
                <RondeSectie
                  titel="🔥 Verliezersronde"
                  borden={rondes.verliezersronde}
                  highlightNaam={highlightNaam}
                />
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}

function RondeSectie({
  titel,
  ondertitel,
  borden,
  highlightNaam,
  kolommen = false,
}: {
  titel: string;
  ondertitel?: string;
  borden: Bord[];
  highlightNaam: string;
  kolommen?: boolean;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-lg font-bold text-white">{titel}</h3>
        {ondertitel && <p className="text-sm text-zinc-400">{ondertitel}</p>}
      </div>
      <div
        className={
          kolommen
            ? "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
            : "grid grid-cols-1 gap-4 lg:grid-cols-2"
        }
      >
        {borden.map((bord) => (
          <BordSchemaKaart
            key={`${bord.naam}-${highlightNaam}`}
            bord={bord}
            highlightNaam={highlightNaam || undefined}
            standaardOpen={
              Boolean(highlightNaam) &&
              bord.spelers.some((speler) =>
                speler.toLowerCase().includes(highlightNaam.toLowerCase())
              )
            }
          />
        ))}
      </div>
    </section>
  );
}

function FilterChip({
  label,
  actief,
  onClick,
  disabled = false,
}: {
  label: string;
  actief: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`min-h-11 rounded-full px-3 py-1.5 text-xs font-bold transition sm:text-sm ${
        actief
          ? "bg-red-700 text-white shadow-md shadow-red-900/30"
          : "border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-red-800 hover:text-white"
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {label}
    </button>
  );
}
