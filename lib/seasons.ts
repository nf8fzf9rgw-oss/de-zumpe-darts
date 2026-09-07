import type { Seizoen, Speelavond } from "@/types/competition";

/** Seizoen start in september (maand 8 = september, 0-indexed). */
export const SEIZOEN_START_MAAND = 8;

/** Actieve competitie met officiële tussenstand 15-08-2026. */
export const STANDAARD_SEIZOEN_ID = "2025-2026";

const SEIZOEN_MIGRATIE_KEY = "deZumpeSeizoenStandaard2025_2026";

export const BESCHIKBARE_SEIZOENEN: Seizoen[] = [
  { id: "2025-2026", label: "Seizoen 2025–2026", startMaand: 8, startJaar: 2025 },
  { id: "2026-2027", label: "Seizoen 2026–2027", startMaand: 8, startJaar: 2026 },
  { id: "2027-2028", label: "Seizoen 2027–2028", startMaand: 8, startJaar: 2027 },
  { id: "2025", label: "Seizoen 2025 (legacy)", startMaand: 0, startJaar: 2025 },
  { id: "2026", label: "Seizoen 2026 (legacy)", startMaand: 0, startJaar: 2026 },
  { id: "2027", label: "Seizoen 2027 (legacy)", startMaand: 0, startJaar: 2027 },
];

const SEIZOEN_KEY = "deZumpeActiefSeizoen";

export function haalSeizoenVanDatum(datum: string): string {
  if (!datum) return haalHuidigSeizoenId();
  const parsed = new Date(datum);
  if (Number.isNaN(parsed.getTime())) return haalHuidigSeizoenId();

  const maand = parsed.getMonth();
  const jaar = parsed.getFullYear();
  const startJaar = maand >= SEIZOEN_START_MAAND ? jaar : jaar - 1;
  const id = `${startJaar}-${startJaar + 1}`;

  if (BESCHIKBARE_SEIZOENEN.some((s) => s.id === id)) return id;
  return String(jaar);
}

export function haalHuidigSeizoenId(): string {
  return STANDAARD_SEIZOEN_ID;
}

export function laadActiefSeizoen(): string {
  if (typeof window === "undefined") return STANDAARD_SEIZOEN_ID;

  if (!localStorage.getItem(SEIZOEN_MIGRATIE_KEY)) {
    localStorage.setItem(SEIZOEN_KEY, STANDAARD_SEIZOEN_ID);
    localStorage.setItem(SEIZOEN_MIGRATIE_KEY, "1");
    return STANDAARD_SEIZOEN_ID;
  }

  const opgeslagen = localStorage.getItem(SEIZOEN_KEY);
  if (opgeslagen && BESCHIKBARE_SEIZOENEN.some((s) => s.id === opgeslagen)) {
    return opgeslagen;
  }
  return STANDAARD_SEIZOEN_ID;
}

export function slaActiefSeizoenOp(seizoenId: string): void {
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
  return (
    BESCHIKBARE_SEIZOENEN.find((s) => s.id === seizoenId)?.label ??
    `Seizoen ${seizoenId}`
  );
}
