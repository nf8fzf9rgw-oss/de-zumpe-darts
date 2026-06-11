"use client";

import { useState } from "react";
import BestuurLoginModal from "@/components/BestuurLoginModal";
import { useAuth } from "@/context/AuthContext";
import { useSpeelavond } from "@/context/SpeelavondContext";

export default function Header() {
  const { laatsteOpslagLabel } = useSpeelavond();
  const { isBestuur, logoutBestuur } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  const vandaag = new Date().toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <header className="no-print sticky top-0 z-30 border-b border-zinc-800 bg-black/90 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-4 lg:px-8 lg:py-5">
          <div className="min-w-0">
            <p className="hidden text-xs font-semibold uppercase tracking-[0.25em] text-red-500 md:block">
              Vrijdagavond Competitie
            </p>
            <h1 className="truncate text-lg font-bold text-white md:text-xl lg:text-2xl">
              <span className="lg:hidden">De Zumpe</span>
              <span className="hidden lg:inline">🎯 De Zumpe</span>
            </h1>
            <p className="mt-0.5 truncate text-xs capitalize text-zinc-400 md:text-sm lg:mt-1">
              {vandaag}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 md:text-xs">
                Laatste opslag
              </p>
              <p className="mt-0.5 text-xs font-semibold text-white md:text-sm">
                {laatsteOpslagLabel}
              </p>
            </div>

            {isBestuur ? (
              <button
                type="button"
                onClick={logoutBestuur}
                className="min-h-11 rounded-xl border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 sm:px-4 sm:text-sm"
              >
                Bestuur Uitloggen
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                className="min-h-11 rounded-xl bg-red-700 px-3 py-2 text-xs font-bold text-white hover:bg-red-600 sm:px-4 sm:text-sm"
              >
                Bestuur Login
              </button>
            )}
          </div>
        </div>
      </header>

      <BestuurLoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
