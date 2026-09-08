import type { Bord, Speelavond, SpelerStand } from "@/types/competition";
import { formatPunten } from "@/lib/format";
import {
  laatsteUitslagenPerBord,
  liveWedstrijdenPerBord,
  uitslagRegel,
} from "@/lib/live";
import { avondWeergaveStatus } from "@/lib/wedstrijd-overzicht";

export function maakRanglijstBericht(
  stand: SpelerStand[],
  seizoenLabel: string
): string {
  const top = stand.slice(0, 10);
  const regels = top.map((s) => {
    const hf = s.hoogsteFinish > 0 ? s.hoogsteFinish : "—";
    return `${s.positie}. ${s.naam} – ${formatPunten(s.punten)} punten – ${s.aanwezig}x aanwezig – HF ${hf} – ${s.aantal180s}x 180`;
  });

  let bericht = `🏆 DE ZUMPE DARTS\n\nTussenstand ${seizoenLabel}\n\n`;
  bericht += regels.join("\n");
  return bericht;
}

export function maakSpelerVanDeAvondBericht(
  speler: string,
  seizoenLabel: string
): string {
  return `⭐ Speler van de avond — De Zumpe\n${seizoenLabel}\n\n${speler} is vanavond de beste speler! 🎯🏆`;
}

export function uitslagenWebsiteUrl(origin?: string): string {
  const basis = (origin ?? "").replace(/\/$/, "");
  return basis ? `${basis}/competitie` : "/competitie";
}

export function maakLaatsteUitslagenBericht(
  borden: Bord[],
  opties: {
    websiteUrl?: string;
    spelerVanDeAvond?: string | null;
    nu?: Date;
    gestartOp?: string | null;
    openbareEindtijd?: string | null;
    datum?: string | null;
    isBestuur?: boolean;
  } = {}
): string {
  const avondStatus = avondWeergaveStatus(borden, {
    nu: opties.nu,
    gestartOp: opties.gestartOp,
    openbareEindtijd: opties.openbareEindtijd,
    datum: opties.datum,
    isBestuur: opties.isBestuur,
  });
  const liveKaarten =
    avondStatus.key === "live" ? liveWedstrijdenPerBord(borden) : [];
  const uitslagen = laatsteUitslagenPerBord(borden);
  const regels: string[] = ["🎯 DE ZUMPE", ""];

  if (avondStatus.key === "live") {
    regels.push("🔴 LIVE — VRIJDAGAVOND", "");
  } else if (avondStatus.key === "afgerond") {
    regels.push("🟢 SPEELAVOND AFGEROND", "");
  }

  if (liveKaarten.length > 0) {
    regels.push("🔴 LIVE");
    liveKaarten.forEach((kaart) => {
      if (!kaart.wedstrijd) return;
      regels.push(`🎯 ${kaart.bord.naam}`);
      regels.push(
        `${kaart.wedstrijd.speler1} ${kaart.wedstrijd.score1} - ${kaart.wedstrijd.score2} ${kaart.wedstrijd.speler2}`
      );
      regels.push("LIVE");
      regels.push("");
    });
  }

  if (uitslagen.length > 0) {
    regels.push("🏆 Laatste uitslagen", "");
    uitslagen.forEach((uitslag) => {
      regels.push(`🎯 ${uitslag.bordNaam}`);
      regels.push(uitslagRegel(uitslag.wedstrijd).replace(" – ", " - "));
      regels.push("");
    });
  }

  if (opties.spelerVanDeAvond) {
    regels.push(`🏆 Speler van de avond: ${opties.spelerVanDeAvond}`, "");
  }

  if (uitslagen.length === 0 && liveKaarten.length === 0) {
    regels.push("Nog geen uitslagen vanavond.", "");
  }

  regels.push("Bekijk alle uitslagen:");
  regels.push(uitslagenWebsiteUrl(opties.websiteUrl));

  return regels.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function maakUitslagBericht(
  avond: Speelavond,
  websiteUrl?: string
): string {
  return maakLaatsteUitslagenBericht(avond.borden, {
    websiteUrl,
    spelerVanDeAvond: avond.spelerVanDeAvond,
  });
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
