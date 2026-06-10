import type { Speelavond, SpeelavondStatistieken } from "@/types/competition";

export function berekenStatistieken(
  historie: Speelavond[]
): SpeelavondStatistieken {
  if (historie.length === 0) {
    return {
      totaalAvonden: 0,
      gemiddeldSpelers: 0,
      meestAanwezig: "-",
      meestAanwezigAantal: 0,
      gemiddeldBorden: 0,
    };
  }

  const aanwezigheid = new Map<string, number>();
  let totaalSpelers = 0;
  let totaalBorden = 0;

  historie.forEach((avond) => {
    const spelers = avond.aanwezigen.length + avond.gasten.length;
    totaalSpelers += spelers;
    totaalBorden += avond.borden.length;

    avond.aanwezigen.forEach((lid) => {
      aanwezigheid.set(lid, (aanwezigheid.get(lid) ?? 0) + 1);
    });
  });

  let meestAanwezig = "-";
  let meestAanwezigAantal = 0;

  aanwezigheid.forEach((aantal, lid) => {
    if (aantal > meestAanwezigAantal) {
      meestAanwezig = lid;
      meestAanwezigAantal = aantal;
    }
  });

  return {
    totaalAvonden: historie.length,
    gemiddeldSpelers: Math.round((totaalSpelers / historie.length) * 10) / 10,
    meestAanwezig,
    meestAanwezigAantal,
    gemiddeldBorden: Math.round((totaalBorden / historie.length) * 10) / 10,
  };
}
