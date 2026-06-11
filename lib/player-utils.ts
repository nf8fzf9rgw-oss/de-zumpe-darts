import type { Bord, Wedstrijd } from "@/types/competition";
import { berekenStand } from "@/lib/standings";

export const SPELER_NAAM_KEY = "deZumpeSpelerNaam";

export interface SpelerWedstrijdInfo {
  bordNaam: string;
  wedstrijd: Wedstrijd;
}

export function verzamelAlleSpelers(
  leden: string[],
  gasten: string[],
  borden: Bord[]
): string[] {
  const set = new Set<string>([...leden, ...gasten]);
  borden.forEach((bord) => bord.spelers.forEach((s) => set.add(s)));
  return Array.from(set).sort((a, b) => a.localeCompare(b, "nl"));
}

export function vindBordVoorSpeler(
  borden: Bord[],
  spelerNaam: string
): Bord | null {
  return borden.find((b) => b.spelers.includes(spelerNaam)) ?? null;
}

export function vindWedstrijdenVoorSpeler(
  borden: Bord[],
  spelerNaam: string
): SpelerWedstrijdInfo[] {
  const resultaat: SpelerWedstrijdInfo[] = [];
  borden.forEach((bord) => {
    bord.wedstrijden.forEach((wedstrijd) => {
      if (
        wedstrijd.speler1 === spelerNaam ||
        wedstrijd.speler2 === spelerNaam
      ) {
        resultaat.push({ bordNaam: bord.naam, wedstrijd });
      }
    });
  });
  return resultaat;
}

export function berekenBordStand(bord: Bord) {
  return berekenStand([], [bord]).filter((s) => bord.spelers.includes(s.naam));
}

export function laatsteWinnaar(borden: Bord[]): string | null {
  for (let i = borden.length - 1; i >= 0; i -= 1) {
    const bord = borden[i];
    for (let j = bord.wedstrijden.length - 1; j >= 0; j -= 1) {
      const w = bord.wedstrijden[j];
      if (w.gespeeld && w.winnaar) return w.winnaar;
    }
  }
  return null;
}

export function komendeWedstrijden(
  borden: Bord[],
  spelerNaam?: string | null,
  limiet = 6
): SpelerWedstrijdInfo[] {
  const lijst: SpelerWedstrijdInfo[] = [];
  borden.forEach((bord) => {
    bord.wedstrijden.forEach((wedstrijd) => {
      if (wedstrijd.gespeeld) return;
      if (
        spelerNaam &&
        wedstrijd.speler1 !== spelerNaam &&
        wedstrijd.speler2 !== spelerNaam
      ) {
        return;
      }
      lijst.push({ bordNaam: bord.naam, wedstrijd });
    });
  });
  return lijst.slice(0, limiet);
}

export function laadOpgeslagenSpelerNaam(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(SPELER_NAAM_KEY) ?? "";
}

export function slaSpelerNaamOp(naam: string): void {
  localStorage.setItem(SPELER_NAAM_KEY, naam);
}

export function filterSpelersOpZoekterm(
  spelers: string[],
  zoekterm: string
): string[] {
  const q = zoekterm.trim().toLowerCase();
  if (!q) return spelers.slice(0, 8);
  return spelers
    .filter((s) => s.toLowerCase().includes(q))
    .slice(0, 8);
}
