import type { Bord, Speelavond } from "@/types/competition";

export const ZUMPE_TIJDZONE = "Europe/Amsterdam";
export const OPENBARE_EIND_WEEKDAG = 6;
export const OPENBARE_EIND_UUR = 7;

export interface OpenbaarVenster {
  gestartOp?: string | null;
  openbareEindtijd?: string | null;
  datum?: string | null;
  borden?: Bord[];
}

const WEEKDAGEN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function deel(date: Date, type: Intl.DateTimeFormatPartTypes): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ZUMPE_TIJDZONE,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return parts.find((part) => part.type === type)?.value ?? "";
}

export function amsterdamWeekday(date: Date): number {
  return WEEKDAGEN.indexOf(
    deel(date, "weekday") as (typeof WEEKDAGEN)[number]
  );
}

function amsterdamOffsetMs(date: Date): number {
  const asUtc = Date.UTC(
    Number(deel(date, "year")),
    Number(deel(date, "month")) - 1,
    Number(deel(date, "day")),
    Number(deel(date, "hour")),
    Number(deel(date, "minute")),
    Number(deel(date, "second"))
  );
  return asUtc - date.getTime();
}

export function amsterdamTijdNaarUtc(
  jaar: number,
  maand: number,
  dag: number,
  uur: number,
  minuut = 0
): Date {
  const utcGuess = Date.UTC(jaar, maand - 1, dag, uur, minuut, 0);
  let date = new Date(utcGuess);
  const offset = amsterdamOffsetMs(date);
  date = new Date(utcGuess - offset);
  const gecorrigeerd = amsterdamOffsetMs(date);
  if (gecorrigeerd !== offset) {
    date = new Date(utcGuess - gecorrigeerd);
  }
  return date;
}

function voegKalenderdagenToe(
  jaar: number,
  maand: number,
  dag: number,
  dagen: number
): { jaar: number; maand: number; dag: number } {
  const verschoven = new Date(Date.UTC(jaar, maand - 1, dag + dagen));
  return {
    jaar: verschoven.getUTCFullYear(),
    maand: verschoven.getUTCMonth() + 1,
    dag: verschoven.getUTCDate(),
  };
}

/**
 * Maximale openbare periode: de zaterdag 07:00 na de vrijdagavond.
 * Dit is een weergavereegel. Er wordt niets verwijderd of afgesloten.
 */
export function berekenOpenbareEindtijd(gestartOp: Date): Date {
  const jaar = Number(deel(gestartOp, "year"));
  const maand = Number(deel(gestartOp, "month"));
  const dag = Number(deel(gestartOp, "day"));
  const weekdag = amsterdamWeekday(gestartOp);
  const dagenTotZaterdag = (OPENBARE_EIND_WEEKDAG - weekdag + 7) % 7;
  const eind = voegKalenderdagenToe(jaar, maand, dag, dagenTotZaterdag);
  return amsterdamTijdNaarUtc(
    eind.jaar,
    eind.maand,
    eind.dag,
    OPENBARE_EIND_UUR
  );
}

function parseIso(waarde?: string | null): Date | null {
  if (!waarde) return null;
  const parsed = new Date(waarde);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function startmomentVanVenster(venster: OpenbaarVenster): Date | null {
  return (
    parseIso(venster.gestartOp) ??
    parseIso(venster.datum) ??
    null
  );
}

export function openbareEindtijdVanVenster(
  venster: OpenbaarVenster
): Date | null {
  const opgeslagen = parseIso(venster.openbareEindtijd);
  if (opgeslagen) return opgeslagen;
  const start = startmomentVanVenster(venster);
  return start ? berekenOpenbareEindtijd(start) : null;
}

export function isOpenbarePeriodeActief(
  venster: OpenbaarVenster,
  nu = new Date()
): boolean {
  const eind = openbareEindtijdVanVenster(venster);
  if (!eind) return Boolean(venster.borden && venster.borden.length > 0);
  return nu.getTime() < eind.getTime();
}

export function heeftSpeelavondGegevens(avond: Pick<
  Speelavond,
  "aanwezigen" | "gasten" | "borden" | "notities"
>): boolean {
  return (
    avond.aanwezigen.length > 0 ||
    avond.gasten.length > 0 ||
    avond.borden.length > 0 ||
    Boolean(avond.notities?.trim())
  );
}

export function moetNieuweOpenbareSessieStarten(
  venster: OpenbaarVenster,
  nu = new Date()
): boolean {
  const heeftAvond =
    Boolean(venster.gestartOp) ||
    Boolean(venster.datum) ||
    Boolean(venster.borden && venster.borden.length > 0);
  return heeftAvond && !isOpenbarePeriodeActief(venster, nu);
}

export function zorgVoorOpenbaarVenster(
  avond: Speelavond,
  nu = new Date()
): Speelavond {
  const start =
    parseIso(avond.gestartOp) ??
    parseIso(avond.datum) ??
    (avond.borden.length > 0 ? nu : null);
  if (!start) return avond;
  return {
    ...avond,
    datum: avond.datum || start.toISOString(),
    gestartOp: avond.gestartOp ?? start.toISOString(),
    openbareEindtijd:
      avond.openbareEindtijd ?? berekenOpenbareEindtijd(start).toISOString(),
  };
}

export function nieuwOpenbaarVenster(nu = new Date()): {
  gestartOp: string;
  openbareEindtijd: string;
  datum: string;
} {
  const gestartOp = nu.toISOString();
  return {
    gestartOp,
    datum: gestartOp,
    openbareEindtijd: berekenOpenbareEindtijd(nu).toISOString(),
  };
}

export function bestuurBeheerLabels(
  venster: OpenbaarVenster,
  nu = new Date()
): {
  openbaar: "ACTIEF" | "VERLOPEN" | "GEEN";
  gegevens: "BEWAARD";
  bestuur: "KAN AANPASSEN";
} {
  const heeftGegevens = Boolean(
    venster.borden && venster.borden.length > 0
  ) || Boolean(startmomentVanVenster(venster));
  if (!heeftGegevens) {
    return { openbaar: "GEEN", gegevens: "BEWAARD", bestuur: "KAN AANPASSEN" };
  }
  return {
    openbaar: isOpenbarePeriodeActief(venster, nu) ? "ACTIEF" : "VERLOPEN",
    gegevens: "BEWAARD",
    bestuur: "KAN AANPASSEN",
  };
}
