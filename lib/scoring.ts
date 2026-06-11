/** Competitiepunten per gewonnen wedstrijd */
export const PUNTEN_PER_WINST = 3;

/** Bonuspunten voor finishes (100–170) */
export function berekenFinishBonus(finish: number): number {
  if (finish <= 0) return 0;
  if (finish === 170) return 20;
  if (finish >= 161 && finish <= 167) return 12;
  if (finish >= 141 && finish <= 160) return 8;
  if (finish >= 121 && finish <= 140) return 4;
  if (finish >= 111 && finish <= 120) return 2;
  if (finish >= 100 && finish <= 110) return 1;
  return 0;
}

/** Elke 180 telt als +1 bonuspunt */
export function bereken180Bonus(aantal: number): number {
  return Math.max(0, aantal);
}

export function isGeldigeFinish(waarde: number): boolean {
  return waarde === 0 || (waarde >= 100 && waarde <= 170);
}
