import type {
  Bord,
  BordStatus,
  DashboardStatistieken,
  Wedstrijd,
} from "@/types/competition";

const MIN_SPELERS_PER_BORD = 3;
const MAX_SPELERS_PER_BORD = 5;
const MAX_BORDEN = 4;
const MIN_SPELERS = 3;
const MAX_SPELERS = MAX_BORDEN * MAX_SPELERS_PER_BORD;

export function maakWedstrijdId(speler1: string, speler2: string): string {
  return `${speler1}__${speler2}`;
}

export function maakWedstrijd(speler1: string, speler2: string): Wedstrijd {
  return {
    id: maakWedstrijdId(speler1, speler2),
    speler1,
    speler2,
    gespeeld: false,
    score1: 0,
    score2: 0,
    winnaar: null,
  };
}

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
      wedstrijden.push(maakWedstrijd(spelers[indexA], spelers[indexB]));
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
      status: "wachtend",
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

export function telGespeeldeWedstrijden(borden: Bord[]): number {
  return borden.reduce(
    (totaal, bord) =>
      totaal + bord.wedstrijden.filter((w) => w.gespeeld).length,
    0
  );
}

export function berekenBordStatus(bord: Bord): BordStatus {
  const totaal = bord.wedstrijden.length;
  const gespeeld = bord.wedstrijden.filter((w) => w.gespeeld).length;
  if (gespeeld === 0) return "wachtend";
  if (gespeeld >= totaal) return "voltooid";
  return "actief";
}

export function bepaalWinnaar(
  speler1: string,
  speler2: string,
  score1: number,
  score2: number
): string | null {
  if (score1 > score2) return speler1;
  if (score2 > score1) return speler2;
  return null;
}

export function updateWedstrijdInBord(
  bord: Bord,
  wedstrijdId: string,
  updates: Partial<Pick<Wedstrijd, "gespeeld" | "score1" | "score2">>
): Bord {
  const wedstrijden = bord.wedstrijden.map((wedstrijd) => {
    if (wedstrijd.id !== wedstrijdId) return wedstrijd;

    const score1 = updates.score1 ?? wedstrijd.score1;
    const score2 = updates.score2 ?? wedstrijd.score2;
    const gespeeld = updates.gespeeld ?? wedstrijd.gespeeld;

    return {
      ...wedstrijd,
      ...updates,
      score1,
      score2,
      gespeeld,
      winnaar: gespeeld
        ? bepaalWinnaar(wedstrijd.speler1, wedstrijd.speler2, score1, score2)
        : null,
    };
  });

  const bijgewerkt = { ...bord, wedstrijden };
  return { ...bijgewerkt, status: berekenBordStatus(bijgewerkt) };
}

/** Migreer oude opgeslagen data zonder id/scores */
export function normaliseerBord(bord: Bord): Bord {
  const wedstrijden = bord.wedstrijden.map((w) => {
    const basis = w as Wedstrijd & { id?: string };
    return {
      id: basis.id ?? maakWedstrijdId(basis.speler1, basis.speler2),
      speler1: basis.speler1,
      speler2: basis.speler2,
      gespeeld: basis.gespeeld ?? false,
      score1: basis.score1 ?? 0,
      score2: basis.score2 ?? 0,
      winnaar: basis.winnaar ?? null,
    };
  });
  const genormaliseerd = {
    ...bord,
    wedstrijden,
    status: bord.status ?? berekenBordStatus({ ...bord, wedstrijden }),
  };
  return genormaliseerd;
}

export function normaliseerBorden(borden: Bord[]): Bord[] {
  return borden.map(normaliseerBord);
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
    wedstrijdenVandaag: telWedstrijden(borden),
    gespeeldeWedstrijden: telGespeeldeWedstrijden(borden),
  };
}
