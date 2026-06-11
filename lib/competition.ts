import type {
  Bord,
  BordStatus,
  DashboardStatistieken,
  Speelavond,
  Wedstrijd,
} from "@/types/competition";

const MIN_SPELERS_PER_BORD = 3;
const MAX_SPELERS_PER_BORD = 5;
const MAX_BORDEN = 8;
const MIN_SPELERS = 3;
const MAX_SPELERS = 40;

export const MAX_SPELERS_PER_AVOND = MAX_SPELERS;

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
    aantal180Speler1: 0,
    aantal180Speler2: 0,
    hoogsteFinishSpeler1: null,
    hoogsteFinishSpeler2: null,
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

  if (mogelijkheden.length === 0) return null;

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

function paarKey(a: string, b: string): string {
  return [a, b].sort().join("__");
}

/** Bouw frequentiemap van recente tegenstanders */
export function bouwTegenstanderFrequentie(
  historie: Speelavond[],
  maxAvonden = 5
): Map<string, number> {
  const freq = new Map<string, number>();
  const recent = [...historie]
    .sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime())
    .slice(0, maxAvonden);

  recent.forEach((avond) => {
    avond.borden.forEach((bord) => {
      bord.wedstrijden.forEach((w) => {
        const key = paarKey(w.speler1, w.speler2);
        freq.set(key, (freq.get(key) ?? 0) + 1);
      });
    });
  });

  return freq;
}

function groepKosten(spelers: string[], freq: Map<string, number>): number {
  let kosten = 0;
  for (let i = 0; i < spelers.length; i += 1) {
    for (let j = i + 1; j < spelers.length; j += 1) {
      kosten += freq.get(paarKey(spelers[i], spelers[j])) ?? 0;
    }
  }
  return kosten;
}

/** Verdeel spelers over borden met voorkeur voor nieuwe tegenstanders */
function verdeelSpelersSlim(
  spelers: string[],
  verdeling: number[],
  freq: Map<string, number>
): string[][] {
  const gesorteerd = [...spelers].sort((a, b) => a.localeCompare(b, "nl"));
  let besteGroepen: string[][] = [];
  let laagsteKosten = Infinity;

  for (let poging = 0; poging < 40; poging += 1) {
    const kopie = [...gesorteerd];
    for (let i = kopie.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
    }

    const groepen: string[][] = [];
    let start = 0;
    verdeling.forEach((grootte) => {
      groepen.push(kopie.slice(start, start + grootte));
      start += grootte;
    });

    const kosten = groepen.reduce(
      (totaal, groep) => totaal + groepKosten(groep, freq),
      0
    );

    if (kosten < laagsteKosten) {
      laagsteKosten = kosten;
      besteGroepen = groepen;
    }
    if (kosten === 0) break;
  }

  return besteGroepen;
}

export function genereerCompetitie(
  spelers: string[],
  historie: Speelavond[] = []
): Bord[] | null {
  const verdeling = berekenBordVerdeling(spelers.length);
  if (!verdeling) return null;

  const freq = bouwTegenstanderFrequentie(historie);
  const groepen = verdeelSpelersSlim(spelers, verdeling, freq);

  return groepen.map((groep, index) => ({
    naam: `Bord ${index + 1}`,
    spelers: groep,
    wedstrijden: genereerRoundRobin(groep),
    status: "wachtend" as BordStatus,
  }));
}

export function telWedstrijden(borden: Bord[]): number {
  return borden.reduce((totaal, bord) => totaal + bord.wedstrijden.length, 0);
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

export type WedstrijdUpdate = Partial<
  Pick<
    Wedstrijd,
    | "gespeeld"
    | "score1"
    | "score2"
    | "aantal180Speler1"
    | "aantal180Speler2"
    | "hoogsteFinishSpeler1"
    | "hoogsteFinishSpeler2"
  >
>;

export function updateWedstrijdInBord(
  bord: Bord,
  wedstrijdId: string,
  updates: WedstrijdUpdate
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
      aantal180Speler1: basis.aantal180Speler1 ?? 0,
      aantal180Speler2: basis.aantal180Speler2 ?? 0,
      hoogsteFinishSpeler1: basis.hoogsteFinishSpeler1 ?? null,
      hoogsteFinishSpeler2: basis.hoogsteFinishSpeler2 ?? null,
    };
  });
  return {
    ...bord,
    wedstrijden,
    status: bord.status ?? berekenBordStatus({ ...bord, wedstrijden }),
  };
}

export function normaliseerBorden(borden: Bord[]): Bord[] {
  return borden.map(normaliseerBord);
}

export function normaliseerSpeelavond(avond: Speelavond): Speelavond {
  return {
    ...avond,
    seizoen: avond.seizoen ?? String(new Date(avond.datum || Date.now()).getFullYear()),
    spelerVanDeAvond: avond.spelerVanDeAvond ?? null,
    aanmeldToken: avond.aanmeldToken ?? null,
    versie: avond.versie ?? 1,
    borden: normaliseerBorden(avond.borden),
  };
}

export function berekenDashboardStats(
  aanwezigen: string[],
  gasten: string[],
  borden: Bord[],
  totaalLeden: number
): DashboardStatistieken {
  return {
    aanwezigeLeden: aanwezigen.length,
    gastspelers: gasten.length,
    totaalSpelers: aanwezigen.length + gasten.length,
    aantalBorden: borden.length,
    totaalWedstrijden: telWedstrijden(borden),
    wedstrijdenVandaag: telWedstrijden(borden),
    gespeeldeWedstrijden: telGespeeldeWedstrijden(borden),
    totaalLeden,
  };
}
