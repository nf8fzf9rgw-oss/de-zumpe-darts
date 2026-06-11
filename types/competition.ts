export type BordStatus = "wachtend" | "actief" | "voltooid";

export interface Wedstrijd {
  id: string;
  speler1: string;
  speler2: string;
  gespeeld: boolean;
  score1: number;
  score2: number;
  winnaar: string | null;
  aantal180Speler1: number;
  aantal180Speler2: number;
  hoogsteFinishSpeler1: number | null;
  hoogsteFinishSpeler2: number | null;
}

export interface Bord {
  naam: string;
  spelers: string[];
  wedstrijden: Wedstrijd[];
  status: BordStatus;
}

export const SPEELAVOND_DATA_VERSIE = 1;

export interface Speelavond {
  datum: string;
  seizoen: string;
  aanwezigen: string[];
  gasten: string[];
  borden: Bord[];
  spelerVanDeAvond: string | null;
  aanmeldToken: string | null;
  versie?: number;
}

export interface ZumpeDataBackup {
  versie: number;
  geexporteerd: string;
  speelavond: Speelavond | null;
  historie: Speelavond[];
  leden: string[];
  actiefSeizoen: string;
}

export interface Seizoen {
  id: string;
  label: string;
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
  meeste180s: string;
  meeste180sAantal: number;
}

export interface DashboardStatistieken {
  aanwezigeLeden: number;
  gastspelers: number;
  totaalSpelers: number;
  aantalBorden: number;
  totaalWedstrijden: number;
  wedstrijdenVandaag: number;
  gespeeldeWedstrijden: number;
  totaalLeden: number;
}

export interface SpelerStand {
  positie: number;
  naam: string;
  punten: number;
  competitiepunten: number;
  bonuspunten: number;
  gewonnen: number;
  verloren: number;
  legsVoor: number;
  legsTegen: number;
  percentage: number;
  aantal180s: number;
  hoogsteFinish: number;
}

export interface SpelerProfielData {
  naam: string;
  positie: number;
  punten: number;
  competitiepunten: number;
  bonuspunten: number;
  aanwezigheid: number;
  overwinningen: number;
  verliezen: number;
  winpercentage: number;
  gespeeldeWedstrijden: number;
  aantal180s: number;
  hoogsteFinish: number;
  spelerVanDeAvondTitels: number;
  badges: string[];
}

export interface ClubRecord {
  naam: string;
  waarde: number;
  label: string;
}

export interface ClubRecords {
  meeste180s: ClubRecord;
  hoogsteFinish: ClubRecord;
  meesteOverwinningen: ClubRecord;
  hoogsteWinstpercentage: ClubRecord;
  langsteWinstreeks: ClubRecord;
}

export interface SpelerVanDeAvondScore {
  naam: string;
  competitiepunten: number;
  overwinningen: number;
  bonus180: number;
  bonusFinish: number;
  totaal: number;
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

export interface AanmeldSessie {
  token: string;
  seizoen: string;
  aanwezigen: string[];
  gestart: string;
}
