"use client";

import { useMemo, useState } from "react";
import ProtectedAction from "@/components/ProtectedAction";
import { formatPunten } from "@/lib/format";
import { haalHistorischeSpeler } from "@/lib/historische-tussenstand";
import { berekenSpelerProfiel } from "@/lib/standings";
import { confirmDialog, toast } from "@/lib/ui-feedback";
import { useSpeelavond } from "@/context/SpeelavondContext";

export default function PlayerProfilePanel() {
  const {
    leden,
    seizoenHistorie,
    borden,
    voegLidToe,
    hernoemLid,
    verwijderLid,
    actiefSeizoen,
    actiefSeizoenLabel,
    laatsteOpslag,
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
    return berekenSpelerProfiel(
      geselecteerd,
      seizoenHistorie,
      borden,
      actiefSeizoen,
      laatsteOpslag
    );
  }, [geselecteerd, seizoenHistorie, borden, actiefSeizoen, laatsteOpslag]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl lg:p-6">
        <h3 className="text-xl font-bold text-white">Spelers</h3>
        <p className="mt-1 text-sm text-zinc-400">
          {leden.length} leden · {actiefSeizoenLabel}
        </p>

        <input
          value={zoekterm}
          onChange={(e) => setZoekterm(e.target.value)}
          placeholder="Zoek speler..."
          type="search"
          className="mt-4 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-red-600"
        />

        <div className="mt-4 flex gap-2">
          <ProtectedAction>
            <>
              <input
                value={nieuweNaam}
                onChange={(e) => setNieuweNaam(e.target.value)}
                placeholder="Nieuwe speler..."
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && nieuweNaam.trim()) {
                    voegLidToe(nieuweNaam);
                    setNieuweNaam("");
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (nieuweNaam.trim()) {
                    voegLidToe(nieuweNaam);
                    setNieuweNaam("");
                  }
                }}
                className="min-h-11 rounded-xl bg-red-700 px-4 py-3 font-semibold text-white"
              >
                +
              </button>
            </>
          </ProtectedAction>
        </div>

        <div className="mt-4 max-h-[400px] space-y-2 overflow-y-auto">
          {gefilterdeLeden.map((lid) => {
            const officieel = haalHistorischeSpeler(actiefSeizoen, lid);
            return (
              <button
                key={lid}
                type="button"
                onClick={() => {
                  setGeselecteerd(lid);
                  setBewerkModus(false);
                }}
                className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left ${
                  geselecteerd === lid
                    ? "bg-red-700 text-white"
                    : "bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                <span>{lid}</span>
                {officieel ? (
                  <span className="shrink-0 text-xs opacity-80">
                    #{officieel.positie} · {formatPunten(officieel.puntenTotaal)}{" "}
                    pt
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
                    nieuw
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl lg:p-6">
        {!geselecteerd || !profiel ? (
          <div className="py-12 text-center">
            <p className="text-4xl">👤</p>
            <p className="mt-4 font-semibold text-white">Selecteer een speler</p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-white">{profiel.naam}</h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Positie #{profiel.positie || "—"} · {formatPunten(profiel.punten)}{" "}
                  punten
                  {profiel.officielePositie !== null && (
                    <span className="text-zinc-500">
                      {" "}
                      · officieel #{profiel.officielePositie}
                    </span>
                  )}
                </p>
              </div>
              <ProtectedAction>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBewerkModus(true);
                      setNieuweNaam(geselecteerd);
                    }}
                    className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-300"
                  >
                    Bewerken
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const bevestigd = await confirmDialog({
                        title: "Speler verwijderen",
                        message: `Weet je zeker dat je ${geselecteerd} wilt verwijderen?`,
                        confirmLabel: "Verwijderen",
                        destructive: true,
                      });
                      if (!bevestigd) return;
                      verwijderLid(geselecteerd);
                      setGeselecteerd(null);
                      toast("Speler verwijderd.", "success");
                    }}
                    className="rounded-lg border border-red-900 px-3 py-2 text-xs font-semibold text-red-400"
                  >
                    Verwijderen
                  </button>
                </div>
              </ProtectedAction>
            </div>

            <ProtectedAction>
              {bewerkModus && (
                <div className="mt-4 flex gap-2">
                  <input
                    value={nieuweNaam}
                    onChange={(e) => setNieuweNaam(e.target.value)}
                    className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      hernoemLid(geselecteerd, nieuweNaam);
                      setGeselecteerd(nieuweNaam.trim());
                      setBewerkModus(false);
                    }}
                    className="rounded-xl bg-red-700 px-4 py-2 font-semibold text-white"
                  >
                    Opslaan
                  </button>
                </div>
              )}
            </ProtectedAction>

            {profiel.badges.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {profiel.badges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-red-800/50 bg-red-950/50 px-3 py-1 text-xs font-semibold text-red-300"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { label: "Positie", waarde: profiel.positie ? `#${profiel.positie}` : "—" },
                { label: "Punten", waarde: formatPunten(profiel.punten) },
                { label: "Wedstrijden", waarde: profiel.gespeeldeWedstrijden },
                {
                  label: "Winst / verlies",
                  waarde: `${profiel.overwinningen} / ${profiel.verliezen}`,
                },
                {
                  label: "Legs",
                  waarde: `${profiel.legsVoor} – ${profiel.legsTegen}`,
                },
                { label: "Aantal 180", waarde: profiel.aantal180s },
                { label: "Hoogste finish", waarde: profiel.hoogsteFinish || "—" },
                { label: "Aanwezigheid", waarde: `${profiel.aanwezigheid}x` },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3"
                >
                  <p className="text-xl font-bold text-white">{item.waarde}</p>
                  <p className="mt-1 text-xs text-zinc-400">{item.label}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
