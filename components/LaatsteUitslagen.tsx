"use client";

import { useState } from "react";
import { laatsteUitslagenPerBord, uitslagRegel } from "@/lib/live";
import { deelViaWhatsApp, maakLaatsteUitslagenBericht } from "@/lib/whatsapp";
import { useSpeelavond } from "@/context/SpeelavondContext";

export default function LaatsteUitslagen() {
  const { borden, spelerVanDeAvond, gestartOp, openbareEindtijd, laatsteOpslag } =
    useSpeelavond();
  const [feedback, setFeedback] = useState("");
  const uitslagen = laatsteUitslagenPerBord(borden);

  if (uitslagen.length === 0) return null;

  const deel = () => {
    const bericht = maakLaatsteUitslagenBericht(borden, {
      websiteUrl: window.location.origin,
      spelerVanDeAvond,
      gestartOp,
      openbareEindtijd,
      datum: laatsteOpslag,
    });
    deelViaWhatsApp(bericht);
    setFeedback("WhatsApp geopend met de laatste uitslagen");
    setTimeout(() => setFeedback(""), 2500);
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 lg:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white lg:text-xl">
            🏆 Laatste uitslagen
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Per gebruikt bord de meest recente gespeelde wedstrijd.
          </p>
        </div>
        <button
          type="button"
          onClick={deel}
          className="min-h-11 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-500"
        >
          Deel via WhatsApp
        </button>
      </div>

      <ul className="mt-4 space-y-2">
        {uitslagen.map((uitslag) => (
          <li
            key={uitslag.bordNaam}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">
              🎯 {uitslag.bordNaam}
            </p>
            <p className="mt-1 text-base font-semibold text-white">
              {uitslagRegel(uitslag.wedstrijd)}
            </p>
          </li>
        ))}
      </ul>

      {feedback && (
        <p className="mt-3 text-sm text-zinc-300" role="status">
          {feedback}
        </p>
      )}
    </section>
  );
}
