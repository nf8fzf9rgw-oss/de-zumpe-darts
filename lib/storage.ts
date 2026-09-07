import {
  heeftTeVeelBorden,
  hernoemSpelerInBorden,
  normaliseerSpeelavond,
} from "@/lib/competition";
import {
  CLUB_LEDEN_DEFAULT,
  laadLeden,
  normaliseerLedenLijst,
  slaLedenOp,
} from "@/lib/leden";
import { canoniekeSpelerNaam, namenZijnGelijk } from "@/lib/namen";
import {
  haalHuidigSeizoenId,
  haalSeizoenVanDatum,
  laadActiefSeizoen,
  slaActiefSeizoenOp,
} from "@/lib/seasons";
import {
  SPEELAVOND_DATA_VERSIE,
  type AanmeldSessie,
  type Speelavond,
  type ZumpeDataBackup,
} from "@/types/competition";

const SPEELAVOND_KEY = "deZumpeSpeelavond";
const HISTORIE_KEY = "deZumpeHistorie";
const AANMELD_KEY = "deZumpeAanmeld";
const BORDEN_MIGRATIE_KEY = "deZumpeBordenMigratie";
const NAMEN_MIGRATIE_KEY = "deZumpeNamenMigratieV2";

export function consumeBordenMigratieWaarschuwing(): boolean {
  if (typeof window === "undefined") return false;
  if (sessionStorage.getItem(BORDEN_MIGRATIE_KEY) !== "1") return false;
  sessionStorage.removeItem(BORDEN_MIGRATIE_KEY);
  return true;
}

function markeerBordenMigratie(): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(BORDEN_MIGRATIE_KEY, "1");
  }
}

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
    const raw = JSON.parse(opgeslagen) as Speelavond;
    const hadTeVeelBorden = heeftTeVeelBorden(raw.borden);
    const avond = normaliseerSpeelavond(raw);
    if (hadTeVeelBorden) {
      markeerBordenMigratie();
      localStorage.setItem(SPEELAVOND_KEY, JSON.stringify(avond));
    }
    return avond;
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
    if (!Array.isArray(data)) return [];
    const hadTeVeelBorden = data.some((avond) => heeftTeVeelBorden(avond.borden));
    const historie = data.map(normaliseerSpeelavond);
    if (hadTeVeelBorden) {
      slaHistorieOp(historie);
    }
    return historie;
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

export function hernoemSpelerInData(
  oudeNaam: string,
  nieuweNaam: string
): void {
  const mapNaam = (n: string) =>
    namenZijnGelijk(n, oudeNaam) ? nieuweNaam : n;

  const historie = laadHistorie().map((avond) =>
    normaliseerSpeelavond({
      ...avond,
      aanwezigen: avond.aanwezigen.map(mapNaam),
      gasten: avond.gasten.map(mapNaam),
      borden: hernoemSpelerInBorden(avond.borden, oudeNaam, nieuweNaam),
      spelerVanDeAvond:
        avond.spelerVanDeAvond && namenZijnGelijk(avond.spelerVanDeAvond, oudeNaam)
          ? nieuweNaam
          : avond.spelerVanDeAvond,
    })
  );
  slaHistorieOp(historie);

  const huidig = laadSpeelavond();
  if (huidig) {
    slaSpeelavondOp(
      normaliseerSpeelavond({
        ...huidig,
        aanwezigen: huidig.aanwezigen.map(mapNaam),
        gasten: huidig.gasten.map(mapNaam),
        borden: hernoemSpelerInBorden(huidig.borden, oudeNaam, nieuweNaam),
        spelerVanDeAvond:
          huidig.spelerVanDeAvond &&
          namenZijnGelijk(huidig.spelerVanDeAvond, oudeNaam)
            ? nieuweNaam
            : huidig.spelerVanDeAvond,
      })
    );
  }
}

/**
 * Corrigeert spelerspelling naar de officiële tussenstand en
 * voorkomt dubbele leden door afwijkende schrijfwijzen.
 */
export function migreerOfficieleSpelersnamen(): string[] {
  if (typeof window === "undefined") return normaliseerLedenLijst(laadLeden());

  const raw = localStorage.getItem("deZumpeLeden");
  let opgeslagenNamen: string[] = [];
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed)) opgeslagenNamen = parsed;
    } catch {
      opgeslagenNamen = [];
    }
  }

  const bronNamen =
    opgeslagenNamen.length > 0 ? opgeslagenNamen : [...CLUB_LEDEN_DEFAULT];

  const alGemigreerd = localStorage.getItem(NAMEN_MIGRATIE_KEY) === "1";
  if (!alGemigreerd) {
    const hernoemingen = new Map<string, string>();
    for (const oud of bronNamen) {
      const nieuw = canoniekeSpelerNaam(oud);
      if (oud !== nieuw) {
        hernoemingen.set(oud, nieuw);
      }
    }
    hernoemingen.forEach((nieuw, oud) => {
      hernoemSpelerInData(oud, nieuw);
    });
    localStorage.setItem(NAMEN_MIGRATIE_KEY, "1");
  }

  const gemigreerd = normaliseerLedenLijst(
    bronNamen.map((n) => canoniekeSpelerNaam(n))
  );
  slaLedenOp(gemigreerd);
  return gemigreerd;
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
    versie: SPEELAVOND_DATA_VERSIE,
  };
}

export function exportDataBackup(): ZumpeDataBackup {
  return {
    versie: SPEELAVOND_DATA_VERSIE,
    geexporteerd: new Date().toISOString(),
    speelavond: laadSpeelavond(),
    historie: laadHistorie(),
    leden: laadLeden(),
    actiefSeizoen: laadActiefSeizoen(),
  };
}

export function importDataBackup(
  backup: ZumpeDataBackup
): { success: boolean; error?: string } {
  if (!backup || typeof backup !== "object") {
    return { success: false, error: "Ongeldig backupbestand." };
  }
  if (backup.versie !== SPEELAVOND_DATA_VERSIE) {
    return {
      success: false,
      error: `Onbekende backupversie (${backup.versie}). Verwacht versie ${SPEELAVOND_DATA_VERSIE}.`,
    };
  }
  if (!Array.isArray(backup.historie) || !Array.isArray(backup.leden)) {
    return { success: false, error: "Backup mist historie of leden." };
  }

  slaHistorieOp(backup.historie);
  slaLedenOp(backup.leden);
  slaActiefSeizoenOp(backup.actiefSeizoen);

  if (backup.speelavond) {
    slaSpeelavondOp(backup.speelavond);
  } else {
    verwijderSpeelavond();
  }

  return { success: true };
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
