"use client";

import { liveBordKaarten, scoreRegel } from "@/lib/live";
import { useAvondWeergave } from "@/hooks/useAvondWeergave";
import { useSpeelavond } from "@/context/SpeelavondContext";

export default function LiveBordOverzicht() {
  const { borden } = useSpeelavond();
  const { status: avondStatus, toonLiveBorden } = useAvondWeergave();
  const kaarten = liveBordKaarten(borden);

  if (
    kaarten.length === 0 ||
    !toonLiveBorden ||
    avondStatus.key === "geen_speelavond" ||
    avondStatus.key === "geen_actieve_speelavond"
  ) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-white lg:text-xl">
          {avondStatus.key === "live" ? "🔴 LIVE" : "🎯 Borden"}
        </h2>
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          {kaarten.length} {kaarten.length === 1 ? "bord" : "borden"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {kaarten.map((kaart) => {
          const { bord, status, wedstrijd } = kaart;
          const live = status.key === "live";

          return (
            <article
              key={bord.naam}
              className={`rounded-2xl border p-4 lg:p-5 ${
                live
                  ? "border-red-700/70 bg-red-950/25 scoreboard-stripe"
                  : "border-zinc-800 bg-zinc-950"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p
                  className={`text-xs font-bold uppercase tracking-[0.18em] ${
                    live ? "text-red-400" : "text-zinc-400"
                  }`}
                >
                  {status.icoon} {bord.naam}
                </p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${status.badgeClass}`}
                >
                  {status.icoon} {status.label}
                </span>
              </div>

              {wedstrijd ? (
                <div className="mt-4 text-center">
                  <p className="text-lg font-bold text-white lg:text-xl">
                    {wedstrijd.speler1}
                  </p>
                  <p
                    className={`stat-number my-2 text-4xl font-bold lg:text-5xl ${
                      live ? "text-red-500" : "text-white"
                    }`}
                  >
                    {scoreRegel(wedstrijd).replace(" – ", " — ")}
                  </p>
                  <p className="text-lg font-bold text-white lg:text-xl">
                    {wedstrijd.speler2}
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-center text-sm text-zinc-500">
                  Nog geen wedstrijd op dit bord.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
