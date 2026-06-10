import type { Speelavond } from "@/types/competition";

const SPEELAVOND_KEY = "deZumpeSpeelavond";
const HISTORIE_KEY = "deZumpeHistorie";

export function formatDatum(datum: string): string {
  if (!datum) return "Nog niet opgeslagen";
  const parsed = new Date(datum);
  if (Number.isNaN(parsed.getTime())) return datum;
  return parsed.toLocaleString("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDatumKort(datum: string): string {
  if (!datum) return "-";
  const parsed = new Date(datum);
  if (Number.isNaN(parsed.getTime())) return datum;
  return parsed.toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "2-digit",
  });
}

export function formatDatumAlleen(datum: string): string {
  if (!datum) return new Date().toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const parsed = new Date(datum);
  if (Number.isNaN(parsed.getTime())) return datum;
  return parsed.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function maakHuidigeDatum(): string {
  return new Date().toISOString();
}

export function laadSpeelavond(): Speelavond | null {
  if (typeof window === "undefined") return null;

  const opgeslagen = localStorage.getItem(SPEELAVOND_KEY);
  if (!opgeslagen) return null;

  try {
    return JSON.parse(opgeslagen) as Speelavond;
  } catch {
    localStorage.removeItem(SPEELAVOND_KEY);
    return null;
  }
}

export function slaSpeelavondOp(avond: Speelavond): void {
  localStorage.setItem(SPEELAVOND_KEY, JSON.stringify(avond));
}

export function verwijderSpeelavond(): void {
  localStorage.removeItem(SPEELAVOND_KEY);
}

export function laadHistorie(): Speelavond[] {
  if (typeof window === "undefined") return [];

  const opgeslagen = localStorage.getItem(HISTORIE_KEY);
  if (!opgeslagen) return [];

  try {
    const data = JSON.parse(opgeslagen) as Speelavond[];
    return Array.isArray(data) ? data : [];
  } catch {
    localStorage.removeItem(HISTORIE_KEY);
    return [];
  }
}

export function slaHistorieOp(historie: Speelavond[]): void {
  localStorage.setItem(HISTORIE_KEY, JSON.stringify(historie));
}

export function voegToeAanHistorie(avond: Speelavond): void {
  const historie = laadHistorie();
  const index = historie.findIndex((item) => item.datum === avond.datum);
  if (index >= 0) {
    const bijgewerkt = [...historie];
    bijgewerkt[index] = avond;
    slaHistorieOp(bijgewerkt);
  } else {
    slaHistorieOp([...historie, avond]);
  }
}

export function verwijderUitHistorie(datum: string): void {
  const historie = laadHistorie().filter((item) => item.datum !== datum);
  slaHistorieOp(historie);
}

export function maakLegeSpeelavond(): Speelavond {
  return {
    datum: "",
    aanwezigen: [],
    gasten: [],
    borden: [],
  };
}
