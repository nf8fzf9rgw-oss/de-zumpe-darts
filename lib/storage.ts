import { normaliseerSpeelavond } from "@/lib/competition";
import { haalHuidigSeizoenId, haalSeizoenVanDatum } from "@/lib/seasons";
import type { AanmeldSessie, Speelavond } from "@/types/competition";

const SPEELAVOND_KEY = "deZumpeSpeelavond";
const HISTORIE_KEY = "deZumpeHistorie";
const AANMELD_KEY = "deZumpeAanmeld";

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
  if (!datum)
    return new Date().toLocaleDateString("nl-NL", {
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

export function genereerAanmeldToken(): string {
  return crypto.randomUUID().slice(0, 8);
}

export function laadSpeelavond(): Speelavond | null {
  if (typeof window === "undefined") return null;
  const opgeslagen = localStorage.getItem(SPEELAVOND_KEY);
  if (!opgeslagen) return null;
  try {
    return normaliseerSpeelavond(JSON.parse(opgeslagen) as Speelavond);
  } catch {
    localStorage.removeItem(SPEELAVOND_KEY);
    return null;
  }
}

export function slaSpeelavondOp(avond: Speelavond): void {
  localStorage.setItem(SPEELAVOND_KEY, JSON.stringify(normaliseerSpeelavond(avond)));
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
    return Array.isArray(data) ? data.map(normaliseerSpeelavond) : [];
  } catch {
    localStorage.removeItem(HISTORIE_KEY);
    return [];
  }
}

export function slaHistorieOp(historie: Speelavond[]): void {
  localStorage.setItem(
    HISTORIE_KEY,
    JSON.stringify(historie.map(normaliseerSpeelavond))
  );
}

export function voegToeAanHistorie(avond: Speelavond): void {
  const genormaliseerd = normaliseerSpeelavond(avond);
  const historie = laadHistorie();
  const index = historie.findIndex((item) => item.datum === genormaliseerd.datum);
  if (index >= 0) {
    const bijgewerkt = [...historie];
    bijgewerkt[index] = genormaliseerd;
    slaHistorieOp(bijgewerkt);
  } else {
    slaHistorieOp([...historie, genormaliseerd]);
  }
}

export function verwijderUitHistorie(datum: string): void {
  slaHistorieOp(laadHistorie().filter((item) => item.datum !== datum));
}

export function maakLegeSpeelavond(seizoen?: string): Speelavond {
  return {
    datum: "",
    seizoen: seizoen ?? haalHuidigSeizoenId(),
    aanwezigen: [],
    gasten: [],
    borden: [],
    spelerVanDeAvond: null,
    aanmeldToken: null,
  };
}

export function laadAanmeldSessie(): AanmeldSessie | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AANMELD_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AanmeldSessie;
  } catch {
    return null;
  }
}

export function slaAanmeldSessieOp(sessie: AanmeldSessie): void {
  localStorage.setItem(AANMELD_KEY, JSON.stringify(sessie));
}

export function verwijderAanmeldSessie(): void {
  localStorage.removeItem(AANMELD_KEY);
}

export function haalSeizoenVanAvond(avond: Speelavond): string {
  return avond.seizoen ?? haalSeizoenVanDatum(avond.datum);
}
