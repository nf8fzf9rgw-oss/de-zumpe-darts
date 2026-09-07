import type { Seizoen, Speelavond } from "@/types/competition";

/** Seizoen start in september (maand 8 = september, 0-indexed). */
export const SEIZOEN_START_MAAND = 8;

/** Actieve competitie met officiële tussenstand 15-08-2026. */
export const STANDAARD_SEIZOEN_ID = "2025-2026";

const SEIZOEN_KEY = "deZumpeActiefSeizoen";
const SEIZOENEN_KEY = "deZumpeSeizoenen";

/**
 * Seizoenen die altijd bestaan en niet verwijderd kunnen worden.
 * Extra seizoenen voegt het bestuur zelf toe via de seizoenkiezer.
 */
export const BASIS_SEIZOEN_STARTJAREN = [2025] as const;

/** "2025-2026" → 2025. Geeft null bij een legacy- of onbekend id. */
export function startJaarVanSeizoenId(seizoenId: string): number | null {
  const match = /^(\d{4})-(\d{4})$/.exec(seizoenId);
  if (!match) return null;
  const start = Number(match[1]);
  if (Number(match[2]) !== start + 1) return null;
  return start;
}

export function maakSeizoen(startJaar: number): Seizoen {
  return {
    id: `${startJaar}-${startJaar + 1}`,
    label: `Seizoen ${startJaar}–${startJaar + 1}`,
    startMaand: SEIZOEN_START_MAAND,
    startJaar,
  };
}

function leesStartJaren(): number[] {
  if (typeof window === "undefined") return [...BASIS_SEIZOEN_STARTJAREN];

  const opgeslagen = localStorage.getItem(SEIZOENEN_KEY);
  if (!opgeslagen) return [...BASIS_SEIZOEN_STARTJAREN];

  try {
    const data = JSON.parse(opgeslagen) as unknown;
    if (!Array.isArray(data)) return [...BASIS_SEIZOEN_STARTJAREN];
    const jaren = data
      .map((waarde) => Number(waarde))
      .filter((jaar) => Number.isInteger(jaar) && jaar >= 2000 && jaar <= 2100);
    return normaliseerStartJaren([...BASIS_SEIZOEN_STARTJAREN, ...jaren]);
  } catch {
    return [...BASIS_SEIZOEN_STARTJAREN];
  }
}

function normaliseerStartJaren(jaren: number[]): number[] {
  return [...new Set(jaren)].sort((a, b) => a - b);
}

function schrijfStartJaren(jaren: number[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SEIZOENEN_KEY, JSON.stringify(normaliseerStartJaren(jaren)));
}

/** Alle seizoenen die het bestuur kan kiezen, oplopend op startjaar. */
export function laadSeizoenen(): Seizoen[] {
  return leesStartJaren().map(maakSeizoen);
}

export function isBasisSeizoen(seizoenId: string): boolean {
  const startJaar = startJaarVanSeizoenId(seizoenId);
  return (
    startJaar !== null &&
    (BASIS_SEIZOEN_STARTJAREN as readonly number[]).includes(startJaar)
  );
}

/** Voegt een seizoen toe en geeft de bijgewerkte lijst terug. */
export function voegSeizoenToe(startJaar: number): Seizoen[] {
  if (!Number.isInteger(startJaar) || startJaar < 2000 || startJaar > 2100) {
    return laadSeizoenen();
  }
  const jaren = normaliseerStartJaren([...leesStartJaren(), startJaar]);
  schrijfStartJaren(jaren);
  return jaren.map(maakSeizoen);
}

/** Verwijdert een zelf toegevoegd seizoen. Basisseizoenen blijven staan. */
export function verwijderSeizoen(seizoenId: string): Seizoen[] {
  const startJaar = startJaarVanSeizoenId(seizoenId);
  if (startJaar === null || isBasisSeizoen(seizoenId)) return laadSeizoenen();

  const jaren = leesStartJaren().filter((jaar) => jaar !== startJaar);
  schrijfStartJaren(jaren);
  return jaren.map(maakSeizoen);
}

/** Startjaar van het seizoen dat volgt op het laatst bekende seizoen. */
export function volgendSeizoenStartJaar(): number {
  const jaren = leesStartJaren();
  return Math.max(...jaren) + 1;
}

export function haalSeizoenVanDatum(datum: string): string {
  if (!datum) return haalHuidigSeizoenId();
  const parsed = new Date(datum);
  if (Number.isNaN(parsed.getTime())) return haalHuidigSeizoenId();

  const maand = parsed.getMonth();
  const jaar = parsed.getFullYear();
  const startJaar = maand >= SEIZOEN_START_MAAND ? jaar : jaar - 1;
  return `${startJaar}-${startJaar + 1}`;
}

export function haalHuidigSeizoenId(): string {
  return STANDAARD_SEIZOEN_ID;
}

export function laadActiefSeizoen(): string {
  if (typeof window === "undefined") return STANDAARD_SEIZOEN_ID;

  const opgeslagen = localStorage.getItem(SEIZOEN_KEY);
  if (opgeslagen && laadSeizoenen().some((s) => s.id === opgeslagen)) {
    return opgeslagen;
  }

  // Oude opslag kon nog een legacy-jaar ("2026") bevatten.
  slaActiefSeizoenOp(STANDAARD_SEIZOEN_ID);
  return STANDAARD_SEIZOEN_ID;
}

export function slaActiefSeizoenOp(seizoenId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SEIZOEN_KEY, seizoenId);
}

function isLegacyJaarSeizoen(seizoenId: string): boolean {
  return /^\d{4}$/.test(seizoenId);
}

export function avondSeizoenId(avond: Speelavond): string {
  const raw = avond.seizoen;
  if (raw && !isLegacyJaarSeizoen(raw)) return raw;
  if (avond.datum) return haalSeizoenVanDatum(avond.datum);
  return raw || STANDAARD_SEIZOEN_ID;
}

export function filterOpSeizoen(
  historie: Speelavond[],
  seizoenId: string
): Speelavond[] {
  return historie.filter((avond) => avondSeizoenId(avond) === seizoenId);
}

export function seizoenLabel(seizoenId: string): string {
  const startJaar = startJaarVanSeizoenId(seizoenId);
  if (startJaar !== null) return maakSeizoen(startJaar).label;
  return `Seizoen ${seizoenId}`;
}
