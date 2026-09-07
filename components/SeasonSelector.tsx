"use client";

import { useState } from "react";
import { isBasisSeizoen, maakSeizoen } from "@/lib/seasons";
import { confirmDialog } from "@/lib/ui-feedback";
import { useAuth } from "@/context/AuthContext";
import { useSpeelavond } from "@/context/SpeelavondContext";

export default function SeasonSelector() {
  const {
    actiefSeizoen,
    setActiefSeizoen,
    actiefSeizoenLabel,
    seizoenen,
    voegSeizoenToe,
    verwijderSeizoen,
    volgendSeizoenStartJaar,
  } = useSpeelavond();
  const { isBestuur } = useAuth();
  const [toevoegenOpen, setToevoegenOpen] = useState(false);
  const [startJaar, setStartJaar] = useState("");

  if (!isBestuur) {
    return (
      <p className="text-sm text-zinc-400">
        Seizoen:{" "}
        <span className="font-semibold text-white">{actiefSeizoenLabel}</span>
      </p>
    );
  }

  const voorstel = String(volgendSeizoenStartJaar);
  const ingevuld = Number(startJaar || voorstel);
  const voorbeeld = Number.isInteger(ingevuld)
    ? maakSeizoen(ingevuld).label
    : "";

  function bevestigToevoegen() {
    voegSeizoenToe(ingevuld);
    setStartJaar("");
    setToevoegenOpen(false);
  }

  return (
    <div className="flex flex-col items-start gap-2 lg:items-end">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="seizoen-select" className="text-sm text-zinc-400">
          Seizoen:
        </label>
        <select
          id="seizoen-select"
          value={actiefSeizoen}
          onChange={(e) => setActiefSeizoen(e.target.value)}
          className="min-h-11 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-semibold text-white focus:border-red-600 focus:outline-none"
        >
          {seizoenen.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setToevoegenOpen((open) => !open)}
          className="min-h-11 rounded-xl border border-zinc-700 px-3 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-900"
          aria-expanded={toevoegenOpen}
        >
          + Nieuw seizoen
        </button>

        {!isBasisSeizoen(actiefSeizoen) && (
          <button
            type="button"
            onClick={async () => {
              const bevestigd = await confirmDialog({
                title: "Seizoen verwijderen",
                message: `${actiefSeizoenLabel} uit de lijst halen? Opgeslagen speelavonden blijven bewaard.`,
                confirmLabel: "Verwijderen",
                destructive: true,
              });
              if (bevestigd) verwijderSeizoen(actiefSeizoen);
            }}
            className="min-h-11 rounded-xl border border-red-900 px-3 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-950/40"
          >
            Verwijderen
          </button>
        )}
      </div>

      {toevoegenOpen && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 p-3">
          <label htmlFor="seizoen-startjaar" className="text-sm text-zinc-400">
            Startjaar:
          </label>
          <input
            id="seizoen-startjaar"
            type="number"
            inputMode="numeric"
            min={2000}
            max={2100}
            value={startJaar}
            placeholder={voorstel}
            onChange={(e) => setStartJaar(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") bevestigToevoegen();
            }}
            className="min-h-11 w-28 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm font-semibold text-white focus:border-red-600 focus:outline-none"
          />
          <button
            type="button"
            onClick={bevestigToevoegen}
            className="min-h-11 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            Toevoegen
          </button>
          {voorbeeld && (
            <span className="text-xs text-zinc-500">Wordt: {voorbeeld}</span>
          )}
        </div>
      )}
    </div>
  );
}
