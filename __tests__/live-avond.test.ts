import { describe, expect, it } from "vitest";
import { maakWedstrijd } from "@/lib/competition";
import {
  gebruikteBorden,
  laatsteUitslagenPerBord,
  liveBordKaarten,
  waarMoetIkSpelen,
} from "@/lib/live";
import { maakLaatsteUitslagenBericht } from "@/lib/whatsapp";
import type { Bord, Wedstrijd } from "@/types/competition";

function bord(
  naam: string,
  spelers: string[],
  wedstrijden: Wedstrijd[]
): Bord {
  return {
    naam,
    spelers,
    wedstrijden,
    status: "actief",
    fase: "poule",
  };
}

function gespeeld(
  speler1: string,
  speler2: string,
  score1: number,
  score2: number
): Wedstrijd {
  return {
    ...maakWedstrijd(speler1, speler2),
    gespeeld: true,
    score1,
    score2,
    winnaar: score1 >= score2 ? speler1 : speler2,
  };
}

describe("gebruikte borden", () => {
  it("toont Bord 1 t/m 5 en verbergt een leeg Bord 6", () => {
    const borden = [
      bord("Bord 1", ["John Wolsheumer", "Nico Pas"], [
        maakWedstrijd("John Wolsheumer", "Nico Pas"),
      ]),
      bord("Bord 2", ["Rocco Meerbeek", "Toon te Kamp"], [
        maakWedstrijd("Rocco Meerbeek", "Toon te Kamp"),
      ]),
      bord("Bord 3", ["Speler A", "Speler B"], [
        maakWedstrijd("Speler A", "Speler B"),
      ]),
      bord("Bord 4", ["Speler C", "Speler D"], [
        maakWedstrijd("Speler C", "Speler D"),
      ]),
      bord("Bord 5", ["Speler E", "Speler F"], [
        maakWedstrijd("Speler E", "Speler F"),
      ]),
      bord("Bord 6", [], []),
    ];

    expect(gebruikteBorden(borden).map((item) => item.naam)).toEqual([
      "Bord 1",
      "Bord 2",
      "Bord 3",
      "Bord 4",
      "Bord 5",
    ]);
    expect(liveBordKaarten(borden).map((kaart) => kaart.bord.naam)).not.toContain(
      "Bord 6"
    );
  });

  it("toont Bord 6 wanneer dat bord echt gebruikt wordt", () => {
    const borden = [
      bord("Bord 1", ["A", "B"], [maakWedstrijd("A", "B")]),
      bord("Bord 2", ["C", "D"], [maakWedstrijd("C", "D")]),
      bord("Bord 3", ["E", "F"], [maakWedstrijd("E", "F")]),
      bord("Bord 4", ["G", "H"], [maakWedstrijd("G", "H")]),
      bord("Bord 5", ["I", "J"], [maakWedstrijd("I", "J")]),
      bord("Bord 6", ["K", "L"], [maakWedstrijd("K", "L")]),
    ];

    expect(gebruikteBorden(borden)).toHaveLength(6);
    expect(liveBordKaarten(borden).at(-1)?.bord.naam).toBe("Bord 6");
  });
});

describe("live status en laatste uitslagen", () => {
  it("onderscheidt LIVE, Afgerond en Wachten per bord", () => {
    const borden = [
      bord("Bord 1", ["John Wolsheumer", "Nico Pas"], [
        { ...maakWedstrijd("John Wolsheumer", "Nico Pas"), score1: 3, score2: 1 },
      ]),
      bord("Bord 2", ["Rocco Meerbeek", "Toon te Kamp"], [
        gespeeld("Rocco Meerbeek", "Toon te Kamp", 2, 3),
      ]),
      bord("Bord 3", ["Speler A", "Speler B"], [
        maakWedstrijd("Speler A", "Speler B"),
      ]),
    ];

    const kaarten = liveBordKaarten(borden);
    expect(kaarten[0].status.key).toBe("live");
    expect(kaarten[0].status.label).toBe("LIVE");
    expect(kaarten[1].status.key).toBe("gereed");
    expect(kaarten[1].status.label).toBe("Afgerond");
    expect(kaarten[2].status.key).toBe("wacht");
    expect(kaarten[2].status.label).toBe("Wachten");
  });

  it("toont alleen gespeelde wedstrijden als laatste uitslag", () => {
    const borden = [
      bord("Bord 1", ["John Wolsheumer", "Nico Pas"], [
        gespeeld("John Wolsheumer", "Nico Pas", 3, 1),
      ]),
      bord("Bord 2", ["Rocco Meerbeek", "Toon te Kamp"], [
        maakWedstrijd("Rocco Meerbeek", "Toon te Kamp"),
      ]),
      bord("Bord 3", ["Speler A", "Speler B"], [
        { ...maakWedstrijd("Speler A", "Speler B"), score1: 1 },
      ]),
    ];

    const uitslagen = laatsteUitslagenPerBord(borden);
    expect(uitslagen.map((item) => item.bordNaam)).toEqual(["Bord 1"]);
    expect(uitslagen[0].wedstrijd.score1).toBe(3);
    expect(uitslagen[0].wedstrijd.score2).toBe(1);
  });

  it("vindt waar een speler moet spelen zonder automatische selectie", () => {
    const borden = [
      bord("Bord 4", ["Rocco Meerbeek", "John Wolsheumer"], [
        maakWedstrijd("Rocco Meerbeek", "John Wolsheumer"),
      ]),
    ];

    expect(waarMoetIkSpelen(borden, "")).toBeNull();
    const rocco = waarMoetIkSpelen(borden, "Rocco Meerbeek");
    expect(rocco?.bordNaam).toBe("Bord 4");
    expect(rocco?.tegenstander).toBe("John Wolsheumer");
    expect(rocco?.status.key).toBe("wacht");
  });
});

describe("WhatsApp laatste uitslagen", () => {
  it("gebruikt actuele borden, spelers en scores", () => {
    const borden = [
      bord("Bord 1", ["John Wolsheumer", "Nico Pas"], [
        gespeeld("John Wolsheumer", "Nico Pas", 3, 1),
      ]),
      bord("Bord 2", ["Rocco Meerbeek", "Toon te Kamp"], [
        gespeeld("Rocco Meerbeek", "Toon te Kamp", 2, 3),
      ]),
      bord("Bord 6", [], []),
    ];

    const tekst = maakLaatsteUitslagenBericht(borden, {
      websiteUrl: "https://dezumpe.example",
      nu: new Date("2026-09-11T20:00:00"),
    });

    expect(tekst).toContain("🎯 DE ZUMPE");
    expect(tekst).toContain("🏆 Laatste uitslagen");
    expect(tekst).toContain("🎯 Bord 1");
    expect(tekst).toContain("John Wolsheumer 3 - 1 Nico Pas");
    expect(tekst).toContain("🎯 Bord 2");
    expect(tekst).toContain("Rocco Meerbeek 2 - 3 Toon te Kamp");
    expect(tekst).not.toContain("Bord 6");
    expect(tekst).toContain("Bekijk alle uitslagen:");
    expect(tekst).toContain("https://dezumpe.example/competitie");
  });

  it("toont na zaterdag 07:00 geen LIVE meer in de deeltekst", () => {
    const borden = [
      bord("Bord 1", ["John Wolsheumer", "Nico Pas"], [
        { ...maakWedstrijd("John Wolsheumer", "Nico Pas"), score1: 2, score2: 1 },
      ]),
    ];
    const tekst = maakLaatsteUitslagenBericht(borden, {
      websiteUrl: "https://dezumpe.example",
      gestartOp: "2026-09-11T18:00:00.000Z",
      openbareEindtijd: "2026-09-12T05:00:00.000Z",
      nu: new Date("2026-09-12T05:01:00.000Z"),
    });

    expect(tekst).not.toContain("🔴 LIVE");
    expect(tekst).toContain("Bekijk alle uitslagen:");
  });

  it("toont LIVE voor een wedstrijd die bezig is", () => {
    const borden = [
      bord("Bord 1", ["John Wolsheumer", "Nico Pas"], [
        { ...maakWedstrijd("John Wolsheumer", "Nico Pas"), score1: 2, score2: 1 },
      ]),
    ];

    const tekst = maakLaatsteUitslagenBericht(borden, {
      websiteUrl: "https://dezumpe.example",
    });

    expect(tekst).toContain("🔴 LIVE");
    expect(tekst).toContain("John Wolsheumer 2 - 1 Nico Pas");
    expect(tekst).toContain("LIVE");
    expect(tekst).not.toContain("🏆 Laatste uitslagen");
  });
});
