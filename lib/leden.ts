import { canoniekeSpelerNaam, normaliseerNaamKey } from "@/lib/namen";
import { OFFICIELE_TUSSENSTAND_2025_2026 } from "@/lib/historische-tussenstand";

export const CLUB_LEDEN_DEFAULT = [
  "John Wolsheumer",
  "Nico Pas",
  "Toon te Kamp",
  "Ronnie Kijvekamp",
  "Rinaldo Lenting",
  "Jasper Kempers",
  "Marco Thijssen",
  "Willem Thijssen",
  "Rocco Meerbeek",
  "Luca Schopema",
  "Raymond Horst",
  "Mario v Til",
  "Bob Smit",
  "Dennis van het Hof",
  "Eddy de Jode",
  "Frans Spronk",
  "Muppet",
  "Timme Lensink",
  "Erwin Smit",
  "Gilliam Kempers",
  "Adwin Gras",
  "Rene Lippets",
  "Sjangie Verbeuken",
  "Mike Thijssen",
  "Rick Hiddink",
  "Ian Wagner",
  "Henk Hubers",
  "Bjorn Schoenakker",
  "Daniel Spaink",
  "Arno Vermeer",
  "Sem Riethorst",
  "Johan Zaaijer",
  "Ryan Meerbeek",
  "Erik van Rhijn",
] as const;

/** @deprecated Gebruik laadLeden() */
export const CLUB_LEDEN = CLUB_LEDEN_DEFAULT;

const LEDEN_KEY = "deZumpeLeden";

export function uniekeLeden(namen: string[]): string[] {
  const gezien = new Set<string>();
  const resultaat: string[] = [];

  for (const naam of namen) {
    const canoniek = canoniekeSpelerNaam(naam);
    const key = normaliseerNaamKey(canoniek);
    if (gezien.has(key)) continue;
    gezien.add(key);
    resultaat.push(canoniek);
  }

  return resultaat.sort((a, b) => a.localeCompare(b, "nl"));
}

export function voegOntbrekendeOfficieleLedenToe(leden: string[]): string[] {
  const bestaande = new Set(leden.map((n) => normaliseerNaamKey(n)));
  const aangevuld = [...leden];

  for (const speler of OFFICIELE_TUSSENSTAND_2025_2026.spelers) {
    const key = normaliseerNaamKey(speler.naam);
    if (!bestaande.has(key)) {
      aangevuld.push(speler.naam);
      bestaande.add(key);
    }
  }

  return uniekeLeden(aangevuld);
}

/** Normaliseert een ledenlijst zonder localStorage te schrijven. */
export function normaliseerLedenLijst(leden: string[]): string[] {
  return voegOntbrekendeOfficieleLedenToe(uniekeLeden(leden));
}

export function laadLeden(): string[] {
  if (typeof window === "undefined") return [...CLUB_LEDEN_DEFAULT];

  const opgeslagen = localStorage.getItem(LEDEN_KEY);
  let basis: string[];

  if (!opgeslagen) {
    basis = [...CLUB_LEDEN_DEFAULT];
  } else {
    try {
      const data = JSON.parse(opgeslagen) as string[];
      basis =
        Array.isArray(data) && data.length > 0
          ? data
          : [...CLUB_LEDEN_DEFAULT];
    } catch {
      basis = [...CLUB_LEDEN_DEFAULT];
    }
  }

  return normaliseerLedenLijst(basis);
}

export function slaLedenOp(leden: string[]): void {
  localStorage.setItem(LEDEN_KEY, JSON.stringify(uniekeLeden(leden)));
}

export function voegLidToe(naam: string, huidigeLeden: string[]): string[] {
  const getrimd = canoniekeSpelerNaam(naam);
  if (!getrimd) return huidigeLeden;
  if (
    huidigeLeden.some(
      (lid) => normaliseerNaamKey(lid) === normaliseerNaamKey(getrimd)
    )
  ) {
    return huidigeLeden;
  }
  const nieuw = uniekeLeden([...huidigeLeden, getrimd]);
  slaLedenOp(nieuw);
  return nieuw;
}

export function hernoemLid(
  oudeNaam: string,
  nieuweNaam: string,
  huidigeLeden: string[]
): string[] {
  const getrimd = canoniekeSpelerNaam(nieuweNaam);
  if (!getrimd || getrimd === oudeNaam) return huidigeLeden;
  const nieuw = uniekeLeden(
    huidigeLeden.map((lid) => (lid === oudeNaam ? getrimd : lid))
  );
  slaLedenOp(nieuw);
  return nieuw;
}

export function verwijderLid(naam: string, huidigeLeden: string[]): string[] {
  const nieuw = huidigeLeden.filter((lid) => lid !== naam);
  slaLedenOp(nieuw);
  return nieuw;
}
