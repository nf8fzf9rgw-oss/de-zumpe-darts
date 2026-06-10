import { berekenStand } from "@/lib/standings";
import { formatDatumKort } from "@/lib/storage";
import type {
  Speelavond,
  SpeelavondStatistieken,
  StatistiekGrafieken,
} from "@/types/competition";

export function berekenStatistieken(
  historie: Speelavond[]
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
  };

  if (historie.length === 0) return leeg;

  const aanwezigheid = new Map<string, number>();
  let totaalSpelers = 0;
  let totaalBorden = 0;

  historie.forEach((avond) => {
    const spelers = avond.aanwezigen.length + avond.gasten.length;
    totaalSpelers += spelers;
    totaalBorden += avond.borden.length;

    avond.aanwezigen.forEach((lid) => {
      aanwezigheid.set(lid, (aanwezigheid.get(lid) ?? 0) + 1);
    });
  });

  let meestAanwezig = "-";
  let meestAanwezigAantal = 0;

  aanwezigheid.forEach((aantal, lid) => {
    if (aantal > meestAanwezigAantal) {
      meestAanwezig = lid;
      meestAanwezigAantal = aantal;
    }
  });

  const stand = berekenStand(historie);

  const meesteOverwinningen = stand[0];
  const meesteWedstrijden = [...stand].sort(
    (a, b) => b.gewonnen + b.verloren - (a.gewonnen + a.verloren)
  )[0];
  const hoogsteWinst = [...stand]
    .filter((s) => s.gewonnen + s.verloren >= 3)
    .sort((a, b) => b.percentage - a.percentage)[0];

  return {
    totaalAvonden: historie.length,
    gemiddeldSpelers: Math.round((totaalSpelers / historie.length) * 10) / 10,
    meestAanwezig,
    meestAanwezigAantal,
    gemiddeldBorden: Math.round((totaalBorden / historie.length) * 10) / 10,
    meesteOverwinningen: meesteOverwinningen?.naam ?? "-",
    meesteOverwinningenAantal: meesteOverwinningen?.gewonnen ?? 0,
    hoogsteWinstpercentage: hoogsteWinst?.naam ?? stand[0]?.naam ?? "-",
    hoogsteWinstpercentageWaarde: hoogsteWinst?.percentage ?? stand[0]?.percentage ?? 0,
    meesteWedstrijden: meesteWedstrijden?.naam ?? "-",
    meesteWedstrijdenAantal:
      (meesteWedstrijden?.gewonnen ?? 0) + (meesteWedstrijden?.verloren ?? 0),
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
    const spelers = [...avond.aanwezigen, ...avond.gasten];
    spelers.forEach((s) => totaalUniek.add(s));
    uniekeSpelersPerAvond.push(totaalUniek.size);
  });

  const spelersOntwikkeling = gesorteerd.map((avond, index) => ({
    label: formatDatumKort(avond.datum),
    waarde: uniekeSpelersPerAvond[index],
  }));

  return { opkomstPerAvond, spelersOntwikkeling, wedstrijdenPerAvond };
}

export function haalHuidigSeizoen(): string {
  const nu = new Date();
  const jaar = nu.getFullYear();
  const maand = nu.getMonth();
  if (maand >= 8) {
    return `${jaar}-${jaar + 1}`;
  }
  return `${jaar - 1}-${jaar}`;
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
