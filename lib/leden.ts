export const CLUB_LEDEN_DEFAULT = [
  "John Wolsheumer",
  "Nico Pas",
  "Toon te Kamp",
  "Ronnie Kijvekamp",
  "Jasper Kempers",
  "Marco Thijssen",
  "Rinaldo Lenting",
  "Rocco Meerbeek",
  "Willem Thijssen",
  "Raymond Horst",
  "Mario v Til",
  "Ervin Smit",
  "Bob Smit",
  "Eddy de Jode",
  "Muppet",
  "Dennis van het Hof",
  "Advin Gras",
  "Luca Schopema",
  "Frans Spronk",
  "Timme Jensink",
  "Gilliam Kempers",
  "Ryan Meerbeek",
  "Erik van Rhijn",
  "Rene Lippets",
  "Mike Thijssen",
  "Rick Hiddink",
  "Sjangie Verbeuken",
  "Ian Wagner",
  "Henk Hubers",
  "Arno Vermeer",
  "Daniel Spaink",
] as const;

/** @deprecated Gebruik laadLeden() */
export const CLUB_LEDEN = CLUB_LEDEN_DEFAULT;

const LEDEN_KEY = "deZumpeLeden";

export function laadLeden(): string[] {
  if (typeof window === "undefined") return [...CLUB_LEDEN_DEFAULT];

  const opgeslagen = localStorage.getItem(LEDEN_KEY);
  if (!opgeslagen) return [...CLUB_LEDEN_DEFAULT];

  try {
    const data = JSON.parse(opgeslagen) as string[];
    return Array.isArray(data) && data.length > 0 ? data : [...CLUB_LEDEN_DEFAULT];
  } catch {
    return [...CLUB_LEDEN_DEFAULT];
  }
}

export function slaLedenOp(leden: string[]): void {
  localStorage.setItem(LEDEN_KEY, JSON.stringify(leden));
}

export function voegLidToe(naam: string, huidigeLeden: string[]): string[] {
  const getrimd = naam.trim();
  if (!getrimd || huidigeLeden.includes(getrimd)) return huidigeLeden;
  const nieuw = [...huidigeLeden, getrimd].sort((a, b) =>
    a.localeCompare(b, "nl")
  );
  slaLedenOp(nieuw);
  return nieuw;
}

export function hernoemLid(
  oudeNaam: string,
  nieuweNaam: string,
  huidigeLeden: string[]
): string[] {
  const getrimd = nieuweNaam.trim();
  if (!getrimd || getrimd === oudeNaam) return huidigeLeden;
  const nieuw = huidigeLeden
    .map((lid) => (lid === oudeNaam ? getrimd : lid))
    .sort((a, b) => a.localeCompare(b, "nl"));
  slaLedenOp(nieuw);
  return nieuw;
}

export function verwijderLid(naam: string, huidigeLeden: string[]): string[] {
  const nieuw = huidigeLeden.filter((lid) => lid !== naam);
  slaLedenOp(nieuw);
  return nieuw;
}
