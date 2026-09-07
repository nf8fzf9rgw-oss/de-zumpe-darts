/**
 * Alias-mapping van oude/afwijkende schrijfwijzen naar de officiële
 * displaynaam uit de tussenstand 15-08-2026.
 * Matching is case-insensitive via normaliseerNaamKey.
 */
export const SPELER_NAAM_ALIASES: Record<string, string> = {
  "john wolsheumer": "John Wolsheumer",
  "john wolsheimer": "John Wolsheumer",
  "toon te kamp": "Toon te Kamp",
  "toon ten kamp": "Toon te Kamp",
  "ronnie kijvekamp": "Ronnie Kijvekamp",
  "ronnie kivekamp": "Ronnie Kijvekamp",
  "ervin smit": "Erwin Smit",
  "erwin smit": "Erwin Smit",
  "advin gras": "Adwin Gras",
  "adwin gras": "Adwin Gras",
  "adwin graas": "Adwin Gras",
  "timme jensink": "Timme Lensink",
  "timme lensink": "Timme Lensink",
  "gilliam kempers": "Gilliam Kempers",
  "gillian kempers": "Gilliam Kempers",
  "rocco meerbeek": "Rocco Meerbeek",
  "bjorn schoenakker": "Bjorn Schoenakker",
  "sem riethorst": "Sem Riethorst",
  "johan zaaijer": "Johan Zaaijer",
  "mario van til": "Mario v Til",
  "mario v. til": "Mario v Til",
  "mario v til": "Mario v Til",
};

export function normaliseerNaamKey(naam: string): string {
  return naam.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Zet een naam om naar de canonieke club-displaynaam indien bekend. */
export function canoniekeSpelerNaam(naam: string): string {
  const getrimd = naam.trim().replace(/\s+/g, " ");
  if (!getrimd) return getrimd;
  return SPELER_NAAM_ALIASES[normaliseerNaamKey(getrimd)] ?? getrimd;
}

export function namenZijnGelijk(a: string, b: string): boolean {
  return normaliseerNaamKey(canoniekeSpelerNaam(a)) ===
    normaliseerNaamKey(canoniekeSpelerNaam(b));
}
