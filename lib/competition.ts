import type {
  Bord,
  BordStatus,
  DashboardStatistieken,
  Speelavond,
  Wedstrijd,
} from "@/types/competition";

export const MIN_SPELERS_PER_BORD = 3;
export const MAX_SPELERS_PER_BORD = 7;
const MAX_BORDEN = 5;
const MIN_SPELERS = 3;
const MAX_SPELERS = MAX_BORDEN * MAX_SPELERS_PER_BORD;

export const MAX_SPELERS_PER_AVOND = MAX_SPELERS;
export const MAX_BORDEN_PER_AVOND = MAX_BORDEN;

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
    bye: false,
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

function roundRobinWedstrijden(grootte: number): number {
  return (grootte * (grootte - 1)) / 2;
}

function afstandTotIdealeGrootte(verdeling: number[]): number {
  return verdeling.reduce(
    (totaal, grootte) => totaal + Math.abs(grootte - 4),
    0
  );
}

function uniformBonus(aantalSpelers: number, verdeling: number[]): number {
  const isUniform = verdeling.every((g) => g === verdeling[0]);
  if (!isUniform) return 0;

  const grootte = verdeling[0];
  const aantalBorden = verdeling.length;

  if (
    grootte === 4 &&
    aantalSpelers % 4 === 0 &&
    aantalBorden === aantalSpelers / 4 &&
    aantalBorden <= MAX_BORDEN
  ) {
    return -200;
  }

  if (
    grootte === 5 &&
    aantalSpelers % 5 === 0 &&
    aantalBorden === aantalSpelers / 5 &&
    aantalBorden <= MAX_BORDEN &&
    aantalBorden >= 3 &&
    !(aantalSpelers % 4 === 0 && aantalSpelers / 4 <= MAX_BORDEN)
  ) {
    return -200;
  }

  if (
    grootte === 3 &&
    aantalSpelers % 3 === 0 &&
    aantalBorden === aantalSpelers / 3 &&
    aantalBorden <= MAX_BORDEN &&
    !(
      aantalSpelers % 4 === 0 &&
      aantalSpelers / 4 <= MAX_BORDEN &&
      aantalSpelers / 4 <= aantalBorden
    )
  ) {
    return -150;
  }

  return 0;
}

/** Lagere score = betere verdeling (uniform rond 4 spelers, weinig wachttijd). */
function scoreVerdeling(aantalSpelers: number, verdeling: number[]): number {
  let score = 0;

  for (const grootte of verdeling) {
    if (grootte === 7) score += 1000;
    else if (grootte === 6) score += 100;
    else if (grootte === 5) score += 10;
    else if (grootte === 3) score += 15;
  }

  score += variantie(verdeling) * 100;
  score += afstandTotIdealeGrootte(verdeling) * 20;
  score += uniformBonus(aantalSpelers, verdeling);

  if (verdeling.length === 2 && verdeling.every((g) => g === 5)) {
    score += 50;
  }

  const aantalDrie = verdeling.filter((g) => g === 3).length;
  const aantalVier = verdeling.filter((g) => g === 4).length;
  if (aantalDrie === 1 && aantalVier >= 3) {
    score += 80;
  }

  const totaalWedstrijden = verdeling.reduce(
    (totaal, grootte) => totaal + roundRobinWedstrijden(grootte),
    0
  );
  const maxWedstrijdenPerBord = Math.max(
    ...verdeling.map((grootte) => roundRobinWedstrijden(grootte))
  );
  score += totaalWedstrijden;
  score += maxWedstrijdenPerBord * 5;

  return score;
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
    const verschilScore = scoreVerdeling(aantalSpelers, a) - scoreVerdeling(aantalSpelers, b);
    if (verschilScore !== 0) return verschilScore;
    return b.length - a.length;
  });

  return [...mogelijkheden[0]].sort((a, b) => b - a);
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
  if (wedstrijd.bye) return `${wedstrijd.speler1} — bye`;
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
  freq: Map<string, number>,
  seed?: number
): string[][] {
  const gesorteerd = [...spelers].sort((a, b) => a.localeCompare(b, "nl"));
  let besteGroepen: string[][] = [];
  let laagsteKosten = Infinity;

  const rng = seed !== undefined ? seededRandom(seed) : Math.random;

  for (let poging = 0; poging < 40; poging += 1) {
    const kopie = [...gesorteerd];
    for (let i = kopie.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
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

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function genereerCompetitie(
  spelers: string[],
  historie: Speelavond[] = [],
  seed?: number
): Bord[] | null {
  const verdeling = berekenBordVerdeling(spelers.length);
  if (!verdeling) return null;

  const freq = bouwTegenstanderFrequentie(historie);
  const groepen = verdeelSpelersSlim(spelers, verdeling, freq, seed);

  return groepen.map((groep, index) => ({
    naam: `Bord ${index + 1}`,
    spelers: groep,
    wedstrijden: genereerRoundRobin(groep),
    status: "wachtend" as BordStatus,
    fase: "poule" as const,
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
): { winnaar: string | null; gelijkspel: boolean } {
  if (score1 > score2) return { winnaar: speler1, gelijkspel: false };
  if (score2 > score1) return { winnaar: speler2, gelijkspel: false };
  return { winnaar: null, gelijkspel: true };
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
    const uitslag = gespeeld
      ? bepaalWinnaar(wedstrijd.speler1, wedstrijd.speler2, score1, score2)
      : { winnaar: null, gelijkspel: false };

    return {
      ...wedstrijd,
      ...updates,
      score1,
      score2,
      gespeeld,
      winnaar: uitslag.winnaar,
      gelijkspel: uitslag.gelijkspel,
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
      gelijkspel: basis.gelijkspel ?? false,
      aantal180Speler1: basis.aantal180Speler1 ?? 0,
      aantal180Speler2: basis.aantal180Speler2 ?? 0,
      hoogsteFinishSpeler1: basis.hoogsteFinishSpeler1 ?? null,
      hoogsteFinishSpeler2: basis.hoogsteFinishSpeler2 ?? null,
      bye: basis.bye ?? false,
    };
  });
  return {
    ...bord,
    wedstrijden,
    fase: bord.fase ?? "poule",
    status: bord.status ?? berekenBordStatus({ ...bord, wedstrijden }),
  };
}

export function normaliseerBorden(borden: Bord[]): Bord[] {
  return borden.map(normaliseerBord);
}

export function heeftTeVeelBorden(borden: Bord[] | undefined): boolean {
  const poules = (borden ?? []).filter(
    (bord) => !bord.fase || bord.fase === "poule"
  );
  return poules.length > MAX_BORDEN_PER_AVOND;
}

export function normaliseerSpeelavond(avond: Speelavond): Speelavond {
  const teVeelBorden = heeftTeVeelBorden(avond.borden);
  const borden = teVeelBorden ? [] : normaliseerBorden(avond.borden ?? []);

  return {
    ...avond,
    seizoen: avond.seizoen ?? String(new Date(avond.datum || Date.now()).getFullYear()),
    spelerVanDeAvond: teVeelBorden ? null : (avond.spelerVanDeAvond ?? null),
    aanmeldToken: avond.aanmeldToken ?? null,
    versie: avond.versie ?? 1,
    notities: avond.notities ?? "",
    borden,
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

/** Hernoem speler in alle borden (huidige avond). */
export function hernoemSpelerInBorden(
  borden: Bord[],
  oudeNaam: string,
  nieuweNaam: string
): Bord[] {
  return borden.map((bord) => ({
    ...bord,
    spelers: bord.spelers.map((s) => (s === oudeNaam ? nieuweNaam : s)),
    wedstrijden: bord.wedstrijden.map((w) => ({
      ...w,
      speler1: w.speler1 === oudeNaam ? nieuweNaam : w.speler1,
      speler2: w.speler2 === oudeNaam ? nieuweNaam : w.speler2,
      id: maakWedstrijdId(
        w.speler1 === oudeNaam ? nieuweNaam : w.speler1,
        w.speler2 === oudeNaam ? nieuweNaam : w.speler2
      ),
      winnaar: w.winnaar === oudeNaam ? nieuweNaam : w.winnaar,
    })),
  }));
}

/** Verplaats speler van bord A naar bord B en herbereken round-robin. */
export function verplaatsSpeler(
  borden: Bord[],
  speler: string,
  vanBord: string,
  naarBord: string
): Bord[] | null {
  if (vanBord === naarBord) return borden;

  const van = borden.find((b) => b.naam === vanBord);
  const naar = borden.find((b) => b.naam === naarBord);
  if (!van || !naar) return null;
  if (!van.spelers.includes(speler)) return null;
  if (naar.spelers.length >= MAX_SPELERS_PER_BORD) return null;
  if (van.spelers.length <= MIN_SPELERS_PER_BORD) return null;

  return borden.map((bord) => {
    if (bord.naam === vanBord) {
      const spelers = bord.spelers.filter((s) => s !== speler);
      const bijgewerkt = {
        ...bord,
        spelers,
        wedstrijden: genereerRoundRobin(spelers),
      };
      return { ...bijgewerkt, status: berekenBordStatus(bijgewerkt) };
    }
    if (bord.naam === naarBord) {
      const spelers = [...bord.spelers, speler];
      const bijgewerkt = {
        ...bord,
        spelers,
        wedstrijden: genereerRoundRobin(spelers),
      };
      return { ...bijgewerkt, status: berekenBordStatus(bijgewerkt) };
    }
    return bord;
  });
}

export function resetWedstrijd(wedstrijd: Wedstrijd): Wedstrijd {
  return {
    ...wedstrijd,
    gespeeld: false,
    score1: 0,
    score2: 0,
    winnaar: null,
    gelijkspel: false,
    aantal180Speler1: 0,
    aantal180Speler2: 0,
    hoogsteFinishSpeler1: null,
    hoogsteFinishSpeler2: null,
    bye: wedstrijd.bye ?? false,
  };
}
