import {
  berekenBordStatus,
  maakWedstrijd,
} from "@/lib/competition";
import { planWedstrijden } from "@/lib/wedstrijd-planning";
import type { Bord, BordFase, Wedstrijd } from "@/types/competition";

export const BYE_NAAM = "Bye";
export const WINNAARSRONDE_NAAM = "Winnaarsronde";
export const VERLIEZERSRONDE_NAAM = "Verliezersronde";

export function isByeSpeler(naam: string): boolean {
  return naam.trim().toLowerCase() === BYE_NAAM.toLowerCase();
}

export function isKnockoutBord(bord: Bord): boolean {
  return bord.fase === "winnaarsronde" || bord.fase === "verliezersronde";
}

export function isPouleBord(bord: Bord): boolean {
  return !isKnockoutBord(bord);
}

function poulePosities(aantal: number): {
  winnaars: number;
  verliezers: number;
} {
  if (aantal >= 5) return { winnaars: 3, verliezers: aantal - 3 };
  if (aantal === 4) return { winnaars: 2, verliezers: 2 };
  if (aantal === 3) return { winnaars: 2, verliezers: 1 };
  return { winnaars: Math.max(1, aantal - 1), verliezers: Math.min(1, aantal) };
}

/** Rangschikking binnen een poule: overwinningen, daarna 180's. Geen legs. */
export function rangschikPouleSpelers(bord: Bord): string[] {
  const stats = new Map<string, { gewonnen: number; aantal180s: number }>();
  bord.spelers.forEach((naam) => {
    stats.set(naam, { gewonnen: 0, aantal180s: 0 });
  });

  bord.wedstrijden.forEach((w) => {
    const s1 = stats.get(w.speler1);
    const s2 = stats.get(w.speler2);
    if (s1) s1.aantal180s += w.aantal180Speler1;
    if (s2) s2.aantal180s += w.aantal180Speler2;
    if (!w.gespeeld || !w.winnaar) return;
    const win = stats.get(w.winnaar);
    if (win) win.gewonnen += 1;
  });

  return [...bord.spelers].sort((a, b) => {
    const sa = stats.get(a)!;
    const sb = stats.get(b)!;
    if (sb.gewonnen !== sa.gewonnen) return sb.gewonnen - sa.gewonnen;
    if (sb.aantal180s !== sa.aantal180s) return sb.aantal180s - sa.aantal180s;
    return bord.spelers.indexOf(a) - bord.spelers.indexOf(b);
  });
}

export function koppelSpelersPaarsgewijs(spelers: string[]): Wedstrijd[] {
  const wedstrijden: Wedstrijd[] = [];
  for (let i = 0; i + 1 < spelers.length; i += 2) {
    wedstrijden.push(maakWedstrijd(spelers[i], spelers[i + 1]));
  }
  if (spelers.length % 2 === 1) {
    const byeSpeler = spelers[spelers.length - 1];
    wedstrijden.push({
      ...maakWedstrijd(byeSpeler, BYE_NAAM),
      bye: true,
    });
  }
  return wedstrijden;
}

export function verdeelPouleNaarRondes(bord: Bord): {
  winnaars: string[];
  verliezers: string[];
} {
  const rang = rangschikPouleSpelers(bord);
  const { winnaars: nW } = poulePosities(rang.length);
  return {
    winnaars: rang.slice(0, nW),
    verliezers: rang.slice(nW),
  };
}

export function pouleBordenVoltooid(borden: Bord[]): boolean {
  const poules = borden.filter(isPouleBord);
  return poules.length > 0 && poules.every((b) => b.status === "voltooid");
}

function maakRondeBord(
  naam: string,
  fase: BordFase,
  spelers: string[]
): Bord {
  const wedstrijden = planWedstrijden(
    koppelSpelersPaarsgewijs(spelers),
    spelers
  );
  const bord: Bord = {
    naam,
    spelers,
    wedstrijden,
    status: "wachtend",
    fase,
  };
  return { ...bord, status: berekenBordStatus(bord) };
}

/**
 * Maakt winnaars- en verliezersronde na de poulefase.
 * Poule-borden blijven staan. Bestaande knockout-borden worden vervangen.
 */
export function genereerWinnaarsVerliezersRonde(borden: Bord[]): Bord[] | null {
  const poules = borden.filter(isPouleBord);
  if (!pouleBordenVoltooid(poules)) return null;

  const winnaars: string[] = [];
  const verliezers: string[] = [];

  poules.forEach((bord) => {
    const verdeling = verdeelPouleNaarRondes(bord);
    winnaars.push(...verdeling.winnaars);
    verliezers.push(...verdeling.verliezers);
  });

  if (winnaars.length < 2 && verliezers.length < 2) return null;

  const volgende: Bord[] = [...poules];
  if (winnaars.length >= 1) {
    volgende.push(maakRondeBord(WINNAARSRONDE_NAAM, "winnaarsronde", winnaars));
  }
  if (verliezers.length >= 1) {
    volgende.push(
      maakRondeBord(VERLIEZERSRONDE_NAAM, "verliezersronde", verliezers)
    );
  }
  return volgende;
}
