import type { Bord, DashboardStatistieken, Wedstrijd } from "@/types/competition";

const MIN_SPELERS_PER_BORD = 3;
const MAX_SPELERS_PER_BORD = 5;
const MAX_BORDEN = 4;
const MIN_SPELERS = 3;
const MAX_SPELERS = MAX_BORDEN * MAX_SPELERS_PER_BORD;

function variantie(verdeling: number[]): number {
  const gemiddelde =
    verdeling.reduce((totaal, waarde) => totaal + waarde, 0) / verdeling.length;
  return verdeling.reduce(
    (totaal, waarde) => totaal + (waarde - gemiddelde) ** 2,
    0
  );
}

export function berekenBordVerdeling(aantalSpelers: number): number[] | null {
  if (aantalSpelers < MIN_SPELERS || aantalSpelers > MAX_SPELERS) {
    return null;
  }

  const mogelijkheden: number[][] = [];

  function zoek(
    resterend: number,
    huidigeVerdeling: number[],
    resterendeBorden: number
  ): void {
    if (resterendeBorden === 0) {
      if (resterend === 0) {
        mogelijkheden.push(huidigeVerdeling);
      }
      return;
    }

    for (
      let grootte = MIN_SPELERS_PER_BORD;
      grootte <= MAX_SPELERS_PER_BORD;
      grootte += 1
    ) {
      const minimaalNodig =
        (resterendeBorden - 1) * MIN_SPELERS_PER_BORD;
      const maximaalNodig =
        (resterendeBorden - 1) * MAX_SPELERS_PER_BORD;

      if (
        grootte <= resterend &&
        resterend - grootte >= minimaalNodig &&
        resterend - grootte <= maximaalNodig
      ) {
        zoek(
          resterend - grootte,
          [...huidigeVerdeling, grootte],
          resterendeBorden - 1
        );
      }
    }
  }

  for (let aantalBorden = 1; aantalBorden <= MAX_BORDEN; aantalBorden += 1) {
    zoek(aantalSpelers, [], aantalBorden);
  }

  if (mogelijkheden.length === 0) {
    return null;
  }

  mogelijkheden.sort((a, b) => {
    const verschilVariantie = variantie(a) - variantie(b);
    if (verschilVariantie !== 0) return verschilVariantie;
    return b.length - a.length;
  });

  return mogelijkheden[0];
}

export function genereerRoundRobin(spelers: string[]): Wedstrijd[] {
  const wedstrijden: Wedstrijd[] = [];

  for (let indexA = 0; indexA < spelers.length; indexA += 1) {
    for (let indexB = indexA + 1; indexB < spelers.length; indexB += 1) {
      wedstrijden.push({
        speler1: spelers[indexA],
        speler2: spelers[indexB],
      });
    }
  }

  return wedstrijden;
}

export function formatWedstrijd(wedstrijd: Wedstrijd): string {
  return `${wedstrijd.speler1} vs ${wedstrijd.speler2}`;
}

function schudArray<T>(items: T[]): T[] {
  const kopie = [...items];
  for (let index = kopie.length - 1; index > 0; index -= 1) {
    const willekeurig = Math.floor(Math.random() * (index + 1));
    [kopie[index], kopie[willekeurig]] = [kopie[willekeurig], kopie[index]];
  }
  return kopie;
}

export function genereerCompetitie(spelers: string[]): Bord[] | null {
  const verdeling = berekenBordVerdeling(spelers.length);
  if (!verdeling) return null;

  const gemixteSpelers = schudArray(spelers);
  const borden: Bord[] = [];
  let start = 0;

  verdeling.forEach((grootte) => {
    const groep = gemixteSpelers.slice(start, start + grootte);
    start += grootte;

    borden.push({
      naam: `Bord ${borden.length + 1}`,
      spelers: groep,
      wedstrijden: genereerRoundRobin(groep),
    });
  });

  return borden;
}

export function telWedstrijden(borden: Bord[]): number {
  return borden.reduce(
    (totaal, bord) => totaal + bord.wedstrijden.length,
    0
  );
}

export function berekenDashboardStats(
  aanwezigen: string[],
  gasten: string[],
  borden: Bord[]
): DashboardStatistieken {
  return {
    aanwezigeLeden: aanwezigen.length,
    gastspelers: gasten.length,
    totaalSpelers: aanwezigen.length + gasten.length,
    aantalBorden: borden.length,
    totaalWedstrijden: telWedstrijden(borden),
  };
}
