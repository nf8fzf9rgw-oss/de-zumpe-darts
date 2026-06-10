export type BordStatus = "wachtend" | "actief" | "voltooid";

export interface Wedstrijd {
  id: string;
  speler1: string;
  speler2: string;
  gespeeld: boolean;
  score1: number;
  score2: number;
  winnaar: string | null;
}

export interface Bord {
  naam: string;
  spelers: string[];
  wedstrijden: Wedstrijd[];
  status: BordStatus;
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
  meesteOverwinningen: string;
  meesteOverwinningenAantal: number;
  hoogsteWinstpercentage: string;
  hoogsteWinstpercentageWaarde: number;
  meesteWedstrijden: string;
  meesteWedstrijdenAantal: number;
}

export interface DashboardStatistieken {
  aanwezigeLeden: number;
  gastspelers: number;
  totaalSpelers: number;
  aantalBorden: number;
  totaalWedstrijden: number;
  wedstrijdenVandaag: number;
  gespeeldeWedstrijden: number;
}

export interface SpelerStand {
  positie: number;
  naam: string;
  punten: number;
  gewonnen: number;
  verloren: number;
  legsVoor: number;
  legsTegen: number;
  percentage: number;
}

export interface SpelerProfiel {
  naam: string;
  aanwezigheid: number;
  overwinningen: number;
  verliezen: number;
  winpercentage: number;
  gespeeldeWedstrijden: number;
}

export interface GrafiekDataPunt {
  label: string;
  waarde: number;
}

export interface StatistiekGrafieken {
  opkomstPerAvond: GrafiekDataPunt[];
  spelersOntwikkeling: GrafiekDataPunt[];
  wedstrijdenPerAvond: GrafiekDataPunt[];
}
