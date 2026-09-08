"use client";

import { useState } from "react";
import BestuurLoginModal from "@/components/BestuurLoginModal";
import { useAuth } from "@/context/AuthContext";
import { useSpeelavond } from "@/context/SpeelavondContext";
import { avondWeergaveStatus } from "@/lib/wedstrijd-overzicht";

export default function Header() {
  const { laatsteOpslagLabel, dashboardStats, borden, speelDatumLabel } =
    useSpeelavond();
  const { isBestuur, logoutBestuur } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const avondStatus = avondWeergaveStatus(borden);

  const vandaag = new Date().toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <>
      <header className="no-print sticky top-0 z-30 border-b border-zinc-800/80 bg-black/90 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 md:px-6 lg:px-8">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <h1 className="truncate text-base font-bold tracking-tight text-white md:text-lg">
                🎯 De Zumpe
              </h1>
              <p className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-red-500 sm:block">
                Vrijdagavond Competitie
              </p>
            </div>
            <p className="mt-0.5 truncate text-[11px] capitalize text-zinc-400 md:text-xs">
              {speelDatumLabel || vandaag}
              <span className="mx-1.5 text-zinc-700">·</span>
              {dashboardStats.totaalSpelers} spelers
              <span className="mx-1.5 text-zinc-700">·</span>
              {avondStatus.icoon} {avondStatus.label}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                {isBestuur ? "Wedstrijdleiding" : "Laatste opslag"}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-white">
                {laatsteOpslagLabel}
              </p>
            </div>

            {isBestuur ? (
              <button
                type="button"
                onClick={logoutBestuur}
                className="min-h-10 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 sm:px-4"
              >
                Uitloggen
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                className="min-h-10 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-500 sm:px-4"
              >
                Wedstrijdleiding
              </button>
            )}
          </div>
        </div>
      </header>

      <BestuurLoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
