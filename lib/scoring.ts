export const PUNTEN_PER_WINST = 3;

const FINISH_BONUS_KEY = "deZumpeFinishBonus";

export interface FinishBonusRegel {
  min: number;
  max: number;
  bonus: number;
}

/** Standaard bonuspunten voor finishes van 100 of hoger. */
export const STANDAARD_FINISH_BONUS: FinishBonusRegel[] = [
  { min: 100, max: 110, bonus: 1 },
  { min: 111, max: 120, bonus: 2 },
  { min: 121, max: 140, bonus: 4 },
  { min: 141, max: 160, bonus: 8 },
  { min: 161, max: 167, bonus: 12 },
  { min: 170, max: 170, bonus: 20 },
];

export function valideerFinishBonusTabel(
  regels: FinishBonusRegel[]
): FinishBonusRegel[] | null {
  if (!Array.isArray(regels) || regels.length === 0) return null;
  const geldig = regels.every(
    (r) =>
      Number.isFinite(r.min) &&
      Number.isFinite(r.max) &&
      Number.isFinite(r.bonus) &&
      r.min <= r.max &&
      r.bonus >= 0
  );
  return geldig ? regels : null;
}

export function laadFinishBonusTabel(): FinishBonusRegel[] {
  if (typeof window === "undefined") return STANDAARD_FINISH_BONUS;
  const raw = localStorage.getItem(FINISH_BONUS_KEY);
  if (!raw) return STANDAARD_FINISH_BONUS;
  try {
    const parsed = JSON.parse(raw) as FinishBonusRegel[];
    return valideerFinishBonusTabel(parsed) ?? STANDAARD_FINISH_BONUS;
  } catch {
    return STANDAARD_FINISH_BONUS;
  }
}

export function slaFinishBonusTabelOp(regels: FinishBonusRegel[]): boolean {
  const geldig = valideerFinishBonusTabel(regels);
  if (!geldig) return false;
  localStorage.setItem(FINISH_BONUS_KEY, JSON.stringify(geldig));
  return true;
}

export function herstelFinishBonusTabel(): void {
  localStorage.removeItem(FINISH_BONUS_KEY);
}

export function berekenFinishBonus(
  finish: number,
  tabel: FinishBonusRegel[] = STANDAARD_FINISH_BONUS
): number {
  if (finish <= 0) return 0;
  const regel = tabel.find((r) => finish >= r.min && finish <= r.max);
  return regel?.bonus ?? 0;
}

/** Elke 180 telt als +1 bonuspunt */
export function bereken180Bonus(aantal: number): number {
  return Math.max(0, aantal);
}

export function isGeldigeFinish(waarde: number): boolean {
  return waarde === 0 || (waarde >= 100 && waarde <= 170);
}
