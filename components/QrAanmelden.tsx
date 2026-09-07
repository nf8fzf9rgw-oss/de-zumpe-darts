"use client";

import { useSpeelavond } from "@/context/SpeelavondContext";
import SpelersTeller from "@/components/SpelersTeller";

export default function QrAanmelden() {
  const {
    aanmeldToken,
    aanmeldUrl,
    startAanmelden,
    stopAanmelden,
    aanwezigen,
    dashboardStats,
  } = useSpeelavond();

  if (!aanmeldToken) {
    return (
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl lg:p-6">
        <h3 className="text-lg font-bold text-white">QR Aanmelden</h3>
        <p className="mt-2 text-sm text-zinc-400">
          Start een aanmeldsessie zodat spelers zichzelf kunnen aanmelden via QR-code.
        </p>
        <button
          type="button"
          onClick={startAanmelden}
          className="mt-4 min-h-11 w-full rounded-xl bg-red-700 px-4 py-3 font-semibold text-white hover:bg-red-600"
        >
          Start aanmelden
        </button>
      </section>
    );
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(aanmeldUrl)}`;

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl lg:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">QR Aanmelden actief</h3>
          <p className="mt-1 text-sm text-zinc-400">
            {aanwezigen.length} spelers aangemeld
          </p>
        </div>
        <button
          type="button"
          onClick={stopAanmelden}
          className="rounded-lg border border-red-900 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950"
        >
          Stoppen
        </button>
      </div>

      <SpelersTeller
        aantal={dashboardStats.totaalSpelers}
        label="Spelers vanavond"
        className="mt-4"
      />

      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrUrl}
          alt="QR-code voor aanmelden"
          width={200}
          height={200}
          className="rounded-xl border border-zinc-700 bg-white p-2"
        />
        <div className="flex-1 text-sm text-zinc-400">
          <p>Spelers scannen de QR-code en melden zichzelf aan.</p>
          <p className="mt-2 break-all font-mono text-xs text-zinc-500">
            {aanmeldUrl}
          </p>
        </div>
      </div>
    </section>
  );
}
