export interface Wedstrijd {
  speler1: string;
  speler2: string;
}

export interface Bord {
  naam: string;
  spelers: string[];
  wedstrijden: Wedstrijd[];
}

export interface Speelavond {
  datum: string;
  aanwezigen: string[];
  gasten: string[];
  borden: Bord[];
}

export interface SpeelavondStatistieken {
  totaalAvonden: number;
  gemiddeldSpelers: number;
  meestAanwezig: string;
  meestAanwezigAantal: number;
  gemiddeldBorden: number;
}

export interface DashboardStatistieken {
  aanwezigeLeden: number;
  gastspelers: number;
  totaalSpelers: number;
  aantalBorden: number;
  totaalWedstrijden: number;
}
