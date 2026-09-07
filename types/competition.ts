export type BordStatus = "wachtend" | "actief" | "voltooid";

export type BordFase = "poule" | "winnaarsronde" | "verliezersronde";

export interface Wedstrijd {
  id: string;
  speler1: string;
  speler2: string;
  gespeeld: boolean;
  score1: number;
  score2: number;
  winnaar: string | null;
  gelijkspel?: boolean;
  aantal180Speler1: number;
  aantal180Speler2: number;
  hoogsteFinishSpeler1: number | null;
  hoogsteFinishSpeler2: number | null;
  bye?: boolean;
}

export interface Bord {
  naam: string;
  spelers: string[];
  wedstrijden: Wedstrijd[];
  status: BordStatus;
  fase?: BordFase;
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
  notities?: string;
  versie?: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actie: string;
  details: string;
  door?: string;
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
  startMaand?: number;
  startJaar?: number;
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

/** Officiële rij uit een historische tussenstand (niet herberekend). */
export interface HistorischeSpelerStand {
  positie: number;
  naam: string;
  aanwezig: number;
  poulepunten: number;
  winnaarsrondeLegsGewonnen: number;
  winnaarsrondeLegsVerloren: number;
  verliezersrondeLegsGewonnen: number;
  verliezersrondeLegsVerloren: number;
  hoogsteFinish: number;
  aantal180s: number;
  puntenTotaal: number;
}

export interface HistorischeTussenstand {
  seizoen: string;
  /** ISO-datum van de snapshot, bijv. 2026-08-15 */
  datum: string;
  bron: string;
  spelers: HistorischeSpelerStand[];
}

export type SpelerStandBron = "historisch" | "wedstrijden" | "gecombineerd";

export interface SpelerStand {
  positie: number;
  naam: string;
  /** Officieel / gecombineerd punten totaal */
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
  aanwezig: number;
  poulepunten: number;
  winnaarsrondeLegsGewonnen: number;
  winnaarsrondeLegsVerloren: number;
  verliezersrondeLegsGewonnen: number;
  verliezersrondeLegsVerloren: number;
  /** Punten uit officiële snapshot (ongewijzigd bewaard) */
  historischePunten: number;
  /** Punten uit wedstrijden na de snapshot */
  nieuwePunten: number;
  bron: SpelerStandBron;
  /** Officiële positie uit de snapshot, of null */
  officielePositie: number | null;
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
  poulepunten: number;
  historischePunten: number;
  winnaarsrondeLegsGewonnen: number;
  winnaarsrondeLegsVerloren: number;
  verliezersrondeLegsGewonnen: number;
  verliezersrondeLegsVerloren: number;
  legsVoor: number;
  legsTegen: number;
  /** Positie op de officiële tussenstand, of null */
  officielePositie: number | null;
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
