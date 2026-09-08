import {
  amsterdamWeekday,
  isOpenbarePeriodeActief,
  type OpenbaarVenster,
} from "@/lib/avond-status";
import { isPouleBord } from "@/lib/knockout";
import { namenZijnGelijk } from "@/lib/namen";
import type { Bord, Wedstrijd } from "@/types/competition";

export const MIJN_POULE_SPELER_PARAM = "speler";

export type WedstrijdWeergaveStatus =
  | "nog_te_spelen"
  | "bezig"
  | "gewonnen"
  | "verloren"
  | "gelijkspel"
  | "gespeeld";

export interface WedstrijdStatusWeergave {
  key: WedstrijdWeergaveStatus;
  label: string;
  icoon: string;
  badgeClass: string;
}

export interface BordRondes {
  poule: Bord[];
  winnaarsronde: Bord[];
  verliezersronde: Bord[];
}

export interface SchemaFilter {
  bordNaam: string | null;
  spelerQuery: string;
  alleenMijnWedstrijden: boolean;
  eigenNaam: string;
}

export function mijnPoulePad(spelerNaam: string): string {
  const params = new URLSearchParams();
  params.set(MIJN_POULE_SPELER_PARAM, spelerNaam);
  return `/mijn-poule?${params.toString()}`;
}

export function wedstrijdenPad(opties?: {
  speler?: string;
  bord?: string;
}): string {
  const params = new URLSearchParams();
  if (opties?.speler) params.set(MIJN_POULE_SPELER_PARAM, opties.speler);
  if (opties?.bord) params.set("bord", opties.bord);
  const query = params.toString();
  return query ? `/competitie?${query}` : "/competitie";
}

export function tegenstanderVan(
  wedstrijd: Wedstrijd,
  spelerNaam: string
): string {
  if (namenZijnGelijk(wedstrijd.speler1, spelerNaam)) return wedstrijd.speler2;
  if (namenZijnGelijk(wedstrijd.speler2, spelerNaam)) return wedstrijd.speler1;
  return wedstrijd.speler2;
}

export function wedstrijdHeeftSpeler(
  wedstrijd: Wedstrijd,
  spelerNaam: string
): boolean {
  return (
    namenZijnGelijk(wedstrijd.speler1, spelerNaam) ||
    namenZijnGelijk(wedstrijd.speler2, spelerNaam)
  );
}

export function wedstrijdIsBezig(wedstrijd: Wedstrijd): boolean {
  return !wedstrijd.gespeeld && (wedstrijd.score1 > 0 || wedstrijd.score2 > 0);
}

export function wedstrijdWeergaveStatus(
  wedstrijd: Wedstrijd,
  perspectiefNaam?: string
): WedstrijdStatusWeergave {
  if (wedstrijd.gespeeld) {
    if (perspectiefNaam && wedstrijd.gelijkspel) {
      return {
        key: "gelijkspel",
        label: "Gelijkspel",
        icoon: "🤝",
        badgeClass: "bg-zinc-800 text-zinc-300",
      };
    }
    if (perspectiefNaam && wedstrijd.winnaar) {
      if (namenZijnGelijk(wedstrijd.winnaar, perspectiefNaam)) {
        return {
          key: "gewonnen",
          label: "Gewonnen",
          icoon: "✅",
          badgeClass: "bg-red-900/50 text-red-200",
        };
      }
      return {
        key: "verloren",
        label: "Verloren",
        icoon: "❌",
        badgeClass: "bg-zinc-800 text-zinc-400",
      };
    }
    return {
      key: "gespeeld",
      label: "GEREED",
      icoon: "🟢",
      badgeClass: "bg-zinc-800 text-zinc-300",
    };
  }

  if (wedstrijdIsBezig(wedstrijd)) {
    return {
      key: "bezig",
      label: "LIVE",
      icoon: "🔴",
      badgeClass: "bg-red-900/50 text-red-200",
    };
  }

  return {
    key: "nog_te_spelen",
    label: "WACHT",
    icoon: "⚪",
    badgeClass: "bg-zinc-800 text-zinc-300",
  };
}

export function wedstrijdUitslagTekst(wedstrijd: Wedstrijd): string | null {
  if (!wedstrijd.gespeeld) return null;
  if (wedstrijd.bye) return `${wedstrijd.speler1} — bye`;
  return `${wedstrijd.speler1} ${wedstrijd.score1} – ${wedstrijd.score2} ${wedstrijd.speler2}`;
}

export function wedstrijdPrestatieRegels(wedstrijd: Wedstrijd): string[] {
  const regels: string[] = [];
  if (wedstrijd.aantal180Speler1 > 0) {
    regels.push(`🎯 ${wedstrijd.speler1} — ${wedstrijd.aantal180Speler1} × 180`);
  }
  if (wedstrijd.aantal180Speler2 > 0) {
    regels.push(`🎯 ${wedstrijd.speler2} — ${wedstrijd.aantal180Speler2} × 180`);
  }
  if (wedstrijd.hoogsteFinishSpeler1 && wedstrijd.hoogsteFinishSpeler1 >= 100) {
    regels.push(`💯 ${wedstrijd.speler1} — ${wedstrijd.hoogsteFinishSpeler1}`);
  }
  if (wedstrijd.hoogsteFinishSpeler2 && wedstrijd.hoogsteFinishSpeler2 >= 100) {
    regels.push(`💯 ${wedstrijd.speler2} — ${wedstrijd.hoogsteFinishSpeler2}`);
  }
  return regels;
}

export type AvondWeergaveStatus =
  | "geen_speelavond"
  | "geen_actieve_speelavond"
  | "wacht_op_start"
  | "live"
  | "afgerond";

export interface AvondStatusOpties extends OpenbaarVenster {
  nu?: Date;
  isBestuur?: boolean;
}

export interface AvondStatusWeergave {
  key: AvondWeergaveStatus;
  label: string;
  icoon: string;
}

const GEEN_ACTIEVE: AvondStatusWeergave = {
  key: "geen_actieve_speelavond",
  label: "GEEN ACTIEVE SPEELAVOND",
  icoon: "⚪",
};

const GEEN_SPEELAVOND: AvondStatusWeergave = {
  key: "geen_speelavond",
  label: "GEEN SPEELAVOND",
  icoon: "⚪",
};

function matchAvondStatus(borden: Bord[]): AvondStatusWeergave {
  const wedstrijden = borden.flatMap((bord) => bord.wedstrijden);
  const gespeeld = wedstrijden.filter((wedstrijd) => wedstrijd.gespeeld).length;
  if (wedstrijden.length > 0 && gespeeld === wedstrijden.length) {
    return { key: "afgerond", label: "AFGEROND", icoon: "🟢" };
  }
  return { key: "live", label: "LIVE", icoon: "🔴" };
}

export function isVandaagVrijdag(nu = new Date()): boolean {
  return amsterdamWeekday(nu) === 5;
}

export function avondWeergaveStatus(
  borden: Bord[],
  opties: Date | AvondStatusOpties = {}
): AvondStatusWeergave {
  const parsed: AvondStatusOpties =
    opties instanceof Date ? { nu: opties } : opties;
  const nu = parsed.nu ?? new Date();
  const venster: OpenbaarVenster = {
    gestartOp: parsed.gestartOp,
    openbareEindtijd: parsed.openbareEindtijd,
    datum: parsed.datum,
    borden,
  };
  const openbaarActief = isOpenbarePeriodeActief(venster, nu);

  if (borden.length === 0) {
    if (isVandaagVrijdag(nu)) {
      return { key: "wacht_op_start", label: "WACHT OP START", icoon: "🟡" };
    }
    return GEEN_SPEELAVOND;
  }

  if (!openbaarActief && !parsed.isBestuur) {
    return GEEN_ACTIEVE;
  }

  return matchAvondStatus(borden);
}

export function groepeerBordenInRondes(borden: Bord[]): BordRondes {
  return {
    poule: borden.filter(isPouleBord),
    winnaarsronde: borden.filter((bord) => bord.fase === "winnaarsronde"),
    verliezersronde: borden.filter((bord) => bord.fase === "verliezersronde"),
  };
}

export function actieveBordNamen(borden: Bord[]): string[] {
  return borden
    .filter((bord) => bord.spelers.length > 0 || bord.wedstrijden.length > 0)
    .map((bord) => bord.naam);
}

function spelerMatchtQuery(naam: string, query: string): boolean {
  return naam.toLowerCase().includes(query);
}

export function filterBordenVoorSchema(
  borden: Bord[],
  filter: SchemaFilter
): Bord[] {
  const query = filter.spelerQuery.trim().toLowerCase();
  const spelerNaam = filter.alleenMijnWedstrijden
    ? filter.eigenNaam.trim()
    : "";

  return borden
    .filter((bord) => {
      if (filter.bordNaam && bord.naam !== filter.bordNaam) return false;
      return true;
    })
    .map((bord) => {
      let wedstrijden = bord.wedstrijden;

      if (spelerNaam) {
        wedstrijden = wedstrijden.filter((wedstrijd) =>
          wedstrijdHeeftSpeler(wedstrijd, spelerNaam)
        );
      }

      if (query) {
        wedstrijden = wedstrijden.filter(
          (wedstrijd) =>
            spelerMatchtQuery(wedstrijd.speler1, query) ||
            spelerMatchtQuery(wedstrijd.speler2, query)
        );
      }

      return { ...bord, wedstrijden };
    })
    .filter((bord) => {
      if (bord.wedstrijden.length > 0) return true;
      if (!query && !spelerNaam) return true;
      if (spelerNaam) {
        return bord.spelers.some((naam) => namenZijnGelijk(naam, spelerNaam));
      }
      return bord.spelers.some((naam) => spelerMatchtQuery(naam, query));
    });
}
