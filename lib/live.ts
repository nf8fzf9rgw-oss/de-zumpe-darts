import { isByeSpeler } from "@/lib/knockout";
import { namenZijnGelijk } from "@/lib/namen";
import { tegenstanderVan, wedstrijdIsBezig } from "@/lib/wedstrijd-overzicht";
import type { Bord, Wedstrijd } from "@/types/competition";

export type BordLiveStatus = "live" | "gereed" | "wacht";

export interface BordLiveStatusWeergave {
  key: BordLiveStatus;
  label: string;
  icoon: string;
  badgeClass: string;
}

export interface LiveBordKaart {
  bord: Bord;
  status: BordLiveStatusWeergave;
  wedstrijd: Wedstrijd | null;
}

export interface LaatsteBordUitslag {
  bordNaam: string;
  wedstrijd: Wedstrijd;
}

export interface WaarMoetIkSpelenInfo {
  spelerNaam: string;
  bordNaam: string;
  tegenstander: string;
  wedstrijd: Wedstrijd;
  status: BordLiveStatusWeergave;
  rol: "spelen" | "tellen";
}

const STATUS_WEERGAVE: Record<BordLiveStatus, BordLiveStatusWeergave> = {
  live: {
    key: "live",
    label: "LIVE",
    icoon: "🔴",
    badgeClass: "bg-red-900/60 text-red-200",
  },
  gereed: {
    key: "gereed",
    label: "Afgerond",
    icoon: "🟢",
    badgeClass: "bg-zinc-800 text-zinc-200",
  },
  wacht: {
    key: "wacht",
    label: "Wachten",
    icoon: "⚪",
    badgeClass: "bg-zinc-800 text-zinc-400",
  },
};

export function bordLiveWeergave(status: BordLiveStatus): BordLiveStatusWeergave {
  return STATUS_WEERGAVE[status];
}

/** Alleen borden die vanavond echt in gebruik zijn. Geen lege extra borden. */
export function isGebruiktBord(bord: Bord): boolean {
  return bord.spelers.length > 0 || bord.wedstrijden.length > 0;
}

export function gebruikteBorden(borden: Bord[]): Bord[] {
  return borden.filter(isGebruiktBord);
}

export function bordLiveStatus(bord: Bord): BordLiveStatus {
  if (bord.wedstrijden.length === 0) return "wacht";
  if (bord.wedstrijden.every((wedstrijd) => wedstrijd.gespeeld)) return "gereed";
  if (bord.wedstrijden.some((wedstrijd) => wedstrijdIsBezig(wedstrijd))) {
    return "live";
  }
  return "wacht";
}

export function huidigeWedstrijdOpBord(bord: Bord): Wedstrijd | null {
  const bezig = bord.wedstrijden.find((wedstrijd) => wedstrijdIsBezig(wedstrijd));
  if (bezig) return bezig;
  const volgende = bord.wedstrijden.find((wedstrijd) => !wedstrijd.gespeeld);
  if (volgende) return volgende;
  const gespeeld = bord.wedstrijden.filter((wedstrijd) => wedstrijd.gespeeld);
  return gespeeld[gespeeld.length - 1] ?? null;
}

export function volgendeWedstrijdOpBord(bord: Bord): Wedstrijd | null {
  const huidige = huidigeWedstrijdOpBord(bord);
  if (!huidige || huidige.gespeeld) return null;
  const index = bord.wedstrijden.findIndex((wedstrijd) => wedstrijd.id === huidige.id);
  if (index < 0) return null;
  return bord.wedstrijden.slice(index + 1).find((wedstrijd) => !wedstrijd.gespeeld) ?? null;
}

export function liveBordKaarten(borden: Bord[]): LiveBordKaart[] {
  return gebruikteBorden(borden).map((bord) => ({
    bord,
    status: bordLiveWeergave(bordLiveStatus(bord)),
    wedstrijd: huidigeWedstrijdOpBord(bord),
  }));
}

export function laatsteUitslagenPerBord(borden: Bord[]): LaatsteBordUitslag[] {
  return gebruikteBorden(borden).flatMap((bord) => {
    const gespeeld = bord.wedstrijden.filter(
      (wedstrijd) => wedstrijd.gespeeld && !wedstrijd.bye
    );
    const laatste = gespeeld[gespeeld.length - 1];
    return laatste ? [{ bordNaam: bord.naam, wedstrijd: laatste }] : [];
  });
}

export function liveWedstrijdenPerBord(borden: Bord[]): LiveBordKaart[] {
  return liveBordKaarten(borden).filter((kaart) => kaart.status.key === "live");
}

export function wedstrijdLiveStatus(wedstrijd: Wedstrijd): BordLiveStatus {
  if (wedstrijd.gespeeld) return "gereed";
  if (wedstrijdIsBezig(wedstrijd)) return "live";
  return "wacht";
}

export function waarMoetIkSpelen(
  borden: Bord[],
  spelerNaam: string
): WaarMoetIkSpelenInfo | null {
  const naam = spelerNaam.trim();
  if (!naam) return null;

  const relevant = gebruikteBorden(borden).flatMap((bord) =>
    bord.wedstrijden
      .filter(
        (wedstrijd) =>
          namenZijnGelijk(wedstrijd.speler1, naam) ||
          namenZijnGelijk(wedstrijd.speler2, naam) ||
          (wedstrijd.teller != null && namenZijnGelijk(wedstrijd.teller, naam))
      )
      .map((wedstrijd) => ({ bord, wedstrijd }))
  );

  if (relevant.length === 0) return null;

  const speelt = (wedstrijd: Wedstrijd) =>
    namenZijnGelijk(wedstrijd.speler1, naam) ||
    namenZijnGelijk(wedstrijd.speler2, naam);
  const telt = (wedstrijd: Wedstrijd) =>
    Boolean(wedstrijd.teller && namenZijnGelijk(wedstrijd.teller, naam));

  const gekozen =
    relevant.find((item) => wedstrijdIsBezig(item.wedstrijd) && speelt(item.wedstrijd)) ??
    relevant.find((item) => wedstrijdIsBezig(item.wedstrijd) && telt(item.wedstrijd)) ??
    relevant.find((item) => !item.wedstrijd.gespeeld && speelt(item.wedstrijd)) ??
    relevant.find((item) => !item.wedstrijd.gespeeld && telt(item.wedstrijd)) ??
    [...relevant].reverse().find((item) => item.wedstrijd.gespeeld);
  if (!gekozen) return null;

  return {
    spelerNaam: naam,
    bordNaam: gekozen.bord.naam,
    tegenstander: tegenstanderVan(gekozen.wedstrijd, naam),
    wedstrijd: gekozen.wedstrijd,
    status: bordLiveWeergave(wedstrijdLiveStatus(gekozen.wedstrijd)),
    rol: speelt(gekozen.wedstrijd) ? "spelen" : "tellen",
  };
}

export function scoreRegel(wedstrijd: Wedstrijd): string {
  if (wedstrijd.bye) return "bye";
  return `${wedstrijd.score1} – ${wedstrijd.score2}`;
}

export function uitslagRegel(wedstrijd: Wedstrijd): string {
  if (wedstrijd.bye) {
    const speler = isByeSpeler(wedstrijd.speler1)
      ? wedstrijd.speler2
      : wedstrijd.speler1;
    return `${speler} — bye`;
  }
  return `${wedstrijd.speler1} ${wedstrijd.score1} – ${wedstrijd.score2} ${wedstrijd.speler2}`;
}
