import { telWedstrijden } from "@/lib/competition";
import { bereken180Bonus, berekenFinishBonus, PUNTEN_PER_WINST } from "@/lib/scoring";
import type {
  Bord,
  Speelavond,
  SpelerProfielData,
  SpelerStand,
  Wedstrijd,
} from "@/types/competition";

interface SpelerAggregaat {
  competitiepunten: number;
  bonuspunten: number;
  gewonnen: number;
  verloren: number;
  legsVoor: number;
  legsTegen: number;
  aantal180s: number;
  hoogsteFinish: number;
}

function legeAggregaat(): SpelerAggregaat {
  return {
    competitiepunten: 0,
    bonuspunten: 0,
    gewonnen: 0,
    verloren: 0,
    legsVoor: 0,
    legsTegen: 0,
    aantal180s: 0,
    hoogsteFinish: 0,
  };
}

function verwerkWedstrijd(
  stats: Map<string, SpelerAggregaat>,
  wedstrijd: Wedstrijd
): void {
  const s1 = stats.get(wedstrijd.speler1) ?? legeAggregaat();
  const s2 = stats.get(wedstrijd.speler2) ?? legeAggregaat();

  s1.aantal180s += wedstrijd.aantal180Speler1;
  s2.aantal180s += wedstrijd.aantal180Speler2;

  if (wedstrijd.hoogsteFinishSpeler1) {
    s1.hoogsteFinish = Math.max(s1.hoogsteFinish, wedstrijd.hoogsteFinishSpeler1);
    s1.bonuspunten += berekenFinishBonus(wedstrijd.hoogsteFinishSpeler1);
  }
  if (wedstrijd.hoogsteFinishSpeler2) {
    s2.hoogsteFinish = Math.max(s2.hoogsteFinish, wedstrijd.hoogsteFinishSpeler2);
    s2.bonuspunten += berekenFinishBonus(wedstrijd.hoogsteFinishSpeler2);
  }

  s1.bonuspunten += bereken180Bonus(wedstrijd.aantal180Speler1);
  s2.bonuspunten += bereken180Bonus(wedstrijd.aantal180Speler2);

  if (!wedstrijd.gespeeld || !wedstrijd.winnaar) {
    stats.set(wedstrijd.speler1, s1);
    stats.set(wedstrijd.speler2, s2);
    return;
  }

  s1.legsVoor += wedstrijd.score1;
  s1.legsTegen += wedstrijd.score2;
  s2.legsVoor += wedstrijd.score2;
  s2.legsTegen += wedstrijd.score1;

  if (wedstrijd.winnaar === wedstrijd.speler1) {
    s1.gewonnen += 1;
    s1.competitiepunten += PUNTEN_PER_WINST;
    s2.verloren += 1;
  } else if (wedstrijd.winnaar === wedstrijd.speler2) {
    s2.gewonnen += 1;
    s2.competitiepunten += PUNTEN_PER_WINST;
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
    const punten = data.competitiepunten + data.bonuspunten;

    return {
      positie: 0,
      naam,
      punten,
      competitiepunten: data.competitiepunten,
      bonuspunten: data.bonuspunten,
      gewonnen: data.gewonnen,
      verloren: data.verloren,
      legsVoor: data.legsVoor,
      legsTegen: data.legsTegen,
      percentage,
      aantal180s: data.aantal180s,
      hoogsteFinish: data.hoogsteFinish,
    };
  });

  rijen.sort((a, b) => {
    if (b.punten !== a.punten) return b.punten - a.punten;
    if (b.gewonnen !== a.gewonnen) return b.gewonnen - a.gewonnen;
    if (b.aantal180s !== a.aantal180s) return b.aantal180s - a.aantal180s;
    return a.naam.localeCompare(b.naam, "nl");
  });

  return rijen.map((rij, index) => ({ ...rij, positie: index + 1 }));
}

export function berekenSpelerProfiel(
  naam: string,
  historie: Speelavond[],
  huidigeBorden: Bord[] = []
): SpelerProfielData {
  const aanwezigheid = historie.filter((a) =>
    a.aanwezigen.includes(naam)
  ).length;
  const spelerVanDeAvondTitels = historie.filter(
    (a) => a.spelerVanDeAvond === naam
  ).length;

  const stand = berekenStand(historie, huidigeBorden);
  const rij = stand.find((s) => s.naam === naam);

  const badges: string[] = [];
  if (rij && rij.positie === 1) badges.push("🥇 Koploper");
  if (spelerVanDeAvondTitels >= 3) badges.push("⭐ Avondkoning");
  if (rij && rij.aantal180s >= 10) badges.push("🎯 180 Machine");
  if (rij && rij.hoogsteFinish >= 150) badges.push("🔥 High Finisher");
  if (aanwezigheid >= 10) badges.push("📅 Vaste waarde");

  if (!rij) {
    return {
      naam,
      positie: 0,
      punten: 0,
      competitiepunten: 0,
      bonuspunten: 0,
      aanwezigheid,
      overwinningen: 0,
      verliezen: 0,
      winpercentage: 0,
      gespeeldeWedstrijden: 0,
      aantal180s: 0,
      hoogsteFinish: 0,
      spelerVanDeAvondTitels,
      badges,
    };
  }

  return {
    naam,
    positie: rij.positie,
    punten: rij.punten,
    competitiepunten: rij.competitiepunten,
    bonuspunten: rij.bonuspunten,
    aanwezigheid,
    overwinningen: rij.gewonnen,
    verliezen: rij.verloren,
    winpercentage: rij.percentage,
    gespeeldeWedstrijden: rij.gewonnen + rij.verloren,
    aantal180s: rij.aantal180s,
    hoogsteFinish: rij.hoogsteFinish,
    spelerVanDeAvondTitels,
    badges,
  };
}

export function telAvondStats(avond: Speelavond) {
  return {
    aantalSpelers: avond.aanwezigen.length + avond.gasten.length,
    aantalGasten: avond.gasten.length,
    aantalBorden: avond.borden.length,
    aantalWedstrijden: telWedstrijden(avond.borden),
    spelerVanDeAvond: avond.spelerVanDeAvond,
  };
}
