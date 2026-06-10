"use client";

import { useMemo, useState } from "react";
import { berekenSpelerProfiel } from "@/lib/standings";
import { useSpeelavond } from "@/context/SpeelavondContext";

export default function PlayerProfilePanel() {
  const {
    leden,
    historie,
    borden,
    voegLidToe,
    hernoemLid,
    verwijderLid,
    statistieken,
  } = useSpeelavond();
  const [zoekterm, setZoekterm] = useState("");
  const [geselecteerd, setGeselecteerd] = useState<string | null>(null);
  const [nieuweNaam, setNieuweNaam] = useState("");
  const [bewerkModus, setBewerkModus] = useState(false);

  const gefilterdeLeden = useMemo(
    () =>
      leden.filter((lid) =>
        lid.toLowerCase().includes(zoekterm.toLowerCase())
      ),
    [leden, zoekterm]
  );

  const profiel = useMemo(() => {
    if (!geselecteerd) return null;
    const aanwezigheid = historie.filter((a) =>
      a.aanwezigen.includes(geselecteerd)
    ).length;
    return berekenSpelerProfiel(
      geselecteerd,
      historie,
      borden,
      aanwezigheid
    );
  }, [geselecteerd, historie, borden]);

  const handleToevoegen = () => {
    if (!nieuweNaam.trim()) return;
    voegLidToe(nieuweNaam);
    setNieuweNaam("");
  };

  const handleBewaren = () => {
    if (!geselecteerd || !nieuweNaam.trim()) return;
    hernoemLid(geselecteerd, nieuweNaam);
    setGeselecteerd(nieuweNaam.trim());
    setBewerkModus(false);
    setNieuweNaam("");
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl lg:p-6">
        <h3 className="text-xl font-bold text-white">Spelers</h3>
        <p className="mt-1 text-sm text-zinc-400">{leden.length} leden</p>

        <input
          value={zoekterm}
          onChange={(e) => setZoekterm(e.target.value)}
          placeholder="Zoek speler..."
          type="search"
          className="mt-4 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-red-600 focus:outline-none"
        />

        <div className="mt-4 flex gap-2">
          <input
            value={nieuweNaam}
            onChange={(e) => setNieuweNaam(e.target.value)}
            placeholder="Nieuwe speler..."
            className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-red-600 focus:outline-none"
            onKeyDown={(e) => e.key === "Enter" && handleToevoegen()}
          />
          <button
            type="button"
            onClick={handleToevoegen}
            className="min-h-11 rounded-xl bg-red-700 px-4 py-3 font-semibold text-white hover:bg-red-600"
          >
            +
          </button>
        </div>

        <div className="mt-4 max-h-[400px] space-y-2 overflow-y-auto">
          {gefilterdeLeden.map((lid) => (
            <button
              key={lid}
              type="button"
              onClick={() => {
                setGeselecteerd(lid);
                setBewerkModus(false);
                setNieuweNaam("");
              }}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition ${
                geselecteerd === lid
                  ? "bg-red-700 text-white"
                  : "bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              <span>{lid}</span>
              <span className="text-zinc-500">→</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl lg:p-6">
        {!geselecteerd ? (
          <div className="py-12 text-center">
            <p className="text-4xl">👤</p>
            <p className="mt-4 font-semibold text-white">Selecteer een speler</p>
            <p className="mt-2 text-sm text-zinc-400">
              Bekijk profiel, statistieken en bewerk gegevens.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-white">{geselecteerd}</h3>
                <p className="mt-1 text-sm text-zinc-400">Spelerprofiel</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setBewerkModus(true);
                    setNieuweNaam(geselecteerd);
                  }}
                  className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-300 hover:border-red-700"
                >
                  Bewerken
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`${geselecteerd} verwijderen?`)) {
                      verwijderLid(geselecteerd);
                      setGeselecteerd(null);
                    }
                  }}
                  className="rounded-lg border border-red-900 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950"
                >
                  Verwijderen
                </button>
              </div>
            </div>

            {bewerkModus && (
              <div className="mt-4 flex gap-2">
                <input
                  value={nieuweNaam}
                  onChange={(e) => setNieuweNaam(e.target.value)}
                  className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-white focus:border-red-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleBewaren}
                  className="rounded-xl bg-red-700 px-4 py-2 font-semibold text-white"
                >
                  Opslaan
                </button>
              </div>
            )}

            {profiel && (
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { label: "Aanwezigheid", waarde: `${profiel.aanwezigheid}x` },
                  { label: "Overwinningen", waarde: profiel.overwinningen },
                  { label: "Verliezen", waarde: profiel.verliezen },
                  { label: "Winpercentage", waarde: `${profiel.winpercentage}%` },
                  {
                    label: "Gespeelde wedstrijden",
                    waarde: profiel.gespeeldeWedstrijden,
                  },
                  {
                    label: "Club top aanwezig",
                    waarde: statistieken.meestAanwezig,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3"
                  >
                    <p className="text-2xl font-bold text-white">{item.waarde}</p>
                    <p className="mt-1 text-xs text-zinc-400">{item.label}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
