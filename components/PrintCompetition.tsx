"use client";

import { formatWedstrijd } from "@/lib/competition";
import { seizoenLabel } from "@/lib/seasons";
import { formatDatumAlleen } from "@/lib/storage";
import { useSpeelavond } from "@/context/SpeelavondContext";
import type { Speelavond } from "@/types/competition";

interface PrintCompetitionProps {
  avond?: Speelavond;
  variant?: "print" | "preview";
}

export default function PrintCompetition({
  avond: avondProp,
  variant = "print",
}: PrintCompetitionProps) {
  const { avondVoorPrint } = useSpeelavond();
  const avond = avondProp ?? avondVoorPrint;
  const { borden, datum, seizoen } = avond;

  if (borden.length === 0) return null;

  const datumLabel = formatDatumAlleen(datum);
  const isPreview = variant === "preview";

  return (
    <div
      className={
        isPreview
          ? "print-document-preview bg-white text-black"
          : "print-document print-only"
      }
    >
      <header className="print-header">
        <p className="print-club-sub">Dart Vereniging De Zumpe</p>
        <h1 className="print-title">Speelschema Vrijdagavond</h1>
        <div className="print-meta">
          <span>Datum: {datumLabel}</span>
          <span>{seizoenLabel(seizoen)}</span>
        </div>
      </header>

      {borden.map((bord, index) => (
        <section
          key={bord.naam}
          className={`print-bord ${index < borden.length - 1 ? "print-page-break" : ""}`}
        >
          <h2 className="print-bord-title">{bord.naam.toUpperCase()}</h2>

          <div className="print-section">
            <h3 className="print-section-title">Spelers</h3>
            <p className="print-spelers-inline">
              {bord.spelers.join(" · ")}
            </p>
          </div>

          <div className="print-section">
            <h3 className="print-section-title">Wedstrijden</h3>
            <table className="print-wedstrijden-tabel">
              <thead>
                <tr>
                  <th className="print-th-check" scope="col">Gespeeld</th>
                  <th scope="col">Wedstrijd</th>
                  <th scope="col">Teller</th>
                  <th className="print-th-score" scope="col">Score</th>
                </tr>
              </thead>
              <tbody>
                {bord.wedstrijden.map((wedstrijd) => (
                  <tr key={wedstrijd.id} className="print-wedstrijd-row">
                    <td className="print-td-check">
                      <span className="print-checkbox" aria-hidden>[ ]</span>
                    </td>
                    <td>{formatWedstrijd(wedstrijd)}</td>
                    <td>{wedstrijd.teller ?? "—"}</td>
                    <td className="print-td-score">
                      <span className="print-score-blank" aria-hidden>_____</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <footer className="print-footer">
        <p>Dart Vereniging De Zumpe — {seizoenLabel(seizoen)}</p>
      </footer>
    </div>
  );
}
