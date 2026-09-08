import type { ClubRecords, Speelavond, SpelerStand } from "@/types/competition";
import { formatPunten } from "@/lib/format";

function veiligeBestandsnaam(filename: string): string {
  return filename.replace(/[\\/:*?"<>|]/g, "-");
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = veiligeBestandsnaam(filename);
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadExcelHtml(html: string, filename: string): void {
  const documentHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`;
  downloadBlob(
    new Blob([documentHtml], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    }),
    filename.endsWith(".xls") ? filename : `${filename}.xls`
  );
}

export function printHtmlAlsPdf(html: string, titel: string): void {
  const venster = window.open("", "_blank", "noopener,noreferrer");
  if (!venster) return;
  venster.document.write(`<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <title>${titel}</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; color: #111; padding: 24px; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    p { color: #555; margin: 0 0 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #333; padding: 6px 8px; text-align: left; }
    th { background: #f3f3f3; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`);
  venster.document.close();
  venster.focus();
  venster.print();
}

export function standNaarTabelHtml(
  stand: SpelerStand[],
  seizoenLabel: string
): string {
  const rijen = stand
    .map(
      (rij) => `<tr>
        <td>${rij.positie}</td>
        <td>${rij.naam}</td>
        <td>${formatPunten(rij.punten)}</td>
        <td>${rij.gewonnen}</td>
        <td>${rij.aantal180s}</td>
        <td>${rij.hoogsteFinish > 0 ? rij.hoogsteFinish : ""}</td>
      </tr>`
    )
    .join("");

  return `<h1>Ranglijst ${seizoenLabel}</h1>
<p>Dart Vereniging De Zumpe</p>
<table>
  <thead>
    <tr><th>#</th><th>Naam</th><th>Punten</th><th>Wins</th><th>180's</th><th>HF</th></tr>
  </thead>
  <tbody>${rijen}</tbody>
</table>`;
}

export function spelersNaarTabelHtml(spelers: string[]): string {
  const rijen = spelers.map((naam, index) => `<tr><td>${index + 1}</td><td>${naam}</td></tr>`).join("");
  return `<h1>Spelers</h1>
<p>Dart Vereniging De Zumpe</p>
<table>
  <thead><tr><th>#</th><th>Naam</th></tr></thead>
  <tbody>${rijen}</tbody>
</table>`;
}

export function recordsNaarTabelHtml(records: ClubRecords, seizoenLabel: string): string {
  const rijen = [
    ["Meeste 180's", records.meeste180s.naam, records.meeste180s.label],
    ["Hoogste finish", records.hoogsteFinish.naam, records.hoogsteFinish.label],
    ["Meeste overwinningen", records.meesteOverwinningen.naam, records.meesteOverwinningen.label],
    ["Hoogste winstpercentage", records.hoogsteWinstpercentage.naam, records.hoogsteWinstpercentage.label],
    ["Langste winstreeks", records.langsteWinstreeks.naam, records.langsteWinstreeks.label],
  ]
    .map((rij) => `<tr><td>${rij[0]}</td><td>${rij[1]}</td><td>${rij[2]}</td></tr>`)
    .join("");

  return `<h1>Clubrecords ${seizoenLabel}</h1>
<p>Dart Vereniging De Zumpe</p>
<table>
  <thead><tr><th>Record</th><th>Speler</th><th>Waarde</th></tr></thead>
  <tbody>${rijen}</tbody>
</table>`;
}

export function speelavondenNaarTabelHtml(historie: Speelavond[]): string {
  const rijen = historie
    .map((avond) => {
      const wedstrijden = avond.borden.reduce(
        (totaal, bord) => totaal + bord.wedstrijden.length,
        0
      );
      return `<tr>
        <td>${avond.datum}</td>
        <td>${avond.seizoen}</td>
        <td>${avond.aanwezigen.length + avond.gasten.length}</td>
        <td>${avond.borden.length}</td>
        <td>${wedstrijden}</td>
        <td>${avond.spelerVanDeAvond ?? ""}</td>
      </tr>`;
    })
    .join("");

  return `<h1>Speelavonden</h1>
<p>Dart Vereniging De Zumpe</p>
<table>
  <thead>
    <tr><th>Datum</th><th>Seizoen</th><th>Spelers</th><th>Borden</th><th>Wedstrijden</th><th>Speler van de Avond</th></tr>
  </thead>
  <tbody>${rijen}</tbody>
</table>`;
}
