import type { Seizoen, Speelavond } from "@/types/competition";

/** Seizoen start in september (maand 8 = september, 0-indexed). */
export const SEIZOEN_START_MAAND = 8;

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
  const nu = new Date();
  const id = haalSeizoenVanDatum(nu.toISOString());
  if (BESCHIKBARE_SEIZOENEN.some((s) => s.id === id)) return id;
  return BESCHIKBARE_SEIZOENEN[0].id;
}

export function laadActiefSeizoen(): string {
  if (typeof window === "undefined") return haalHuidigSeizoenId();
  const opgeslagen = localStorage.getItem(SEIZOEN_KEY);
  if (opgeslagen && BESCHIKBARE_SEIZOENEN.some((s) => s.id === opgeslagen)) {
    return opgeslagen;
  }
  return haalHuidigSeizoenId();
}

export function slaActiefSeizoenOp(seizoenId: string): void {
  localStorage.setItem(SEIZOEN_KEY, seizoenId);
}

export function filterOpSeizoen(
  historie: Speelavond[],
  seizoenId: string
): Speelavond[] {
  return historie.filter(
    (avond) => (avond.seizoen ?? haalSeizoenVanDatum(avond.datum)) === seizoenId
  );
}

export function seizoenLabel(seizoenId: string): string {
  return (
    BESCHIKBARE_SEIZOENEN.find((s) => s.id === seizoenId)?.label ??
    `Seizoen ${seizoenId}`
  );
}
