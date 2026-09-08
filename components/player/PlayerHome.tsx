"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MatchCard from "@/components/player/MatchCard";
import PlayerSearchBar from "@/components/player/PlayerSearchBar";
import SpelerVanDeAvondBanner from "@/components/SpelerVanDeAvondBanner";
import EmptyState from "@/components/ui/EmptyState";
import StatBlock from "@/components/ui/StatBlock";
import { useSpeelavond } from "@/context/SpeelavondContext";
import { formatPunten, ranglijstMedaille } from "@/lib/format";
import { mijnPoulePad } from "@/lib/wedstrijd-overzicht";
import { berekenAvondHighlights } from "@/lib/player-of-evening";
import {
  komendeWedstrijden,
  laadOpgeslagenSpelerNaam,
} from "@/lib/player-utils";

export default function PlayerHome() {
  const {
    dashboardStats,
    stand,
    spelerVanDeAvond,
    komendeSpeelavond,
    speelDatumLabel,
    laatsteOpslag,
    borden,
  } = useSpeelavond();

  const [opgeslagenSpeler, setOpgeslagenSpeler] = useState("");

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- localStorage hydratie na mount */
    setOpgeslagenSpeler(laadOpgeslagenSpelerNaam());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const komende = komendeWedstrijden(borden, opgeslagenSpeler || null, 5);
  const highlights = berekenAvondHighlights(borden);
  const topStand = stand.slice(0, 5);

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-4 scoreboard-stripe dart-ring lg:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-red-500">
          🎯 Vrijdagavond Competitie
        </p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-white lg:text-4xl">
          De Zumpe
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          {speelDatumLabel || komendeSpeelavond}
          {laatsteOpslag ? "" : " · volgende vrijdag"}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatBlock
            label="Aanwezige spelers"
            waarde={dashboardStats.totaalSpelers}
            size="md"
          />
          <StatBlock
            label="Borden"
            waarde={dashboardStats.aantalBorden}
            size="md"
          />
          <StatBlock
            label="Wedstrijden"
            waarde={`${dashboardStats.gespeeldeWedstrijden}/${dashboardStats.totaalWedstrijden}`}
            size="md"
          />
          <StatBlock
            label="Speelavond"
            waarde={dashboardStats.aantalBorden > 0 ? "Live" : "—"}
            accent={dashboardStats.aantalBorden > 0}
            size="md"
          />
        </div>
      </section>

      <PlayerSearchBar />

      <SpelerVanDeAvondBanner />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <HighlightKaart
          icon="🏆"
          label="Speler van de Avond"
          naam={spelerVanDeAvond ?? "Nog niet bepaald"}
          detail="Na gespeelde wedstrijden"
        />
        <HighlightKaart
          icon="🎯"
          label="Meeste 180's"
          naam={highlights.meeste180s?.naam ?? "Nog geen 180"}
          detail={
            highlights.meeste180s
              ? `${highlights.meeste180s.aantal} × 180 vanavond`
              : "Wordt bijgewerkt na uitslagen"
          }
          grootGetal={highlights.meeste180s?.aantal}
        />
        <HighlightKaart
          icon="💯"
          label="Hoogste finish"
          naam={highlights.hoogsteFinish?.naam ?? "Nog geen 100+"}
          detail={
            highlights.hoogsteFinish
              ? `HF ${highlights.hoogsteFinish.finish}`
              : "Finishes vanaf 100 tellen mee"
          }
          grootGetal={highlights.hoogsteFinish?.finish}
          accent
        />
      </div>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 lg:p-6">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-white">📈 Ranglijst</h3>
          <Link
            href="/stand"
            className="text-xs font-semibold text-red-400 hover:text-red-300"
          >
            Volledige stand →
          </Link>
        </div>
        {topStand.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
            De ranglijst vult zich zodra er uitslagen zijn.
          </p>
        ) : (
          <ol className="mt-4 space-y-2">
            {topStand.map((rij) => (
              <li key={rij.naam}>
                <Link
                  href={mijnPoulePad(rij.naam)}
                  className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 transition hover:border-red-800/60"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="w-7 text-center text-sm font-bold">
                      {ranglijstMedaille(rij.positie)}
                    </span>
                    <span className="truncate font-semibold text-white">
                      {rij.naam}
                    </span>
                  </span>
                  <span className="stat-number shrink-0 text-lg font-bold text-red-500">
                    {formatPunten(rij.punten)}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 lg:p-6">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-white">Komende wedstrijden</h3>
          <Link
            href="/competitie"
            className="text-xs font-semibold text-red-400 hover:text-red-300"
          >
            Alle wedstrijden →
          </Link>
        </div>
        {komende.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon="🎯"
              titel={
                borden.length === 0
                  ? "Er zijn vanavond nog geen wedstrijden."
                  : "Alle wedstrijden zijn afgerond."
              }
              tekst={
                borden.length === 0
                  ? "Wacht tot wedstrijdleiding de competitie start."
                  : "Bekijk de ranglijst of Hall of Fame voor de tussenstand."
              }
            />
          </div>
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
        <Link
          href="/mijn-poule"
          className="mt-4 flex min-h-12 items-center justify-center rounded-xl bg-red-600 text-sm font-bold text-white hover:bg-red-500"
        >
          Bekijk mijn poule →
        </Link>
      </section>
    </div>
  );
}

function HighlightKaart({
  icon,
  label,
  naam,
  detail,
  grootGetal,
  accent = false,
}: {
  icon: string;
  label: string;
  naam: string;
  detail: string;
  grootGetal?: number;
  accent?: boolean;
}) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {icon} {label}
      </p>
      {grootGetal != null && (
        <p
          className={`stat-number mt-2 text-4xl font-bold ${
            accent ? "text-red-500" : "text-white"
          }`}
        >
          {grootGetal}
        </p>
      )}
      <p className="mt-1 truncate text-base font-semibold text-white">{naam}</p>
      <p className="mt-0.5 text-xs text-zinc-500">{detail}</p>
    </article>
  );
}
