"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MatchCard from "@/components/player/MatchCard";
import MobileScoreEntry from "@/components/player/MobileScoreEntry";
import ProtectedAction from "@/components/ProtectedAction";
import TellerRegel from "@/components/TellerRegel";
import { useSpeelavond } from "@/context/SpeelavondContext";
import { huidigeWedstrijdOpBord } from "@/lib/live";
import { namenZijnGelijk } from "@/lib/namen";
import { planningWaarschuwingen } from "@/lib/wedstrijd-planning";
import { mijnPoulePad } from "@/lib/wedstrijd-overzicht";
import type { Bord, Wedstrijd } from "@/types/competition";
import type { SpelerWedstrijdInfo } from "@/lib/player-utils";

interface BordSchemaKaartProps {
  bord: Bord;
  standaardOpen?: boolean;
  highlightNaam?: string;
}

export default function BordSchemaKaart({
  bord,
  standaardOpen = false,
  highlightNaam,
}: BordSchemaKaartProps) {
  const { updateWedstrijd } = useSpeelavond();
  const router = useRouter();
  const [open, setOpen] = useState(standaardOpen);
  const [openWedstrijd, setOpenWedstrijd] = useState<SpelerWedstrijdInfo | null>(
    null
  );
  const gespeeld = bord.wedstrijden.filter((wedstrijd) => wedstrijd.gespeeld).length;
  const huidige = huidigeWedstrijdOpBord(bord);
  const waarschuwingen = planningWaarschuwingen(bord.wedstrijden);

  const openUitslag = (wedstrijd: Wedstrijd) => {
    setOpenWedstrijd({ bordNaam: bord.naam, wedstrijd });
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl">
      <button
        type="button"
        onClick={() => setOpen((huidig) => !huidig)}
        className="flex w-full items-start justify-between gap-3 border-b border-zinc-800 bg-zinc-950 px-4 py-3 text-left scoreboard-stripe lg:cursor-default lg:pointer-events-none"
        aria-expanded={open}
      >
        <div>
          <h3 className="text-lg font-bold text-white">🎯 {bord.naam}</h3>
          <p className="mt-0.5 text-xs text-zinc-400">
            {bord.spelers.length} spelers · {gespeeld}/{bord.wedstrijden.length}{" "}
            afgerond
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-red-700 px-2.5 py-0.5 text-[10px] font-semibold text-white">
            {bord.spelers.length} spelers
          </span>
          <span className="text-zinc-400 lg:hidden" aria-hidden>
            {open ? "▲" : "▼"}
          </span>
        </div>
      </button>

      <div className={`${open ? "block" : "hidden"} space-y-4 p-4 lg:block`}>
          <div>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-red-500">
              Spelers
            </h4>
            <ul className="space-y-1.5">
              {bord.spelers.map((speler) => {
                const isHighlight =
                  Boolean(highlightNaam) &&
                  (namenZijnGelijk(speler, highlightNaam ?? "") ||
                    speler
                      .toLowerCase()
                      .includes((highlightNaam ?? "").toLowerCase()));
                return (
                  <li key={speler}>
                    <Link
                      href={mijnPoulePad(speler)}
                      className={`flex min-h-11 cursor-pointer items-center justify-between rounded-lg border px-3 py-1.5 text-sm transition hover:border-red-700 hover:text-white ${
                        isHighlight
                          ? "border-red-600 bg-red-950/40 font-bold text-white"
                          : "border-zinc-800 bg-zinc-900 text-zinc-200"
                      }`}
                    >
                      <span>{speler}</span>
                      <span className="text-zinc-500" aria-hidden>
                        →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-red-500">
              Wedstrijden
            </h4>
            {bord.wedstrijden.length === 0 ? (
              <p className="text-sm text-zinc-500">Nog geen wedstrijden.</p>
            ) : (
              <>
                <div className="mb-3 overflow-x-auto rounded-xl border border-zinc-800">
                  <table className="min-w-full text-left text-xs text-zinc-300">
                    <thead className="bg-zinc-900 text-[10px] uppercase tracking-wider text-zinc-500">
                      <tr>
                        <th className="px-3 py-2 font-semibold">#</th>
                        <th className="px-3 py-2 font-semibold">Wedstrijd</th>
                        <th className="px-3 py-2 font-semibold">Teller</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bord.wedstrijden.map((wedstrijd, index) => (
                        <tr
                          key={`overzicht-${wedstrijd.id}`}
                          className="border-t border-zinc-800"
                        >
                          <td className="px-3 py-1.5 tabular-nums text-zinc-500">
                            {wedstrijd.volgnummer ?? index + 1}
                          </td>
                          <td className="px-3 py-1.5 text-white">
                            {wedstrijd.speler1} – {wedstrijd.speler2}
                          </td>
                          <td className="px-3 py-1.5">
                            {wedstrijd.teller ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="space-y-2">
                  {bord.wedstrijden.map((wedstrijd, index) => {
                    const isNu =
                      huidige != null &&
                      !huidige.gespeeld &&
                      wedstrijd.id === huidige.id;
                    return (
                      <div key={wedstrijd.id}>
                        {isNu && (
                          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-red-400">
                            🔴 NU AAN DE BEURT
                          </p>
                        )}
                        <MatchCard
                          wedstrijd={wedstrijd}
                          bordNaam={bord.naam}
                          compact
                          volgnummer={wedstrijd.volgnummer ?? index + 1}
                          perspectiefNaam={highlightNaam}
                          onSpelerKlik={(naam) => router.push(mijnPoulePad(naam))}
                          onOpen={() => openUitslag(wedstrijd)}
                        />
                        <TellerRegel
                          wedstrijd={wedstrijd}
                          kandidaten={bord.spelers}
                          toonLabel={false}
                          onWijzig={(teller) =>
                            updateWedstrijd(bord.naam, wedstrijd.id, { teller })
                          }
                        />
                      </div>
                    );
                  })}
                </div>
                <ProtectedAction>
                  {waarschuwingen.length > 0 && (
                    <ul className="mt-3 space-y-1 text-xs text-zinc-400">
                      {waarschuwingen.map((item) => (
                        <li key={`${item.wedstrijdIndex}-${item.speler}-${item.soort}`}>
                          {item.tekst}
                        </li>
                      ))}
                    </ul>
                  )}
                </ProtectedAction>
              </>
            )}
          </div>
      </div>

      {openWedstrijd && (
        <MobileScoreEntry
          bordNaam={openWedstrijd.bordNaam}
          wedstrijd={openWedstrijd.wedstrijd}
          onClose={() => setOpenWedstrijd(null)}
          onSave={(updates) => {
            updateWedstrijd(
              openWedstrijd.bordNaam,
              openWedstrijd.wedstrijd.id,
              updates
            );
            setOpenWedstrijd(null);
          }}
        />
      )}
    </article>
  );
}
