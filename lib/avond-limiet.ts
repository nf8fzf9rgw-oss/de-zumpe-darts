import { MAX_SPELERS_PER_AVOND } from "@/lib/competition";

export interface AvondLimietResultaat {
  aanwezigen: string[];
  gasten: string[];
  geweigerdeLeden: string[];
  verwijderdeGasten: string[];
}

/**
 * Maximaal 30 spelers per avond. Leden blijven, gasten vallen af
 * zodra het totaal boven het maximum komt.
 */
export function pasAvondLimietToe(
  aanwezigen: string[],
  gasten: string[],
  max = MAX_SPELERS_PER_AVOND
): AvondLimietResultaat {
  const leden = aanwezigen.slice(0, max);
  const geweigerdeLeden = aanwezigen.slice(max);
  const rest = Math.max(0, max - leden.length);
  const blijvendeGasten = gasten.slice(0, rest);
  const verwijderdeGasten = gasten.slice(rest);

  return {
    aanwezigen: leden,
    gasten: blijvendeGasten,
    geweigerdeLeden,
    verwijderdeGasten,
  };
}

export function avondIsVol(
  aanwezigen: number,
  gasten: number,
  max = MAX_SPELERS_PER_AVOND
): boolean {
  return aanwezigen + gasten >= max;
}
