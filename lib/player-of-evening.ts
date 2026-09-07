import {
  bereken180Bonus,
  berekenFinishBonus,
  laadFinishBonusTabel,
  PUNTEN_PER_WINST,
} from "@/lib/scoring";
import { isByeSpeler } from "@/lib/knockout";
import { canoniekeSpelerNaam, namenZijnGelijk } from "@/lib/namen";
import type { Bord, SpelerVanDeAvondScore, Wedstrijd } from "@/types/competition";

function verwerkWedstrijdAvond(
  scores: Map<string, SpelerVanDeAvondScore>,
  wedstrijd: Wedstrijd
): void {
  if (!wedstrijd.gespeeld) return;

  const finishTabel = laadFinishBonusTabel();
  const naam1 = canoniekeSpelerNaam(wedstrijd.speler1);
  const naam2 = canoniekeSpelerNaam(wedstrijd.speler2);
  const s1 = isByeSpeler(wedstrijd.speler1)
    ? null
    : (scores.get(naam1) ?? leegScore(naam1));
  const s2 = isByeSpeler(wedstrijd.speler2)
    ? null
    : (scores.get(naam2) ?? leegScore(naam2));

  if (s1) {
    s1.bonus180 += bereken180Bonus(wedstrijd.aantal180Speler1);
    if (wedstrijd.hoogsteFinishSpeler1) {
      s1.bonusFinish += berekenFinishBonus(
        wedstrijd.hoogsteFinishSpeler1,
        finishTabel
      );
    }
  }
  if (s2) {
    s2.bonus180 += bereken180Bonus(wedstrijd.aantal180Speler2);
    if (wedstrijd.hoogsteFinishSpeler2) {
      s2.bonusFinish += berekenFinishBonus(
        wedstrijd.hoogsteFinishSpeler2,
        finishTabel
      );
    }
  }

  if (wedstrijd.winnaar) {
    if (s1 && namenZijnGelijk(wedstrijd.winnaar, wedstrijd.speler1)) {
      s1.overwinningen += 1;
      s1.competitiepunten += PUNTEN_PER_WINST;
    } else if (s2 && namenZijnGelijk(wedstrijd.winnaar, wedstrijd.speler2)) {
      s2.overwinningen += 1;
      s2.competitiepunten += PUNTEN_PER_WINST;
    }
  }

  if (s1) {
    s1.totaal = s1.competitiepunten + s1.bonus180 + s1.bonusFinish;
    scores.set(naam1, s1);
  }
  if (s2) {
    s2.totaal = s2.competitiepunten + s2.bonus180 + s2.bonusFinish;
    scores.set(naam2, s2);
  }
}

function leegScore(naam: string): SpelerVanDeAvondScore {
  return {
    naam,
    competitiepunten: 0,
    overwinningen: 0,
    bonus180: 0,
    bonusFinish: 0,
    totaal: 0,
  };
}

export function berekenSpelerVanDeAvond(borden: Bord[]): string | null {
  const scores = new Map<string, SpelerVanDeAvondScore>();

  borden.forEach((bord) => {
    bord.wedstrijden.forEach((w) => verwerkWedstrijdAvond(scores, w));
  });

  const rijen = Array.from(scores.values());
  if (rijen.length === 0) return null;

  rijen.sort((a, b) => {
    if (b.totaal !== a.totaal) return b.totaal - a.totaal;
    if (b.overwinningen !== a.overwinningen) return b.overwinningen - a.overwinningen;
    if (b.bonus180 !== a.bonus180) return b.bonus180 - a.bonus180;
    return b.bonusFinish - a.bonusFinish;
  });

  return rijen[0]?.totaal > 0 ? rijen[0].naam : null;
}

export function berekenAvondScores(borden: Bord[]): SpelerVanDeAvondScore[] {
  const scores = new Map<string, SpelerVanDeAvondScore>();
  borden.forEach((bord) => {
    bord.wedstrijden.forEach((w) => verwerkWedstrijdAvond(scores, w));
  });
  return Array.from(scores.values()).sort((a, b) => b.totaal - a.totaal);
}
