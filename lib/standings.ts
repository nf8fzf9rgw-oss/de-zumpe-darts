import { telWedstrijden } from "@/lib/competition";
import type { Bord, Speelavond, SpelerStand, Wedstrijd } from "@/types/competition";

const PUNTEN_PER_WINST = 3;

interface SpelerAggregaat {
  punten: number;
  gewonnen: number;
  verloren: number;
  legsVoor: number;
  legsTegen: number;
}

function legeAggregaat(): SpelerAggregaat {
  return { punten: 0, gewonnen: 0, verloren: 0, legsVoor: 0, legsTegen: 0 };
}

function verwerkWedstrijd(
  stats: Map<string, SpelerAggregaat>,
  wedstrijd: Wedstrijd
): void {
  if (!wedstrijd.gespeeld || !wedstrijd.winnaar) return;

  const s1 = stats.get(wedstrijd.speler1) ?? legeAggregaat();
  const s2 = stats.get(wedstrijd.speler2) ?? legeAggregaat();

  s1.legsVoor += wedstrijd.score1;
  s1.legsTegen += wedstrijd.score2;
  s2.legsVoor += wedstrijd.score2;
  s2.legsTegen += wedstrijd.score1;

  if (wedstrijd.winnaar === wedstrijd.speler1) {
    s1.gewonnen += 1;
    s1.punten += PUNTEN_PER_WINST;
    s2.verloren += 1;
  } else if (wedstrijd.winnaar === wedstrijd.speler2) {
    s2.gewonnen += 1;
    s2.punten += PUNTEN_PER_WINST;
    s1.verloren += 1;
  }

  stats.set(wedstrijd.speler1, s1);
  stats.set(wedstrijd.speler2, s2);
}

function verwerkBorden(stats: Map<string, SpelerAggregaat>, borden: Bord[]): void {
  borden.forEach((bord) => {
    bord.wedstrijden.forEach((wedstrijd) => verwerkWedstrijd(stats, wedstrijd));
  });
}

export function berekenStand(
  historie: Speelavond[],
  huidigeBorden: Bord[] = []
): SpelerStand[] {
  const stats = new Map<string, SpelerAggregaat>();

  historie.forEach((avond) => verwerkBorden(stats, avond.borden));
  verwerkBorden(stats, huidigeBorden);

  const rijen: SpelerStand[] = Array.from(stats.entries()).map(([naam, data]) => {
    const totaal = data.gewonnen + data.verloren;
    const percentage =
      totaal > 0 ? Math.round((data.gewonnen / totaal) * 1000) / 10 : 0;

    return {
      positie: 0,
      naam,
      punten: data.punten,
      gewonnen: data.gewonnen,
      verloren: data.verloren,
      legsVoor: data.legsVoor,
      legsTegen: data.legsTegen,
      percentage,
    };
  });

  rijen.sort((a, b) => {
    if (b.punten !== a.punten) return b.punten - a.punten;
    const diffA = a.legsVoor - a.legsTegen;
    const diffB = b.legsVoor - b.legsTegen;
    if (diffB !== diffA) return diffB - diffA;
    return a.naam.localeCompare(b.naam, "nl");
  });

  return rijen.map((rij, index) => ({ ...rij, positie: index + 1 }));
}

export function berekenSpelerProfiel(
  naam: string,
  historie: Speelavond[],
  huidigeBorden: Bord[] = [],
  aanwezigheidTeller?: number
): {
  aanwezigheid: number;
  overwinningen: number;
  verliezen: number;
  winpercentage: number;
  gespeeldeWedstrijden: number;
} {
  let aanwezigheid = aanwezigheidTeller ?? 0;
  if (aanwezigheidTeller === undefined) {
    historie.forEach((avond) => {
      if (avond.aanwezigen.includes(naam)) aanwezigheid += 1;
    });
  }

  const stand = berekenStand(historie, huidigeBorden).find((s) => s.naam === naam);

  if (!stand) {
    return {
      aanwezigheid,
      overwinningen: 0,
      verliezen: 0,
      winpercentage: 0,
      gespeeldeWedstrijden: 0,
    };
  }

  return {
    aanwezigheid,
    overwinningen: stand.gewonnen,
    verliezen: stand.verloren,
    winpercentage: stand.percentage,
    gespeeldeWedstrijden: stand.gewonnen + stand.verloren,
  };
}

export function telAvondStats(avond: Speelavond) {
  return {
    aantalSpelers: avond.aanwezigen.length + avond.gasten.length,
    aantalGasten: avond.gasten.length,
    aantalBorden: avond.borden.length,
    aantalWedstrijden: telWedstrijden(avond.borden),
  };
}
