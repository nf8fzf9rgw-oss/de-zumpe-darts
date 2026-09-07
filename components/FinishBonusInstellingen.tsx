"use client";

import { useEffect, useState } from "react";
import {
  laadFinishBonusTabel,
  slaFinishBonusTabelOp,
  herstelFinishBonusTabel,
  STANDAARD_FINISH_BONUS,
  type FinishBonusRegel,
} from "@/lib/scoring";
import { toast } from "@/lib/ui-feedback";

export default function FinishBonusInstellingen() {
  const [regels, setRegels] = useState<FinishBonusRegel[]>(STANDAARD_FINISH_BONUS);

  useEffect(() => {
    // localStorage is pas op de client beschikbaar
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRegels(laadFinishBonusTabel());
  }, []);

  const wijzig = (
    index: number,
    veld: keyof FinishBonusRegel,
    waarde: string
  ) => {
    const nummer = Number(waarde);
    setRegels((huidig) =>
      huidig.map((regel, i) =>
        i === index ? { ...regel, [veld]: nummer } : regel
      )
    );
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 lg:p-6">
      <h3 className="text-lg font-bold text-white">Finish-bonuspunten</h3>
      <p className="mt-1 text-sm text-zinc-400">
        Alleen voor nieuwe wedstrijden. De officiële tussenstand blijft
        ongewijzigd.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[320px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400">
              <th className="py-2 pr-3">Van</th>
              <th className="py-2 pr-3">Tot</th>
              <th className="py-2">Bonus</th>
            </tr>
          </thead>
          <tbody>
            {regels.map((regel, index) => (
              <tr key={`${regel.min}-${regel.max}-${index}`} className="border-b border-zinc-800/60">
                <td className="py-2 pr-3">
                  <input
                    type="number"
                    min={0}
                    max={170}
                    value={regel.min}
                    onChange={(e) => wijzig(index, "min", e.target.value)}
                    className="w-20 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-white"
                  />
                </td>
                <td className="py-2 pr-3">
                  <input
                    type="number"
                    min={0}
                    max={170}
                    value={regel.max}
                    onChange={(e) => wijzig(index, "max", e.target.value)}
                    className="w-20 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-white"
                  />
                </td>
                <td className="py-2">
                  <input
                    type="number"
                    min={0}
                    value={regel.bonus}
                    onChange={(e) => wijzig(index, "bonus", e.target.value)}
                    className="w-20 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-white"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            if (slaFinishBonusTabelOp(regels)) {
              toast("Finish-bonustabel opgeslagen.", "success");
            } else {
              toast("Ongeldige tabel. Controleer de waarden.", "error");
            }
          }}
          className="min-h-11 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
        >
          Opslaan
        </button>
        <button
          type="button"
          onClick={() => {
            herstelFinishBonusTabel();
            setRegels(STANDAARD_FINISH_BONUS);
            toast("Standaardtabel hersteld.", "info");
          }}
          className="min-h-11 rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 hover:bg-zinc-900"
        >
          Standaard
        </button>
      </div>
    </section>
  );
}
