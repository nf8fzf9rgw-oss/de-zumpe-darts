"use client";

import { useState } from "react";
import {
  deelViaWhatsApp,
  kopieerNaarKlembord,
  maakLaatsteUitslagenBericht,
  maakRanglijstBericht,
  maakSpelerVanDeAvondBericht,
} from "@/lib/whatsapp";
import { useSpeelavond } from "@/context/SpeelavondContext";

export default function WhatsAppShare() {
  const { stand, actiefSeizoenLabel, spelerVanDeAvond, borden } =
    useSpeelavond();
  const [feedback, setFeedback] = useState("");

  const toonFeedback = (tekst: string) => {
    setFeedback(tekst);
    setTimeout(() => setFeedback(""), 2500);
  };

  const deelRanglijst = () => {
    deelViaWhatsApp(maakRanglijstBericht(stand, actiefSeizoenLabel));
  };

  const deelSpelerVanDeAvond = () => {
    if (!spelerVanDeAvond) {
      toonFeedback("Nog geen speler van de avond");
      return;
    }
    deelViaWhatsApp(
      maakSpelerVanDeAvondBericht(spelerVanDeAvond, actiefSeizoenLabel)
    );
  };

  const deelUitslag = async () => {
    if (borden.length === 0) {
      toonFeedback("Geen speelavond om te delen");
      return;
    }
    const bericht = maakLaatsteUitslagenBericht(borden, {
      websiteUrl: window.location.origin,
      spelerVanDeAvond,
    });
    const gekopieerd = await kopieerNaarKlembord(bericht);
    deelViaWhatsApp(bericht);
    toonFeedback(
      gekopieerd
        ? "Uitslagen gekopieerd en WhatsApp geopend"
        : "WhatsApp geopend met de laatste uitslagen"
    );
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl lg:p-6">
      <h3 className="text-lg font-bold text-white">WhatsApp delen</h3>
      <p className="mt-1 text-sm text-zinc-400">
        Deel de laatste uitslagen per bord, de ranglijst of de speler van de
        avond.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={deelUitslag}
          className="min-h-11 flex-1 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500"
        >
          Laatste uitslagen delen
        </button>
        <button
          type="button"
          onClick={deelRanglijst}
          className="min-h-11 flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-700"
        >
          Ranglijst delen
        </button>
        <button
          type="button"
          onClick={deelSpelerVanDeAvond}
          className="min-h-11 flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-700"
        >
          Speler van de avond
        </button>
      </div>
      {feedback && (
        <p className="mt-3 text-sm text-zinc-200" role="status">
          {feedback}
        </p>
      )}
    </section>
  );
}
