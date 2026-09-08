"use client";

import Link from "next/link";
import AvondStatusBanner from "@/components/AvondStatusBanner";
import LaatsteUitslagen from "@/components/LaatsteUitslagen";
import LiveBordOverzicht from "@/components/LiveBordOverzicht";
import PlayerSearchBar from "@/components/player/PlayerSearchBar";
import SpelerVanDeAvondBanner from "@/components/SpelerVanDeAvondBanner";
import EmptyState from "@/components/ui/EmptyState";
import { useSpeelavond } from "@/context/SpeelavondContext";
import { formatPunten, ranglijstMedaille } from "@/lib/format";
import { avondWeergaveStatus, mijnPoulePad } from "@/lib/wedstrijd-overzicht";

export default function PlayerHome() {
  const { stand, komendeSpeelavond, speelDatumLabel, borden } =
    useSpeelavond();
  const avondStatus = avondWeergaveStatus(borden);
  const topStand = stand.slice(0, 5);

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-4 scoreboard-stripe dart-ring lg:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
          🎯 DE ZUMPE
        </p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-white lg:text-4xl">
          Vrijdagavondcompetitie
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          {speelDatumLabel || komendeSpeelavond}
        </p>
      </section>

      <AvondStatusBanner />

      {avondStatus.key === "live" && <LiveBordOverzicht />}

      <PlayerSearchBar />

      <LaatsteUitslagen />

      <SpelerVanDeAvondBanner />

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 lg:p-6">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-white">🏆 Stand</h3>
          <Link
            href="/stand"
            className="text-xs font-semibold text-red-400 hover:text-red-300"
          >
            Volledige stand →
          </Link>
        </div>
        {topStand.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon="🏆"
              titel="Nog geen stand"
              tekst="De ranglijst vult zich zodra er uitslagen zijn."
            />
          </div>
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
    </div>
  );
}
