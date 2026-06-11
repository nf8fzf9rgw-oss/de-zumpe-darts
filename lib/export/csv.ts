import type { Speelavond, SpelerStand } from "@/types/competition";

function escapeCsv(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportStandCsv(stand: SpelerStand[], seizoenLabel: string): string {
  const header = ["Seizoen", "Positie", "Speler", "Punten", "Winst", "Verlies", "180s", "HF", "%"];
  const rows = stand.map((s) =>
    [
      seizoenLabel,
      s.positie,
      s.naam,
      s.punten,
      s.gewonnen,
      s.verloren,
      s.aantal180s,
      s.hoogsteFinish || "",
      s.percentage,
    ].map(escapeCsv).join(",")
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
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
