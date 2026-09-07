import { berekenStand } from "@/lib/standings";
import { formatDatumKort } from "@/lib/storage";
import type {
  Bord,
  Speelavond,
  SpeelavondStatistieken,
  StatistiekGrafieken,
} from "@/types/competition";

export function berekenStatistieken(
  historie: Speelavond[],
  seizoenId?: string,
  huidigeBorden: Bord[] = [],
  huidigeAvondDatum?: string
): SpeelavondStatistieken {
  const leeg: SpeelavondStatistieken = {
    totaalAvonden: 0,
    gemiddeldSpelers: 0,
    meestAanwezig: "-",
    meestAanwezigAantal: 0,
    gemiddeldBorden: 0,
    meesteOverwinningen: "-",
    meesteOverwinningenAantal: 0,
    hoogsteWinstpercentage: "-",
    hoogsteWinstpercentageWaarde: 0,
    meesteWedstrijden: "-",
    meesteWedstrijdenAantal: 0,
    meeste180s: "-",
    meeste180sAantal: 0,
  };

  const stand = berekenStand(
    historie,
    huidigeBorden,
    seizoenId,
    huidigeAvondDatum
  );

  if (historie.length === 0 && stand.length === 0) return leeg;

  const aanwezigheid = new Map<string, number>();
  let totaalSpelers = 0;
  let totaalBorden = 0;

  historie.forEach((avond) => {
    totaalSpelers += avond.aanwezigen.length + avond.gasten.length;
    totaalBorden += avond.borden.length;
    [...avond.aanwezigen, ...avond.gasten].forEach((lid) => {
      aanwezigheid.set(lid, (aanwezigheid.get(lid) ?? 0) + 1);
    });
  });

  // Bij historische tussenstand: gebruik officiële aanwezigheid als basis
  stand.forEach((rij) => {
    if (rij.aanwezig > (aanwezigheid.get(rij.naam) ?? 0)) {
      aanwezigheid.set(rij.naam, rij.aanwezig);
    }
  });

  let meestAanwezig = "-";
  let meestAanwezigAantal = 0;
  aanwezigheid.forEach((aantal, lid) => {
    if (aantal > meestAanwezigAantal) {
      meestAanwezig = lid;
      meestAanwezigAantal = aantal;
    }
  });

  const meesteOverwinningenRij = [...stand].sort(
    (a, b) => b.gewonnen - a.gewonnen
  )[0];
  const meesteWedstrijden = [...stand].sort(
    (a, b) => b.gewonnen + b.verloren - (a.gewonnen + a.verloren)
  )[0];
  const hoogsteWinst = [...stand]
    .filter((s) => s.gewonnen + s.verloren >= 3)
    .sort((a, b) => b.percentage - a.percentage)[0];
  const meeste180 = [...stand].sort((a, b) => b.aantal180s - a.aantal180s)[0];

  return {
    totaalAvonden: historie.length,
    gemiddeldSpelers:
      historie.length > 0
        ? Math.round((totaalSpelers / historie.length) * 10) / 10
        : 0,
    meestAanwezig,
    meestAanwezigAantal,
    gemiddeldBorden:
      historie.length > 0
        ? Math.round((totaalBorden / historie.length) * 10) / 10
        : 0,
    meesteOverwinningen: meesteOverwinningenRij?.naam ?? "-",
    meesteOverwinningenAantal: meesteOverwinningenRij?.gewonnen ?? 0,
    hoogsteWinstpercentage: hoogsteWinst?.naam ?? stand[0]?.naam ?? "-",
    hoogsteWinstpercentageWaarde:
      hoogsteWinst?.percentage ?? stand[0]?.percentage ?? 0,
    meesteWedstrijden: meesteWedstrijden?.naam ?? "-",
    meesteWedstrijdenAantal:
      (meesteWedstrijden?.gewonnen ?? 0) + (meesteWedstrijden?.verloren ?? 0),
    meeste180s: meeste180?.naam ?? "-",
    meeste180sAantal: meeste180?.aantal180s ?? 0,
  };
}

export function berekenGrafieken(historie: Speelavond[]): StatistiekGrafieken {
  const gesorteerd = [...historie].sort(
    (a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime()
  );

  const opkomstPerAvond = gesorteerd.map((avond) => ({
    label: formatDatumKort(avond.datum),
    waarde: avond.aanwezigen.length + avond.gasten.length,
  }));

  const wedstrijdenPerAvond = gesorteerd.map((avond) => ({
    label: formatDatumKort(avond.datum),
    waarde: avond.borden.reduce((t, b) => t + b.wedstrijden.length, 0),
  }));

  const uniekeSpelersPerAvond: number[] = [];
  const totaalUniek = new Set<string>();
  gesorteerd.forEach((avond) => {
    [...avond.aanwezigen, ...avond.gasten].forEach((s) => totaalUniek.add(s));
    uniekeSpelersPerAvond.push(totaalUniek.size);
  });

  const spelersOntwikkeling = gesorteerd.map((avond, index) => ({
    label: formatDatumKort(avond.datum),
    waarde: uniekeSpelersPerAvond[index],
  }));

  return { opkomstPerAvond, spelersOntwikkeling, wedstrijdenPerAvond };
}

export function haalKomendeVrijdag(): string {
  const nu = new Date();
  const dag = nu.getDay();
  const dagenTotVrijdag = (5 - dag + 7) % 7 || 7;
  const vrijdag = new Date(nu);
  vrijdag.setDate(nu.getDate() + dagenTotVrijdag);
  return vrijdag.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
