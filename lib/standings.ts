import { telWedstrijden } from "@/lib/competition";
import { isByeSpeler } from "@/lib/knockout";
import {
  haalHistorischeTussenstand,
  isAvondNaTussenstand,
} from "@/lib/historische-tussenstand";
import { canoniekeSpelerNaam, namenZijnGelijk } from "@/lib/namen";
import {
  bereken180Bonus,
  berekenFinishBonus,
  laadFinishBonusTabel,
  PUNTEN_PER_WINST,
} from "@/lib/scoring";
import type {
  Bord,
  HistorischeSpelerStand,
  HistorischeTussenstand,
  Speelavond,
  SpelerProfielData,
  SpelerStand,
  SpelerStandBron,
  Wedstrijd,
} from "@/types/competition";
import { berekenBadges } from "@/lib/badges";
import { langsteWinstreeksVoorSpeler } from "@/lib/winstreeks";

interface SpelerAggregaat {
  competitiepunten: number;
  bonuspunten: number;
  gewonnen: number;
  verloren: number;
  legsVoor: number;
  legsTegen: number;
  aantal180s: number;
  hoogsteFinish: number;
  aanwezig: number;
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
    aanwezig: 0,
  };
}

function haalOfMaak(
  stats: Map<string, SpelerAggregaat>,
  naam: string
): SpelerAggregaat | null {
  if (isByeSpeler(naam)) return null;
  const canoniek = canoniekeSpelerNaam(naam);
  const bestaand = stats.get(canoniek);
  if (bestaand) return bestaand;
  const nieuw = legeAggregaat();
  stats.set(canoniek, nieuw);
  return nieuw;
}

function verwerkWedstrijd(
  stats: Map<string, SpelerAggregaat>,
  wedstrijd: Wedstrijd,
  finishTabel: ReturnType<typeof laadFinishBonusTabel>
): void {
  const s1 = haalOfMaak(stats, wedstrijd.speler1);
  const s2 = haalOfMaak(stats, wedstrijd.speler2);

  if (s1) {
    s1.aantal180s += wedstrijd.aantal180Speler1;
    s1.bonuspunten += bereken180Bonus(wedstrijd.aantal180Speler1);
    if (wedstrijd.hoogsteFinishSpeler1) {
      s1.hoogsteFinish = Math.max(
        s1.hoogsteFinish,
        wedstrijd.hoogsteFinishSpeler1
      );
      s1.bonuspunten += berekenFinishBonus(
        wedstrijd.hoogsteFinishSpeler1,
        finishTabel
      );
    }
  }
  if (s2) {
    s2.aantal180s += wedstrijd.aantal180Speler2;
    s2.bonuspunten += bereken180Bonus(wedstrijd.aantal180Speler2);
    if (wedstrijd.hoogsteFinishSpeler2) {
      s2.hoogsteFinish = Math.max(
        s2.hoogsteFinish,
        wedstrijd.hoogsteFinishSpeler2
      );
      s2.bonuspunten += berekenFinishBonus(
        wedstrijd.hoogsteFinishSpeler2,
        finishTabel
      );
    }
  }

  if (!wedstrijd.gespeeld || !wedstrijd.winnaar) return;
  if (wedstrijd.bye || isByeSpeler(wedstrijd.speler2) || isByeSpeler(wedstrijd.speler1)) {
    const winnaar = haalOfMaak(stats, wedstrijd.winnaar);
    if (winnaar) {
      winnaar.gewonnen += 1;
      winnaar.competitiepunten += PUNTEN_PER_WINST;
    }
    return;
  }

  if (s1) {
    s1.legsVoor += wedstrijd.score1;
    s1.legsTegen += wedstrijd.score2;
  }
  if (s2) {
    s2.legsVoor += wedstrijd.score2;
    s2.legsTegen += wedstrijd.score1;
  }

  if (namenZijnGelijk(wedstrijd.winnaar, wedstrijd.speler1) && s1) {
    s1.gewonnen += 1;
    s1.competitiepunten += PUNTEN_PER_WINST;
    if (s2) s2.verloren += 1;
  } else if (namenZijnGelijk(wedstrijd.winnaar, wedstrijd.speler2) && s2) {
    s2.gewonnen += 1;
    s2.competitiepunten += PUNTEN_PER_WINST;
    if (s1) s1.verloren += 1;
  }
}

function verwerkBorden(
  stats: Map<string, SpelerAggregaat>,
  borden: Bord[]
): void {
  const finishTabel = laadFinishBonusTabel();
  borden.forEach((bord) => {
    bord.wedstrijden.forEach((wedstrijd) =>
      verwerkWedstrijd(stats, wedstrijd, finishTabel)
    );
  });
}

function verwerkAanwezigheid(
  stats: Map<string, SpelerAggregaat>,
  avond: Speelavond
): void {
  const namen = [...avond.aanwezigen, ...avond.gasten];
  namen.forEach((naam) => {
    const s = haalOfMaak(stats, naam);
    if (s) s.aanwezig += 1;
  });
}

function vindHistorisch(
  tussenstand: HistorischeTussenstand,
  naam: string
): HistorischeSpelerStand | undefined {
  const canoniek = canoniekeSpelerNaam(naam);
  return tussenstand.spelers.find((s) => namenZijnGelijk(s.naam, canoniek));
}

function sorteerStand(rijen: SpelerStand[]): SpelerStand[] {
  const gesorteerd = [...rijen].sort((a, b) => {
    if (b.punten !== a.punten) return b.punten - a.punten;
    if (b.nieuwePunten !== a.nieuwePunten) return b.nieuwePunten - a.nieuwePunten;
    if (b.gewonnen !== a.gewonnen) return b.gewonnen - a.gewonnen;
    const posA = a.officielePositie ?? 999;
    const posB = b.officielePositie ?? 999;
    if (posA !== posB) return posA - posB;
    return a.naam.localeCompare(b.naam, "nl");
  });

  return gesorteerd.map((rij, index) => ({ ...rij, positie: index + 1 }));
}

function filterHistorieVoorStand(
  historie: Speelavond[],
  snapshotDatum: string | undefined,
  huidigeAvondDatum?: string
): Speelavond[] {
  return historie.filter((avond) => {
    if (huidigeAvondDatum && avond.datum === huidigeAvondDatum) {
      return false;
    }
    if (snapshotDatum && !isAvondNaTussenstand(avond.datum, snapshotDatum)) {
      return false;
    }
    return true;
  });
}

/**
 * Berekent de seizoensstand.
 * Voor seizoenen met een officiële tussenstand: historische waarden blijven
 * intact; alleen wedstrijden ná de snapshot-datum tellen extra mee.
 */
export function berekenStand(
  historie: Speelavond[],
  huidigeBorden: Bord[] = [],
  seizoenId?: string,
  huidigeAvondDatum?: string
): SpelerStand[] {
  const tussenstand = seizoenId
    ? haalHistorischeTussenstand(seizoenId)
    : null;

  const nieuweStats = new Map<string, SpelerAggregaat>();

  const relevanteHistorie = filterHistorieVoorStand(
    historie,
    tussenstand?.datum,
    huidigeAvondDatum
  );

  relevanteHistorie.forEach((avond) => {
    verwerkAanwezigheid(nieuweStats, avond);
    verwerkBorden(nieuweStats, avond.borden);
  });

  const huidigeAvondTelt =
    !tussenstand ||
    !huidigeAvondDatum ||
    isAvondNaTussenstand(huidigeAvondDatum, tussenstand.datum);

  if (huidigeAvondTelt && huidigeBorden.length > 0) {
    verwerkBorden(nieuweStats, huidigeBorden);
  }

  if (!tussenstand) {
    const rijen: SpelerStand[] = Array.from(nieuweStats.entries()).map(
      ([naam, data]) => {
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
          aanwezig: data.aanwezig,
          poulepunten: 0,
          winnaarsrondeLegsGewonnen: 0,
          winnaarsrondeLegsVerloren: 0,
          verliezersrondeLegsGewonnen: 0,
          verliezersrondeLegsVerloren: 0,
          historischePunten: 0,
          nieuwePunten: punten,
          bron: "wedstrijden" as SpelerStandBron,
          officielePositie: null,
        };
      }
    );

    return sorteerStand(rijen);
  }

  const namen = new Set<string>([
    ...tussenstand.spelers.map((s) => canoniekeSpelerNaam(s.naam)),
    ...nieuweStats.keys(),
  ]);

  const rijen: SpelerStand[] = Array.from(namen).map((naam) => {
    const historisch = vindHistorisch(tussenstand, naam);
    const nieuw = nieuweStats.get(canoniekeSpelerNaam(naam)) ?? legeAggregaat();

    const historischePunten = historisch?.puntenTotaal ?? 0;
    const nieuwePunten = nieuw.competitiepunten + nieuw.bonuspunten;
    const punten = historischePunten + nieuwePunten;

    const gewonnen = nieuw.gewonnen;
    const verloren = nieuw.verloren;
    const gespeeld = gewonnen + verloren;
    const percentage =
      gespeeld > 0 ? Math.round((gewonnen / gespeeld) * 1000) / 10 : 0;

    let bron: SpelerStandBron = "gecombineerd";
    if (historisch && nieuwePunten === 0 && nieuw.aantal180s === 0) {
      bron = "historisch";
    } else if (!historisch) {
      bron = "wedstrijden";
    }

    return {
      positie: 0,
      naam: historisch?.naam ?? naam,
      punten,
      competitiepunten: nieuw.competitiepunten,
      bonuspunten: nieuw.bonuspunten,
      gewonnen,
      verloren,
      legsVoor:
        (historisch?.winnaarsrondeLegsGewonnen ?? 0) +
        (historisch?.verliezersrondeLegsGewonnen ?? 0) +
        nieuw.legsVoor,
      legsTegen:
        (historisch?.winnaarsrondeLegsVerloren ?? 0) +
        (historisch?.verliezersrondeLegsVerloren ?? 0) +
        nieuw.legsTegen,
      percentage,
      aantal180s: (historisch?.aantal180s ?? 0) + nieuw.aantal180s,
      hoogsteFinish: Math.max(
        historisch?.hoogsteFinish ?? 0,
        nieuw.hoogsteFinish
      ),
      aanwezig: (historisch?.aanwezig ?? 0) + nieuw.aanwezig,
      poulepunten: historisch?.poulepunten ?? 0,
      winnaarsrondeLegsGewonnen: historisch?.winnaarsrondeLegsGewonnen ?? 0,
      winnaarsrondeLegsVerloren: historisch?.winnaarsrondeLegsVerloren ?? 0,
      verliezersrondeLegsGewonnen:
        historisch?.verliezersrondeLegsGewonnen ?? 0,
      verliezersrondeLegsVerloren:
        historisch?.verliezersrondeLegsVerloren ?? 0,
      historischePunten,
      nieuwePunten,
      bron,
      officielePositie: historisch?.positie ?? null,
    };
  });

  return sorteerStand(rijen);
}

export function berekenSpelerProfiel(
  naam: string,
  historie: Speelavond[],
  huidigeBorden: Bord[] = [],
  seizoenId?: string,
  huidigeAvondDatum?: string
): SpelerProfielData {
  const canoniek = canoniekeSpelerNaam(naam);
  const tussenstand = seizoenId
    ? haalHistorischeTussenstand(seizoenId)
    : null;

  const relevanteHistorie = filterHistorieVoorStand(
    historie,
    tussenstand?.datum,
    huidigeAvondDatum
  );

  const aanwezigheidNieuw = relevanteHistorie.filter((a) =>
    [...a.aanwezigen, ...a.gasten].some((n) => namenZijnGelijk(n, canoniek))
  ).length;

  const historisch = tussenstand
    ? vindHistorisch(tussenstand, canoniek)
    : undefined;
  const aanwezigheid = (historisch?.aanwezig ?? 0) + aanwezigheidNieuw;

  const spelerVanDeAvondTitels = historie.filter(
    (a) =>
      a.spelerVanDeAvond != null &&
      namenZijnGelijk(a.spelerVanDeAvond, canoniek)
  ).length;

  const stand = berekenStand(
    historie,
    huidigeBorden,
    seizoenId,
    huidigeAvondDatum
  );
  const rij = stand.find((s) => namenZijnGelijk(s.naam, canoniek));

  const winstreeks = langsteWinstreeksVoorSpeler(
    canoniek,
    historie,
    huidigeBorden
  );
  const badges = berekenBadges({
    aantal180s: rij?.aantal180s ?? 0,
    hoogsteFinish: rij?.hoogsteFinish ?? 0,
    overwinningen: rij?.gewonnen ?? 0,
    winstreeks,
    positie: rij?.positie ?? 0,
    avondtitels: spelerVanDeAvondTitels,
    aanwezigheid,
  });

  if (!rij) {
    return {
      naam: canoniek,
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
      poulepunten: 0,
      historischePunten: 0,
      winnaarsrondeLegsGewonnen: 0,
      winnaarsrondeLegsVerloren: 0,
      verliezersrondeLegsGewonnen: 0,
      verliezersrondeLegsVerloren: 0,
      legsVoor: 0,
      legsTegen: 0,
      officielePositie: historisch?.positie ?? null,
    };
  }

  return {
    naam: rij.naam,
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
    poulepunten: rij.poulepunten,
    historischePunten: rij.historischePunten,
    winnaarsrondeLegsGewonnen: rij.winnaarsrondeLegsGewonnen,
    winnaarsrondeLegsVerloren: rij.winnaarsrondeLegsVerloren,
    verliezersrondeLegsGewonnen: rij.verliezersrondeLegsGewonnen,
    verliezersrondeLegsVerloren: rij.verliezersrondeLegsVerloren,
    legsVoor: rij.legsVoor,
    legsTegen: rij.legsTegen,
    officielePositie: rij.officielePositie,
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
