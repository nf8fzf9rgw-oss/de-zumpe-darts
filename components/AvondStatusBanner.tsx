"use client";

import { avondWeergaveStatus } from "@/lib/wedstrijd-overzicht";
import { useSpeelavond } from "@/context/SpeelavondContext";

export default function AvondStatusBanner() {
  const { borden } = useSpeelavond();
  const status = avondWeergaveStatus(borden);

  const titel =
    status.key === "live"
      ? "LIVE — VRIJDAGAVOND"
      : status.key === "afgerond"
        ? "SPEELAVOND AFGEROND"
        : status.label;

  const stijl =
    status.key === "live"
      ? "border-red-700/70 bg-red-950/30"
      : status.key === "wacht_op_start"
        ? "border-zinc-700 bg-zinc-950"
        : status.key === "afgerond"
          ? "border-zinc-700 bg-zinc-950"
          : "border-zinc-800 bg-zinc-950";

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
      <p className="mt-1 text-sm text-zinc-400">
        {status.key === "live"
          ? "De vrijdagavondcompetitie is nu bezig."
          : status.key === "wacht_op_start"
            ? "Wedstrijdleiding start de speelavond nog."
            : status.key === "afgerond"
              ? "Bekijk de laatste uitslagen per bord."
              : "Vandaag is er geen competitie."}
      </p>
    </section>
  );
}
