"use client";

import { formatWedstrijd } from "@/lib/competition";
import { useSpeelavond } from "@/context/SpeelavondContext";

export default function PrintCompetition() {
  const { borden, laatsteOpslagLabel } = useSpeelavond();

  if (borden.length === 0) return null;

  return (
    <div className="print-only hidden">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Dart Vereniging De Zumpe</h1>
        <p className="mt-2 text-lg">Vrijdagavond Competitie</p>
        <p className="mt-1 text-sm text-gray-600">{laatsteOpslagLabel}</p>
      </div>

      {borden.map((bord) => (
        <section key={bord.naam} className="mb-8 break-inside-avoid">
          <h2 className="mb-2 border-b-2 border-black pb-2 text-2xl font-bold">
            🎯 {bord.naam}
          </h2>
          <p className="mb-4 text-sm">
            {bord.spelers.length} spelers · {bord.wedstrijden.length} wedstrijden
          </p>

          <div className="mb-4">
            <h3 className="mb-2 font-bold">Spelers</h3>
            <p>{bord.spelers.join(" · ")}</p>
          </div>

          <div>
            <h3 className="mb-2 font-bold">Wedstrijden</h3>
            <ol className="list-decimal pl-5">
              {bord.wedstrijden.map((wedstrijd) => (
                <li key={`${wedstrijd.speler1}-${wedstrijd.speler2}`} className="mb-1">
                  {formatWedstrijd(wedstrijd)}
                </li>
              ))}
            </ol>
          </div>
        </section>
      ))}
    </div>
  );
}
