"use client";

import { bestuurBeheerLabels } from "@/lib/avond-status";
import { useAvondWeergave } from "@/hooks/useAvondWeergave";
import { useSpeelavond } from "@/context/SpeelavondContext";

export default function AvondStatusBanner() {
  const { status, isBestuur, isOpenbaarActief } = useAvondWeergave();
  const { gestartOp, openbareEindtijd, laatsteOpslag, borden } = useSpeelavond();
  const beheer = bestuurBeheerLabels({
    gestartOp,
    openbareEindtijd,
    datum: laatsteOpslag,
    borden,
  });

  const titel =
    status.key === "live"
      ? "LIVE — VRIJDAGAVOND"
      : status.key === "afgerond"
        ? "SPEELAVOND AFGEROND"
        : status.key === "geen_actieve_speelavond"
          ? "GEEN ACTIEVE SPEELAVOND"
          : status.label;

  const stijl =
    status.key === "live"
      ? "border-red-700/70 bg-red-950/30"
      : status.key === "wacht_op_start"
        ? "border-zinc-700 bg-zinc-950"
        : status.key === "afgerond"
          ? "border-zinc-700 bg-zinc-950"
          : "border-zinc-800 bg-zinc-950";

  const uitleg =
    status.key === "live"
      ? "De vrijdagavondcompetitie is nu bezig."
      : status.key === "wacht_op_start"
        ? "Wedstrijdleiding start de speelavond nog."
        : status.key === "afgerond"
          ? "Bekijk de laatste uitslagen per bord."
          : status.key === "geen_actieve_speelavond"
            ? "De openbare LIVE-status is afgelopen. Gegevens blijven bewaard."
            : "Vandaag is er geen competitie.";

  return (
    <section
      className={`rounded-2xl border px-4 py-4 lg:px-6 ${stijl}`}
      aria-live="polite"
    >
      <p
        className={`text-lg font-bold tracking-tight lg:text-2xl ${
          status.key === "live" ? "text-red-400" : "text-white"
        }`}
      >
        <span
          className={
            status.key === "live" ? "live-pulse inline-flex rounded-full" : ""
          }
        >
          {status.icoon}
        </span>{" "}
        {titel}
      </p>
      <p className="mt-1 text-sm text-zinc-400">{uitleg}</p>
      {isBestuur && borden.length > 0 && !isOpenbaarActief && (
        <dl className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
          <div className="rounded-lg border border-zinc-800 bg-black px-3 py-2">
            <dt className="uppercase tracking-wider text-zinc-500">
              Status openbaar
            </dt>
            <dd className="mt-1 font-semibold text-white">{beheer.openbaar}</dd>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-black px-3 py-2">
            <dt className="uppercase tracking-wider text-zinc-500">Gegevens</dt>
            <dd className="mt-1 font-semibold text-white">{beheer.gegevens}</dd>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-black px-3 py-2">
            <dt className="uppercase tracking-wider text-zinc-500">Bestuur</dt>
            <dd className="mt-1 font-semibold text-white">{beheer.bestuur}</dd>
          </div>
        </dl>
      )}
    </section>
  );
}
