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
          badgeClass: "bg-green-900/50 text-green-300",
        };
      }
      return {
        key: "verloren",
        label: "Verloren",
        icoon: "❌",
        badgeClass: "bg-red-950/60 text-red-300",
      };
    }
    return {
      key: "gespeeld",
      label: "Gespeeld",
      icoon: "🟢",
      badgeClass: "bg-green-900/50 text-green-300",
    };
  }

  if (wedstrijdIsBezig(wedstrijd)) {
    return {
      key: "bezig",
      label: "Bezig",
      icoon: "🔴",
      badgeClass: "bg-red-900/50 text-red-200",
    };
  }

  return {
    key: "nog_te_spelen",
    label: "Nog te spelen",
    icoon: "🟡",
    badgeClass: "bg-amber-900/40 text-amber-300",
  };
}

export function wedstrijdUitslagTekst(wedstrijd: Wedstrijd): string | null {
  if (!wedstrijd.gespeeld) return null;
  if (wedstrijd.bye) return `${wedstrijd.speler1} — bye`;
  return `${wedstrijd.speler1} ${wedstrijd.score1} – ${wedstrijd.score2} ${wedstrijd.speler2}`;
}

export function groepeerBordenInRondes(borden: Bord[]): BordRondes {
  return {
    poule: borden.filter(isPouleBord),
    winnaarsronde: borden.filter((bord) => bord.fase === "winnaarsronde"),
    verliezersronde: borden.filter((bord) => bord.fase === "verliezersronde"),
  };
}

export function actieveBordNamen(borden: Bord[]): string[] {
  return borden.map((bord) => bord.naam);
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
