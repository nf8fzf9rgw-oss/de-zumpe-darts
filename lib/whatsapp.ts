import type { Speelavond, SpelerStand } from "@/types/competition";

export function maakRanglijstBericht(
  stand: SpelerStand[],
  seizoenLabel: string
): string {
  const top = stand.slice(0, 10);
  const regels = top.map(
    (s) =>
      `${s.positie}. ${s.naam} - ${s.punten} punten (${s.gewonnen}W, ${s.aantal180s}x180, HF${s.hoogsteFinish || "-"})`
  );

  const meeste180 = [...stand].sort((a, b) => b.aantal180s - a.aantal180s)[0];

  let bericht = `🏆 Ranglijst De Zumpe\n${seizoenLabel}\n\n`;
  bericht += regels.join("\n");
  if (meeste180 && meeste180.aantal180s > 0) {
    bericht += `\n\n🎯 Meeste 180's: ${meeste180.naam} (${meeste180.aantal180s})`;
  }
  return bericht;
}

export function maakSpelerVanDeAvondBericht(
  speler: string,
  seizoenLabel: string
): string {
  return `⭐ Speler van de avond — De Zumpe\n${seizoenLabel}\n\n${speler} is vanavond de beste speler! 🎯🏆`;
}

export function maakUitslagBericht(avond: Speelavond): string {
  const datum = new Date(avond.datum).toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const spelers = avond.aanwezigen.length + avond.gasten.length;
  const wedstrijden = avond.borden.reduce((t, b) => t + b.wedstrijden.length, 0);
  const gespeeld = avond.borden.reduce(
    (t, b) => t + b.wedstrijden.filter((w) => w.gespeeld).length,
    0
  );

  let bericht = `🎯 Uitslag De Zumpe — ${datum}\n\n`;
  bericht += `👥 ${spelers} spelers · ${avond.borden.length} borden\n`;
  bericht += `🏆 ${gespeeld}/${wedstrijden} wedstrijden gespeeld\n`;
  if (avond.spelerVanDeAvond) {
    bericht += `\n⭐ Speler van de avond: ${avond.spelerVanDeAvond}`;
  }
  return bericht;
}

export function deelViaWhatsApp(bericht: string): void {
  const url = `https://wa.me/?text=${encodeURIComponent(bericht)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function kopieerNaarKlembord(bericht: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(bericht);
    return true;
  } catch {
    return false;
  }
}
