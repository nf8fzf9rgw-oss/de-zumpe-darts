import type { Speelavond, SpelerStand } from "@/types/competition";

function escapeCsv(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportStandCsv(stand: SpelerStand[], seizoenLabel: string): string {
  const header = [
    "Seizoen",
    "Positie",
    "Speler",
    "Aanwezig",
    "Poulepunten",
    "W legs W-ronde",
    "V legs W-ronde",
    "W legs V-ronde",
    "V legs V-ronde",
    "Hoogste finish",
    "180s",
    "Punten totaal",
    "Nieuwe punten",
    "Bron",
  ];
  const rows = stand.map((s) =>
    [
      seizoenLabel,
      s.positie,
      s.naam,
      s.aanwezig,
      s.poulepunten,
      s.winnaarsrondeLegsGewonnen,
      s.winnaarsrondeLegsVerloren,
      s.verliezersrondeLegsGewonnen,
      s.verliezersrondeLegsVerloren,
      s.hoogsteFinish || "",
      s.aantal180s,
      s.punten,
      s.nieuwePunten,
      s.bron,
    ]
      .map(escapeCsv)
      .join(",")
  );
  return [header.join(","), ...rows].join("\n");
}

export function exportHistorieCsv(historie: Speelavond[]): string {
  const header = [
    "Datum",
    "Seizoen",
    "Aanwezigen",
    "Gasten",
    "Borden",
    "Wedstrijden",
    "Speler van de avond",
  ];
  const rows = historie.map((avond) => {
    const wedstrijden = avond.borden.reduce(
      (t, b) => t + b.wedstrijden.length,
      0
    );
    return [
      avond.datum,
      avond.seizoen,
      avond.aanwezigen.length,
      avond.gasten.length,
      avond.borden.length,
      wedstrijden,
      avond.spelerVanDeAvond ?? "",
    ]
      .map(escapeCsv)
      .join(",");
  });
  return [header.join(","), ...rows].join("\n");
}

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob(["\uFEFF" + content], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  // Een seizoenlabel als "Seizoen 2025/2026" mag geen padscheiding worden.
  link.download = filename.replace(/[\\/:*?"<>|]/g, "-");
  link.click();
  URL.revokeObjectURL(url);
}
