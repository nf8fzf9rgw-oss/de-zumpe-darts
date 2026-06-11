import type { Seizoen, Speelavond } from "@/types/competition";

export const BESCHIKBARE_SEIZOENEN: Seizoen[] = [
  { id: "2025", label: "Seizoen 2025" },
  { id: "2026", label: "Seizoen 2026" },
  { id: "2027", label: "Seizoen 2027" },
];

const SEIZOEN_KEY = "deZumpeActiefSeizoen";

export function haalSeizoenVanDatum(datum: string): string {
  if (!datum) return haalHuidigSeizoenId();
  const parsed = new Date(datum);
  if (Number.isNaN(parsed.getTime())) return haalHuidigSeizoenId();
  return String(parsed.getFullYear());
}

export function haalHuidigSeizoenId(): string {
  const jaar = new Date().getFullYear();
  const id = String(jaar);
  if (BESCHIKBARE_SEIZOENEN.some((s) => s.id === id)) return id;
  return BESCHIKBARE_SEIZOENEN[BESCHIKBARE_SEIZOENEN.length - 1].id;
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
