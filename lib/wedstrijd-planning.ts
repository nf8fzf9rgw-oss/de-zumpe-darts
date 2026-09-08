import { namenZijnGelijk } from "@/lib/namen";
import type { Bord, Wedstrijd } from "@/types/competition";

const BYE_NAAM = "bye";

const PENALTY_SPEELT_OPNIEUW = 10_000;
const PENALTY_TELLEN_NAAR_SPELEN = 6_000;
const PENALTY_SPELEN_NAAR_TELLEN = 5_000;
const PENALTY_SPEEL_TEL_SPEEL = 2_000;
const PENALTY_TELLER_ONBALANS = 700;
const PENALTY_TELLER_ACHTERELKAAR = 60;
const PENALTY_TELLER_SPEELT_VOLGENDE = 6_500;
const BONUS_RUST = 18;

export interface PlanningWaarschuwing {
  wedstrijdIndex: number;
  speler: string;
  soort: "speelt_opnieuw" | "tellen_naar_spelen" | "spelen_naar_tellen";
  tekst: string;
}

function isByeSpeler(naam: string): boolean {
  return naam.trim().toLowerCase() === BYE_NAAM;
}

function speeltMee(wedstrijd: Wedstrijd, naam: string): boolean {
  if (isByeSpeler(naam)) return false;
  return (
    namenZijnGelijk(wedstrijd.speler1, naam) ||
    namenZijnGelijk(wedstrijd.speler2, naam)
  );
}

function isZelfdeSpeler(a: string | null | undefined, b: string): boolean {
  return Boolean(a) && namenZijnGelijk(a as string, b);
}

export function isGeldigeTeller(
  wedstrijd: Wedstrijd,
  teller: string | null | undefined
): boolean {
  if (!teller || !teller.trim()) return false;
  if (isByeSpeler(teller) || wedstrijd.bye) return false;
  return !speeltMee(wedstrijd, teller);
}

export function geldigeTellers(
  wedstrijd: Wedstrijd,
  kandidaten: string[]
): string[] {
  if (wedstrijd.bye) return [];
  const uniek: string[] = [];
  kandidaten.forEach((naam) => {
    if (!isGeldigeTeller(wedstrijd, naam)) return;
    if (uniek.some((bestaand) => namenZijnGelijk(bestaand, naam))) return;
    uniek.push(naam);
  });
  return uniek.sort((a, b) => a.localeCompare(b, "nl"));
}

function paarSleutel(wedstrijd: Wedstrijd): string {
  return [wedstrijd.speler1, wedstrijd.speler2]
    .map((naam) => naam.trim())
    .sort((a, b) => a.localeCompare(b, "nl"))
    .join("__");
}

function telTellers(wedstrijden: Wedstrijd[]): Map<string, number> {
  const counts = new Map<string, number>();
  wedstrijden.forEach((wedstrijd) => {
    if (!wedstrijd.teller) return;
    const naam = wedstrijd.teller;
    counts.set(naam, (counts.get(naam) ?? 0) + 1);
  });
  return counts;
}

function tellerAantal(counts: Map<string, number>, naam: string): number {
  let totaal = 0;
  counts.forEach((aantal, key) => {
    if (namenZijnGelijk(key, naam)) totaal += aantal;
  });
  return totaal;
}

function rondesSinds(
  gepland: Wedstrijd[],
  naam: string,
  rol: "play" | "count" | "any"
): number {
  for (let i = gepland.length - 1; i >= 0; i -= 1) {
    const wedstrijd = gepland[i];
    const speelde = speeltMee(wedstrijd, naam);
    const telde = isZelfdeSpeler(wedstrijd.teller, naam);
    if (rol === "play" && speelde) return gepland.length - 1 - i;
    if (rol === "count" && telde) return gepland.length - 1 - i;
    if (rol === "any" && (speelde || telde)) return gepland.length - 1 - i;
  }
  return gepland.length + 2;
}

function scoreKandidaat(
  wedstrijd: Wedstrijd,
  teller: string | null,
  gepland: Wedstrijd[],
  verboden: Set<string>,
  volgende?: Wedstrijd | null
): number {
  if (teller && [...verboden].some((naam) => namenZijnGelijk(naam, teller))) {
    return Number.POSITIVE_INFINITY;
  }

  const vorige = gepland[gepland.length - 1];
  const voorvorige = gepland[gepland.length - 2];
  let score = 0;
  const spelers = [wedstrijd.speler1, wedstrijd.speler2];

  if (vorige) {
    spelers.forEach((speler) => {
      if (speeltMee(vorige, speler)) score += PENALTY_SPEELT_OPNIEUW;
      if (isZelfdeSpeler(vorige.teller, speler)) {
        score += PENALTY_TELLEN_NAAR_SPELEN;
      }
    });
    if (teller && speeltMee(vorige, teller)) {
      score += PENALTY_SPELEN_NAAR_TELLEN;
    }
    if (teller && isZelfdeSpeler(vorige.teller, teller)) {
      score += PENALTY_TELLER_ACHTERELKAAR;
    }
  }

  if (vorige && voorvorige && teller) {
    spelers.forEach((speler) => {
      if (speeltMee(voorvorige, speler) && isZelfdeSpeler(vorige.teller, speler)) {
        score += PENALTY_SPEEL_TEL_SPEEL;
      }
    });
  }

  const counts = telTellers(gepland);
  if (teller) {
    score += tellerAantal(counts, teller) * PENALTY_TELLER_ONBALANS;
    if (volgende && speeltMee(volgende, teller)) {
      score += PENALTY_TELLER_SPEELT_VOLGENDE;
    }
  }

  spelers.forEach((speler) => {
    score -= rondesSinds(gepland, speler, "play") * BONUS_RUST;
  });
  if (teller) {
    score -= rondesSinds(gepland, teller, "any") * BONUS_RUST;
  }

  return score;
}

function kiesBesteTeller(
  wedstrijd: Wedstrijd,
  kandidaten: string[],
  gepland: Wedstrijd[],
  verboden: Set<string>,
  volgende?: Wedstrijd | null
): string | null {
  let pool = geldigeTellers(wedstrijd, kandidaten).filter(
    (naam) => ![...verboden].some((bezet) => namenZijnGelijk(bezet, naam))
  );
  if (pool.length === 0) {
    pool = geldigeTellers(wedstrijd, kandidaten);
  }
  if (pool.length === 0) return null;

  pool.sort((a, b) => {
    const scoreDiff =
      scoreKandidaat(wedstrijd, a, gepland, verboden, volgende) -
      scoreKandidaat(wedstrijd, b, gepland, verboden, volgende);
    if (scoreDiff !== 0) return scoreDiff;
    return a.localeCompare(b, "nl");
  });
  return pool[0];
}

export function kiesTeller(
  wedstrijd: Wedstrijd,
  kandidaten: string[],
  gepland: Wedstrijd[] = [],
  verboden: string[] = [],
  volgende?: Wedstrijd | null
): string | null {
  return kiesBesteTeller(
    wedstrijd,
    kandidaten,
    gepland,
    new Set(verboden),
    volgende
  );
}

export function herstelTellerIndienOngeldig(
  wedstrijd: Wedstrijd,
  kandidaten: string[],
  gepland: Wedstrijd[] = [],
  verboden: string[] = [],
  volgende?: Wedstrijd | null
): Wedstrijd {
  if (wedstrijd.bye) return { ...wedstrijd, teller: null };
  if (isGeldigeTeller(wedstrijd, wedstrijd.teller)) {
    if (
      wedstrijd.teller &&
      verboden.some((naam) => namenZijnGelijk(naam, wedstrijd.teller ?? ""))
    ) {
      return {
        ...wedstrijd,
        teller: kiesTeller(wedstrijd, kandidaten, gepland, verboden, volgende),
      };
    }
    return wedstrijd;
  }
  return {
    ...wedstrijd,
    teller: kiesTeller(wedstrijd, kandidaten, gepland, verboden, volgende),
  };
}

/**
 * Zet bestaande unieke wedstrijden in een rustige speelvolgorde
 * en wijst bij elke wedstrijd een teller toe.
 */
export function planWedstrijden(
  wedstrijden: Wedstrijd[],
  tellerKandidaten: string[],
  bezetteSpelersPerSlot: string[][] = []
): Wedstrijd[] {
  const resterend = [...wedstrijden];
  const volgorde: Wedstrijd[] = [];

  while (resterend.length > 0) {
    let besteIndex = 0;
    let besteScore = Number.POSITIVE_INFINITY;

    resterend.forEach((wedstrijd, index) => {
      const score = wedstrijd.bye
        ? -1_000 + index
        : scoreKandidaat(wedstrijd, null, volgorde, new Set());
      const beter =
        score < besteScore ||
        (score === besteScore &&
          paarSleutel(wedstrijd).localeCompare(
            paarSleutel(resterend[besteIndex]),
            "nl"
          ) < 0);
      if (beter) {
        besteIndex = index;
        besteScore = score;
      }
    });

    volgorde.push(resterend.splice(besteIndex, 1)[0]);
  }

  const gepland: Wedstrijd[] = [];
  volgorde.forEach((wedstrijd, slot) => {
    const verboden = new Set(bezetteSpelersPerSlot[slot] ?? []);
    const volgende = volgorde[slot + 1] ?? null;
    const teller = wedstrijd.bye
      ? null
      : kiesBesteTeller(
          wedstrijd,
          tellerKandidaten,
          gepland,
          verboden,
          volgende
        );
    gepland.push({
      ...wedstrijd,
      teller,
      volgnummer: slot + 1,
    });
  });

  return balanceerTellers(gepland, tellerKandidaten, bezetteSpelersPerSlot);
}

function tellerMagOpSlot(
  naam: string,
  gepland: Wedstrijd[],
  slot: number,
  verboden: string[],
  voorkomTellenNaarSpelen: boolean
): boolean {
  const huidige = gepland[slot];
  if (!isGeldigeTeller(huidige, naam)) return false;
  if (verboden.some((bezet) => namenZijnGelijk(bezet, naam))) return false;
  if (voorkomTellenNaarSpelen) {
    const volgende = gepland[slot + 1];
    if (volgende && speeltMee(volgende, naam)) return false;
  }
  return true;
}

function balanceerTellers(
  gepland: Wedstrijd[],
  kandidaten: string[],
  bezetteSpelersPerSlot: string[][] = []
): Wedstrijd[] {
  const resultaat = gepland.map((wedstrijd) => ({ ...wedstrijd }));
  const namen = kandidaten.filter((naam) => !isByeSpeler(naam));

  const probeerRonde = (voorkomTellenNaarSpelen: boolean): boolean => {
    const counts = telTellers(resultaat);
    const aantallen = namen.map((naam) => ({
      naam,
      aantal: tellerAantal(counts, naam),
    }));
    if (aantallen.length === 0) return false;
    const max = Math.max(...aantallen.map((item) => item.aantal));
    const min = Math.min(...aantallen.map((item) => item.aantal));
    if (max - min <= 1) return false;

    const belaste = aantallen.filter((item) => item.aantal === max);
    const lichte = aantallen.filter((item) => item.aantal === min);
    for (let slot = 0; slot < resultaat.length; slot += 1) {
      const huidige = resultaat[slot];
      if (!huidige.teller) continue;
      if (!belaste.some((item) => namenZijnGelijk(item.naam, huidige.teller ?? ""))) {
        continue;
      }
      const verboden = bezetteSpelersPerSlot[slot] ?? [];
      const vervanger = lichte.find((item) =>
        tellerMagOpSlot(
          item.naam,
          resultaat,
          slot,
          verboden,
          voorkomTellenNaarSpelen
        )
      );
      if (vervanger) {
        resultaat[slot] = { ...huidige, teller: vervanger.naam };
        return true;
      }
    }
    return false;
  };

  for (let ronde = 0; ronde < resultaat.length * 3; ronde += 1) {
    if (!probeerRonde(true) && !probeerRonde(false)) break;
  }

  return resultaat.map((wedstrijd, index) => ({
    ...wedstrijd,
    volgnummer: index + 1,
  }));
}

export function planPouleWedstrijden(spelers: string[]): Wedstrijd[] {
  const paren: Wedstrijd[] = [];
  for (let i = 0; i < spelers.length; i += 1) {
    for (let j = i + 1; j < spelers.length; j += 1) {
      paren.push({
        id: `${spelers[i]}__${spelers[j]}`,
        speler1: spelers[i],
        speler2: spelers[j],
        gespeeld: false,
        score1: 0,
        score2: 0,
        winnaar: null,
        aantal180Speler1: 0,
        aantal180Speler2: 0,
        hoogsteFinishSpeler1: null,
        hoogsteFinishSpeler2: null,
        bye: false,
        teller: null,
      });
    }
  }
  return planWedstrijden(paren, spelers);
}

export function spelersInTijdslot(
  borden: Bord[],
  slot: number,
  behalveBord?: string
): string[] {
  const namen: string[] = [];
  borden.forEach((bord) => {
    if (behalveBord && bord.naam === behalveBord) return;
    const wedstrijd = bord.wedstrijden[slot];
    if (!wedstrijd || wedstrijd.bye) return;
    namen.push(wedstrijd.speler1, wedstrijd.speler2);
  });
  return namen;
}

export function tellerConflicteertInTijdslot(
  borden: Bord[]
): { bordNaam: string; slot: number; teller: string }[] {
  const conflicten: { bordNaam: string; slot: number; teller: string }[] = [];
  const maxSlot = Math.max(0, ...borden.map((bord) => bord.wedstrijden.length));
  for (let slot = 0; slot < maxSlot; slot += 1) {
    const spelend = spelersInTijdslot(borden, slot);
    borden.forEach((bord) => {
      const wedstrijd = bord.wedstrijden[slot];
      if (!wedstrijd?.teller) return;
      if (spelend.some((naam) => namenZijnGelijk(naam, wedstrijd.teller ?? ""))) {
        conflicten.push({
          bordNaam: bord.naam,
          slot,
          teller: wedstrijd.teller,
        });
      }
    });
  }
  return conflicten;
}

export function herstelTijdslotTellers(borden: Bord[]): Bord[] {
  return borden.map((bord) => ({
    ...bord,
    wedstrijden: bord.wedstrijden.map((wedstrijd, slot) => {
      const verboden = spelersInTijdslot(borden, slot, bord.naam);
      if (!wedstrijd.teller) {
        return herstelTellerIndienOngeldig(
          wedstrijd,
          bord.spelers,
          bord.wedstrijden.slice(0, slot),
          verboden,
          bord.wedstrijden[slot + 1]
        );
      }
      const speeltElders = verboden.some((naam) =>
        namenZijnGelijk(naam, wedstrijd.teller ?? "")
      );
      if (!speeltElders && isGeldigeTeller(wedstrijd, wedstrijd.teller)) {
        return wedstrijd;
      }
      return herstelTellerIndienOngeldig(
        wedstrijd,
        bord.spelers,
        bord.wedstrijden.slice(0, slot),
        verboden,
        bord.wedstrijden[slot + 1]
      );
    }).map((wedstrijd, index) => ({ ...wedstrijd, volgnummer: index + 1 })),
  }));
}

export function telDirectOpnieuwSpelen(wedstrijden: Wedstrijd[]): number {
  let aantal = 0;
  for (let i = 1; i < wedstrijden.length; i += 1) {
    const vorige = wedstrijden[i - 1];
    const huidige = wedstrijden[i];
    [huidige.speler1, huidige.speler2].forEach((speler) => {
      if (speeltMee(vorige, speler)) aantal += 1;
    });
  }
  return aantal;
}

export function telTellenNaarSpelen(wedstrijden: Wedstrijd[]): number {
  let aantal = 0;
  for (let i = 1; i < wedstrijden.length; i += 1) {
    const vorige = wedstrijden[i - 1];
    const huidige = wedstrijden[i];
    if (!vorige.teller) continue;
    if (speeltMee(huidige, vorige.teller)) aantal += 1;
  }
  return aantal;
}

export function telSpelenNaarTellen(wedstrijden: Wedstrijd[]): number {
  let aantal = 0;
  for (let i = 1; i < wedstrijden.length; i += 1) {
    const vorige = wedstrijden[i - 1];
    const huidige = wedstrijden[i];
    if (!huidige.teller) continue;
    if (speeltMee(vorige, huidige.teller)) aantal += 1;
  }
  return aantal;
}

export function planningWaarschuwingen(
  wedstrijden: Wedstrijd[]
): PlanningWaarschuwing[] {
  const waarschuwingen: PlanningWaarschuwing[] = [];
  for (let i = 1; i < wedstrijden.length; i += 1) {
    const vorige = wedstrijden[i - 1];
    const huidige = wedstrijden[i];
    [huidige.speler1, huidige.speler2].forEach((speler) => {
      if (speeltMee(vorige, speler)) {
        waarschuwingen.push({
          wedstrijdIndex: i,
          speler,
          soort: "speelt_opnieuw",
          tekst: `⚠️ ${speler} moet twee wedstrijden achter elkaar spelen.`,
        });
      }
      if (isZelfdeSpeler(vorige.teller, speler)) {
        waarschuwingen.push({
          wedstrijdIndex: i,
          speler,
          soort: "tellen_naar_spelen",
          tekst: `⚠️ ${speler} moet direct na het tellen zelf spelen.`,
        });
      }
    });
    if (huidige.teller && speeltMee(vorige, huidige.teller)) {
      waarschuwingen.push({
        wedstrijdIndex: i,
        speler: huidige.teller,
        soort: "spelen_naar_tellen",
        tekst: `⚠️ ${huidige.teller} moet direct na het spelen tellen.`,
      });
    }
  }
  return waarschuwingen;
}

export function tellerVerdeling(wedstrijden: Wedstrijd[]): Map<string, number> {
  return telTellers(wedstrijden);
}
