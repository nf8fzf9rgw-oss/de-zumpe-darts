import { describe, expect, it } from "vitest";
import {
  berekenOpenbareEindtijd,
  bestuurBeheerLabels,
  isOpenbarePeriodeActief,
  moetNieuweOpenbareSessieStarten,
  zorgVoorOpenbaarVenster,
} from "@/lib/avond-status";
import { maakWedstrijd } from "@/lib/competition";
import { avondWeergaveStatus } from "@/lib/wedstrijd-overzicht";
import type { Bord, Speelavond } from "@/types/competition";

/** Vrijdag 11 september 2026, 20:00 Europe/Amsterdam (CEST). */
const VRIJDAG_2000 = new Date("2026-09-11T18:00:00.000Z");
/** Zaterdag 03:00 Amsterdam. */
const ZATERDAG_0300 = new Date("2026-09-12T01:00:00.000Z");
/** Zaterdag 07:00 Amsterdam — openbare eindtijd. */
const ZATERDAG_0700 = new Date("2026-09-12T05:00:00.000Z");
const ZATERDAG_0701 = new Date("2026-09-12T05:01:00.000Z");

function liveBord(): Bord {
  return {
    naam: "Bord 1",
    spelers: ["John Wolsheumer", "Nico Pas"],
    wedstrijden: [maakWedstrijd("John Wolsheumer", "Nico Pas")],
    status: "actief",
    fase: "poule",
  };
}

function avond(): Speelavond {
  return {
    datum: VRIJDAG_2000.toISOString(),
    seizoen: "2025-2026",
    aanwezigen: ["John Wolsheumer", "Nico Pas"],
    gasten: [],
    borden: [liveBord()],
    spelerVanDeAvond: null,
    aanmeldToken: null,
    gestartOp: VRIJDAG_2000.toISOString(),
    openbareEindtijd: ZATERDAG_0700.toISOString(),
  };
}

describe("openbare eindtijd zaterdag 07:00", () => {
  it("zet de eindtijd op zaterdag 07:00 Amsterdam na een vrijdagavond", () => {
    expect(berekenOpenbareEindtijd(VRIJDAG_2000).toISOString()).toBe(
      ZATERDAG_0700.toISOString()
    );
  });

  it("houdt zaterdag 03:00 binnen de openbare periode", () => {
    expect(isOpenbarePeriodeActief(avond(), ZATERDAG_0300)).toBe(true);
  });

  it("sluit de openbare status om 07:00 zonder gegevens te wissen", () => {
    const speelavond = avond();
    expect(isOpenbarePeriodeActief(speelavond, ZATERDAG_0700)).toBe(false);
    expect(speelavond.borden).toHaveLength(1);
    expect(speelavond.borden[0].wedstrijden).toHaveLength(1);
    expect(speelavond.aanwezigen).toEqual(["John Wolsheumer", "Nico Pas"]);
  });

  it("toont LIVE voor bezoekers tot 07:00 en daarna geen actieve speelavond", () => {
    const borden = [liveBord()];
    const venster = avond();

    expect(
      avondWeergaveStatus(borden, {
        ...venster,
        nu: ZATERDAG_0300,
        isBestuur: false,
      }).key
    ).toBe("live");

    expect(
      avondWeergaveStatus(borden, {
        ...venster,
        nu: ZATERDAG_0701,
        isBestuur: false,
      }).key
    ).toBe("geen_actieve_speelavond");
  });

  it("houdt de wedstrijdstatus LIVE voor het bestuur na 07:00", () => {
    const borden = [liveBord()];
    expect(
      avondWeergaveStatus(borden, {
        ...avond(),
        nu: ZATERDAG_0701,
        isBestuur: true,
      }).key
    ).toBe("live");
  });

  it("markeert het bestuursoverzicht als verlopen maar bewaard", () => {
    expect(bestuurBeheerLabels(avond(), ZATERDAG_0701)).toEqual({
      openbaar: "VERLOPEN",
      gegevens: "BEWAARD",
      bestuur: "KAN AANPASSEN",
    });
  });

  it("start na 07:00 een nieuwe openbare sessie in plaats van de oude te overschrijven", () => {
    expect(moetNieuweOpenbareSessieStarten(avond(), ZATERDAG_0701)).toBe(true);
    expect(moetNieuweOpenbareSessieStarten(avond(), ZATERDAG_0300)).toBe(false);
  });

  it("vult ontbrekende eindtijd uit de starttijd en overschrijft bestaande gegevens niet", () => {
    const zonderEinde = {
      ...avond(),
      openbareEindtijd: undefined,
    };
    const aangevuld = zorgVoorOpenbaarVenster(zonderEinde, ZATERDAG_0300);
    expect(aangevuld.openbareEindtijd).toBe(ZATERDAG_0700.toISOString());
    expect(aangevuld.borden).toEqual(zonderEinde.borden);
    expect(aangevuld.aanwezigen).toEqual(zonderEinde.aanwezigen);
  });
});
