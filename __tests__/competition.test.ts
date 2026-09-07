import { describe, expect, it } from "vitest";
import {
  berekenBordVerdeling,
  bepaalWinnaar,
  genereerCompetitie,
  genereerRoundRobin,
  MAX_BORDEN_PER_AVOND,
  MAX_SPELERS_PER_AVOND,
  MAX_SPELERS_PER_BORD,
  MIN_SPELERS_PER_BORD,
  normaliseerSpeelavond,
  updateWedstrijdInBord,
} from "@/lib/competition";
import type { Bord, Speelavond } from "@/types/competition";
import { pasAvondLimietToe } from "@/lib/avond-limiet";
import { berekenStand } from "@/lib/standings";
import { PUNTEN_PER_WINST } from "@/lib/scoring";
import { genereerWinnaarsVerliezersRonde } from "@/lib/knockout";
import { OFFICIELE_TUSSENSTAND_2025_2026 } from "@/lib/historische-tussenstand";
import { CLUB_LEDEN_DEFAULT } from "@/lib/leden";
import { canoniekeSpelerNaam } from "@/lib/namen";

describe("berekenBordVerdeling", () => {
  const verwachteVerdelingen: [number, number[]][] = [
    [3, [3]],
    [4, [4]],
    [5, [5]],
    [6, [3, 3]],
    [7, [4, 3]],
    [8, [4, 4]],
    [9, [3, 3, 3]],
    [10, [4, 3, 3]],
    [11, [4, 4, 3]],
    [12, [4, 4, 4]],
    [13, [4, 3, 3, 3]],
    [14, [4, 4, 3, 3]],
    [15, [4, 4, 4, 3]],
    [16, [4, 4, 4, 4]],
    [17, [4, 4, 3, 3, 3]],
    [18, [4, 4, 4, 3, 3]],
    [19, [4, 4, 4, 4, 3]],
    [20, [4, 4, 4, 4, 4]],
    [21, [4, 4, 4, 3, 3, 3]],
    [22, [4, 4, 4, 4, 3, 3]],
    [23, [4, 4, 4, 4, 4, 3]],
    [24, [4, 4, 4, 4, 4, 4]],
    [25, [5, 4, 4, 4, 4, 4]],
    [26, [5, 5, 4, 4, 4, 4]],
    [27, [5, 5, 5, 4, 4, 4]],
    [28, [5, 5, 5, 5, 4, 4]],
    [29, [5, 5, 5, 5, 5, 4]],
    [30, [5, 5, 5, 5, 5, 5]],
  ];

  it.each(verwachteVerdelingen)(
    "verdeelt %i spelers als %j",
    (aantalSpelers, verwacht) => {
      expect(berekenBordVerdeling(aantalSpelers)).toEqual(verwacht);
    }
  );

  it("opent Bord 6 pas vanaf 21 spelers", () => {
    for (let n = 3; n <= 20; n += 1) {
      expect(berekenBordVerdeling(n)!.length).toBeLessThanOrEqual(5);
    }
    for (let n = 21; n <= 30; n += 1) {
      expect(berekenBordVerdeling(n)!.length).toBe(6);
    }
  });

  it("exporteert board-limieten", () => {
    expect(MIN_SPELERS_PER_BORD).toBe(3);
    expect(MAX_SPELERS_PER_BORD).toBe(7);
    expect(MAX_BORDEN_PER_AVOND).toBe(6);
    expect(MAX_SPELERS_PER_AVOND).toBe(30);
  });

  it("weigert meer dan 42 spelers (6 borden × 7 spelers)", () => {
    expect(berekenBordVerdeling(43)).toBeNull();
  });

  it("weigert te weinig spelers", () => {
    expect(berekenBordVerdeling(2)).toBeNull();
  });
});

describe("genereerRoundRobin", () => {
  it("maakt alle paren voor 4 spelers", () => {
    const wedstrijden = genereerRoundRobin(["A", "B", "C", "D"]);
    expect(wedstrijden).toHaveLength(6);
  });
});

describe("genereerCompetitie", () => {
  it("is deterministisch met seed", () => {
    const spelers = Array.from({ length: 12 }, (_, i) => `Speler ${i + 1}`);
    const a = genereerCompetitie(spelers, [], 42);
    const b = genereerCompetitie(spelers, [], 42);
    expect(a!.map((bord) => bord.spelers)).toEqual(b!.map((bord) => bord.spelers));
  });

  it("maakt nooit meer dan MAX_BORDEN_PER_AVOND borden", () => {
    const maxGenerator = MAX_BORDEN_PER_AVOND * MAX_SPELERS_PER_BORD;
    for (let n = 3; n <= maxGenerator; n += 1) {
      const spelers = Array.from({ length: n }, (_, i) => `Speler ${i + 1}`);
      const borden = genereerCompetitie(spelers, [], 1);
      if (borden) {
        expect(borden.length).toBeLessThanOrEqual(MAX_BORDEN_PER_AVOND);
      }
    }
  });
});

describe("normaliseerSpeelavond", () => {
  function maakBord(n: number): Bord {
    const spelers = Array.from({ length: 4 }, (_, i) => `S${n}-${i + 1}`);
    return {
      naam: `Bord ${n}`,
      spelers,
      wedstrijden: genereerRoundRobin(spelers),
      status: "wachtend",
    };
  }

  it("wist borden bij meer dan MAX_BORDEN_PER_AVOND (oude localStorage)", () => {
    const avond: Speelavond = {
      datum: "2024-01-01T00:00:00.000Z",
      seizoen: "2024",
      aanwezigen: [],
      gasten: [],
      borden: Array.from({ length: 8 }, (_, i) => maakBord(i + 1)),
      spelerVanDeAvond: "Speler 1",
      aanmeldToken: null,
      versie: 1,
    };

    const genormaliseerd = normaliseerSpeelavond(avond);
    expect(genormaliseerd.borden).toEqual([]);
    expect(genormaliseerd.spelerVanDeAvond).toBeNull();
  });

  it("behoudt geldige borden", () => {
    const borden = Array.from({ length: 3 }, (_, i) => maakBord(i + 1));
    const avond: Speelavond = {
      datum: "2024-01-01T00:00:00.000Z",
      seizoen: "2024",
      aanwezigen: [],
      gasten: [],
      borden,
      spelerVanDeAvond: null,
      aanmeldToken: null,
      versie: 1,
    };

    const genormaliseerd = normaliseerSpeelavond(avond);
    expect(genormaliseerd.borden).toHaveLength(3);
  });
});

describe("bepaalWinnaar", () => {
  it("detecteert gelijkspel", () => {
    expect(bepaalWinnaar("A", "B", 3, 3)).toEqual({
      winnaar: null,
      gelijkspel: true,
    });
  });
});

describe("berekenStand", () => {
  it("kent winstpunten toe", () => {
    const borden = genereerCompetitie(
      ["Alice", "Bob", "Carol"],
      [],
      1
    )!;
    const wedstrijd = borden[0].wedstrijden.find(
      (w) => w.speler1 === "Alice" || w.speler2 === "Alice"
    )!;
    borden[0] = updateWedstrijdInBord(borden[0], wedstrijd.id, {
      gespeeld: true,
      score1: wedstrijd.speler1 === "Alice" ? 3 : 1,
      score2: wedstrijd.speler2 === "Alice" ? 3 : 1,
    });

    const stand = berekenStand([], borden);
    const alice = stand.find((s) => s.naam === "Alice");
    expect(alice?.competitiepunten).toBe(PUNTEN_PER_WINST);
  });
});

describe("foto tussenstand 15-08-2026", () => {
  // Exact overgenomen uit de foto: naam, aanwezig, poulepunten,
  // winnaarsronde legs gewonnen/verloren, verliezersronde legs
  // gewonnen/verloren, hoogste uitgooi, aantal 180, punten totaal.
  const foto: [string, number, number, number, number, number, number, number, number, number][] = [
    ["John Wolsheumer", 30, 117, 295, 82, 0, 0, 145, 77, 599],
    ["Nico Pas", 32, 105, 166, 112, 13, 3, 121, 10, 338.5],
    ["Toon te Kamp", 23, 85, 117, 88, 7, 1, 148, 13, 266.5],
    ["Ronnie Kijvekamp", 35, 92, 67, 76, 57, 24, 112, 3, 241.5],
    ["Rinaldo Lenting", 17, 57, 86, 58, 9, 6, 160, 18, 202.5],
    ["Jasper Kempers", 26, 76, 64, 54, 26, 8, 157, 7, 200],
    ["Marco Thijssen", 34, 74, 32, 49, 76, 43, 127, 9, 191],
    ["Willem Thijssen", 20, 80, 77, 71, 0, 0, 132, 6, 190],
    ["Rocco Meerbeek", 34, 83, 32, 59, 44, 31, 152, 6, 186],
    ["Luca Schopema", 14, 50, 80, 59, 0, 0, 125, 7, 162],
    ["Raymond Horst", 19, 56, 48, 44, 29, 17, 130, 11, 156.5],
    ["Mario v Til", 23, 72, 32, 56, 27, 17, 127, 2, 152.5],
    ["Bob Smit", 11, 40, 76, 43, 0, 0, 126, 10, 151],
    ["Dennis van het Hof", 31, 63, 9, 30, 55, 48, 117, 9, 142.5],
    ["Eddy de Jode", 30, 60, 17, 35, 47, 34, 100, 3, 135.5],
    ["Frans Spronk", 29, 59, 7, 26, 53, 46, 114, 4, 128.5],
    ["Muppet", 29, 55, 9, 27, 61, 15, 111, 2, 127.5],
    ["Timme Lensink", 24, 56, 22, 35, 39, 30, 110, 3, 125.5],
    ["Erwin Smit", 27, 58, 8, 31, 43, 30, 124, 1, 120.5],
    ["Gilliam Kempers", 39, 54, 1, 9, 41, 75, 0, 0, 114.5],
    ["Adwin Gras", 13, 40, 45, 39, 18, 6, 0, 1, 108],
    ["Rene Lippets", 18, 20, 2, 9, 27, 35, 121, 2, 59.5],
    ["Sjangie Verbeuken", 9, 18, 6, 13, 33, 11, 125, 4, 57.5],
    ["Mike Thijssen", 6, 18, 25, 21, 0, 0, 137, 0, 55],
    ["Rick Hiddink", 7, 16, 18, 17, 10, 5, 120, 1, 54],
    ["Ian Wagner", 17, 24, 3, 9, 20, 27, 0, 0, 54],
    ["Henk Hubers", 17, 25, 2, 9, 10, 24, 0, 0, 49],
    ["Bjorn Schoenakker", 7, 22, 21, 25, 4, 3, 120, 2, 49],
    ["Daniel Spaink", 6, 11, 7, 11, 7, 7, 0, 2, 29.5],
    ["Arno Vermeer", 9, 12, 0, 6, 10, 16, 0, 0, 26],
    ["Sem Riethorst", 4, 6, 1, 3, 4, 8, 0, 0, 13],
    ["Johan Zaaijer", 1, 1, 0, 0, 1, 2, 0, 0, 2.5],
  ];

  it("bevat exact 32 spelers in fotovolgorde", () => {
    expect(OFFICIELE_TUSSENSTAND_2025_2026.spelers).toHaveLength(foto.length);
    expect(OFFICIELE_TUSSENSTAND_2025_2026.spelers.map((s) => s.naam)).toEqual(
      foto.map(([naam]) => naam)
    );
  });

  it.each(foto)(
    "rij %s klopt met de foto",
    (
      naam,
      aanwezig,
      poulepunten,
      wrGewonnen,
      wrVerloren,
      vrGewonnen,
      vrVerloren,
      hoogsteFinish,
      aantal180s,
      puntenTotaal
    ) => {
      const rij = OFFICIELE_TUSSENSTAND_2025_2026.spelers.find(
        (s) => s.naam === naam
      );
      expect(rij).toBeDefined();
      expect(rij).toMatchObject({
        aanwezig,
        poulepunten,
        winnaarsrondeLegsGewonnen: wrGewonnen,
        winnaarsrondeLegsVerloren: wrVerloren,
        verliezersrondeLegsGewonnen: vrGewonnen,
        verliezersrondeLegsVerloren: vrVerloren,
        hoogsteFinish,
        aantal180s,
        puntenTotaal,
      });
    }
  );

  it("levert de ranglijst exact zoals de foto zonder eigen speelavonden", () => {
    const stand = berekenStand([], [], "2025-2026");
    expect(stand).toHaveLength(foto.length);

    foto.forEach(
      (
        [naam, aanwezig, poulepunten, , , , , hoogsteFinish, aantal180s, punten],
        index
      ) => {
        expect(stand[index]).toMatchObject({
          positie: index + 1,
          naam,
          aanwezig,
          poulepunten,
          hoogsteFinish,
          aantal180s,
          punten,
        });
      }
    );
  });

  it("heeft elke speler uit de foto in de ledenlijst", () => {
    foto.forEach(([naam]) => {
      expect(CLUB_LEDEN_DEFAULT as readonly string[]).toContain(naam);
    });
  });

  it("mapt oude spellingen naar de naam uit de foto", () => {
    expect(canoniekeSpelerNaam("John Wolsheimer")).toBe("John Wolsheumer");
    expect(canoniekeSpelerNaam("Toon ten Kamp")).toBe("Toon te Kamp");
    expect(canoniekeSpelerNaam("Ronnie Kivekamp")).toBe("Ronnie Kijvekamp");
    expect(canoniekeSpelerNaam("Gillian Kempers")).toBe("Gilliam Kempers");
    expect(canoniekeSpelerNaam("Adwin Graas")).toBe("Adwin Gras");
  });
});

describe("officiële tussenstand 2025/2026", () => {
  it("neemt de 32 officiële rijen exact over", () => {
    const stand = berekenStand([], [], "2025-2026");
    expect(stand).toHaveLength(32);
    expect(stand[0]).toMatchObject({
      naam: "John Wolsheumer",
      punten: 599,
      aantal180s: 77,
      hoogsteFinish: 145,
      aanwezig: 30,
      poulepunten: 117,
      bron: "historisch",
    });
    expect(stand[1].punten).toBe(338.5);
    expect(stand[24].naam).toBe("Rick Hiddink");
    expect(stand[25].naam).toBe("Ian Wagner");
    expect(stand[26].naam).toBe("Henk Hubers");
    expect(stand[27].naam).toBe("Bjorn Schoenakker");
    expect(stand[31]).toMatchObject({
      naam: "Johan Zaaijer",
      punten: 2.5,
    });
  });

  it("telt een avond op of vóór 15-08-2026 niet extra", () => {
    const avond: Speelavond = {
      datum: "2026-08-15T20:00:00.000Z",
      seizoen: "2025-2026",
      aanwezigen: ["John Wolsheumer"],
      gasten: [],
      borden: [],
      spelerVanDeAvond: null,
      aanmeldToken: null,
    };
    const stand = berekenStand([avond], [], "2025-2026");
    expect(stand[0].punten).toBe(599);
    expect(stand[0].aanwezig).toBe(30);
  });

  it("telt dezelfde avond niet dubbel via historie én huidige borden", () => {
    const borden = genereerCompetitie(["Alice", "Bob", "Carol"], [], 1)!;
    const wedstrijd = borden[0].wedstrijden[0];
    borden[0] = updateWedstrijdInBord(borden[0], wedstrijd.id, {
      gespeeld: true,
      score1: 3,
      score2: 1,
    });
    const datum = "2026-09-04T19:00:00.000Z";
    const avond: Speelavond = {
      datum,
      seizoen: "2025-2026",
      aanwezigen: ["Alice", "Bob", "Carol"],
      gasten: [],
      borden,
      spelerVanDeAvond: null,
      aanmeldToken: null,
    };
    const stand = berekenStand([avond], borden, "2025-2026", datum);
    const winnaar = stand.find((s) => s.gewonnen === 1);
    expect(winnaar?.gewonnen).toBe(1);
    expect(stand.filter((s) => s.gewonnen === 1)).toHaveLength(1);
  });
});

describe("winnaars- en verliezersronde", () => {
  it("verdeelt een bord van 4 als 1-2 winnaars en 3-4 verliezers", () => {
    const spelers = ["Jan", "Piet", "Henk", "Klaas"];
    let bord: Bord = {
      naam: "Bord 1",
      spelers,
      wedstrijden: genereerRoundRobin(spelers),
      status: "wachtend",
      fase: "poule",
    };

    const winnaarVan = (w: { speler1: string; speler2: string }) => {
      const rang = ["Jan", "Piet", "Henk", "Klaas"];
      return rang.indexOf(w.speler1) < rang.indexOf(w.speler2)
        ? w.speler1
        : w.speler2;
    };

    for (const w of bord.wedstrijden) {
      const winnaar = winnaarVan(w);
      bord = updateWedstrijdInBord(bord, w.id, {
        gespeeld: true,
        score1: w.speler1 === winnaar ? 3 : 1,
        score2: w.speler2 === winnaar ? 3 : 1,
      });
    }

    const rondes = genereerWinnaarsVerliezersRonde([bord]);
    expect(rondes).not.toBeNull();
    const w = rondes!.find((b) => b.fase === "winnaarsronde");
    const v = rondes!.find((b) => b.fase === "verliezersronde");
    expect(w?.spelers).toEqual(["Jan", "Piet"]);
    expect(v?.spelers).toEqual(["Henk", "Klaas"]);
    expect(w?.wedstrijden[0]).toMatchObject({
      speler1: "Jan",
      speler2: "Piet",
    });
  });
});

describe("pasAvondLimietToe", () => {
  it("houdt maximaal 30 leden en weigert de rest", () => {
    const leden = Array.from({ length: 32 }, (_, i) => `Lid ${i + 1}`);
    const result = pasAvondLimietToe(leden, []);
    expect(result.aanwezigen).toHaveLength(30);
    expect(result.geweigerdeLeden).toEqual(["Lid 31", "Lid 32"]);
    expect(result.gasten).toEqual([]);
  });

  it("laat gasten meedoen zolang er plek is", () => {
    const leden = Array.from({ length: 28 }, (_, i) => `Lid ${i + 1}`);
    const result = pasAvondLimietToe(leden, ["Gast A", "Gast B"]);
    expect(result.aanwezigen).toHaveLength(28);
    expect(result.gasten).toEqual(["Gast A", "Gast B"]);
    expect(result.verwijderdeGasten).toEqual([]);
  });

  it("laat gasten afvallen als leden de avond vol maken", () => {
    const leden = Array.from({ length: 29 }, (_, i) => `Lid ${i + 1}`);
    const result = pasAvondLimietToe(leden, ["Gast A", "Gast B"]);
    expect(result.aanwezigen).toHaveLength(29);
    expect(result.gasten).toEqual(["Gast A"]);
    expect(result.verwijderdeGasten).toEqual(["Gast B"]);
  });

  it("verwijdert alle gasten bij 30 leden", () => {
    const leden = Array.from({ length: 30 }, (_, i) => `Lid ${i + 1}`);
    const result = pasAvondLimietToe(leden, ["Gast A", "Gast B"]);
    expect(result.aanwezigen).toHaveLength(30);
    expect(result.gasten).toEqual([]);
    expect(result.verwijderdeGasten).toEqual(["Gast A", "Gast B"]);
  });
});
