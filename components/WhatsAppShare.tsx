"use client";

import { useState } from "react";
import {
  deelViaWhatsApp,
  kopieerNaarKlembord,
  maakRanglijstBericht,
  maakSpelerVanDeAvondBericht,
  maakUitslagBericht,
} from "@/lib/whatsapp";
import { useSpeelavond } from "@/context/SpeelavondContext";

export default function WhatsAppShare() {
  const {
    stand,
    actiefSeizoenLabel,
    spelerVanDeAvond,
    avondVoorPrint,
    borden,
  } = useSpeelavond();
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
    const bericht = maakUitslagBericht(avondVoorPrint);
    const gekopieerd = await kopieerNaarKlembord(bericht);
    if (gekopieerd) {
      toonFeedback("Uitslag gekopieerd — plak in WhatsApp");
    } else {
      deelViaWhatsApp(bericht);
    }
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl lg:p-6">
      <h3 className="text-lg font-bold text-white">WhatsApp delen</h3>
      <p className="mt-1 text-sm text-zinc-400">
        Deel ranglijst, speler van de avond of uitslagen.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={deelRanglijst}
          className="min-h-11 flex-1 rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white hover:bg-green-600"
        >
          Ranglijst delen
        </button>
        <button
          type="button"
          onClick={deelSpelerVanDeAvond}
          className="min-h-11 flex-1 rounded-xl bg-amber-700 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-600"
        >
          Speler van de avond
        </button>
        <button
          type="button"
          onClick={deelUitslag}
          className="min-h-11 flex-1 rounded-xl bg-zinc-700 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-600"
        >
          Uitslag delen
        </button>
      </div>
      {feedback && (
        <p className="mt-3 text-sm text-green-400" role="status">
          {feedback}
        </p>
      )}
    </section>
  );
}
