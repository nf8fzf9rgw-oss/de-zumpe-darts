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
        <h1 className="print-title">Speelavond</h1>
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
            <ul className="print-spelers-lijst">
              {bord.spelers.map((speler) => (
                <li key={speler}>{speler}</li>
              ))}
            </ul>
          </div>

          <div className="print-section">
            <h3 className="print-section-title">Wedstrijden</h3>
            <ul className="print-wedstrijden-lijst">
              {bord.wedstrijden.map((wedstrijd) => (
                <li key={wedstrijd.id} className="print-wedstrijd-item">
                  <span className="print-checkbox" aria-hidden>
                    ☐
                  </span>
                  <span>{formatWedstrijd(wedstrijd)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      <footer className="print-footer">
        <p>Dart Vereniging De Zumpe — {seizoenLabel(seizoen)}</p>
      </footer>
    </div>
  );
}
