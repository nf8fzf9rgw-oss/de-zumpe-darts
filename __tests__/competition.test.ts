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
import { berekenStand } from "@/lib/standings";
import { PUNTEN_PER_WINST } from "@/lib/scoring";
import { genereerWinnaarsVerliezersRonde } from "@/lib/knockout";

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

  it("zet nooit meer dan 5 spelers op een bord tot 30 spelers", () => {
    for (let n = 3; n <= 30; n += 1) {
      const verdeling = berekenBordVerdeling(n)!;
      expect(verdeling.reduce((a, b) => a + b, 0)).toBe(n);
      expect(verdeling.every((g) => g >= MIN_SPELERS_PER_BORD && g <= 5)).toBe(
        true
      );
      expect(verdeling.length).toBeLessThanOrEqual(MAX_BORDEN_PER_AVOND);
    }
  });

  it("opent Bord 6 pas vanaf 21 spelers", () => {
    for (let n = 3; n <= 20; n += 1) {
      expect(berekenBordVerdeling(n)!.length).toBeLessThanOrEqual(5);
    }
    for (let n = 21; n <= 30; n += 1) {
      expect(berekenBordVerdeling(n)!.length).toBe(6);
    }
  });

  it("houdt borden op maximaal 4 spelers tot alle 6 borden vol zijn", () => {
    // Vanaf 6 spelers past iedereen in groepen van 3 of 4.
    // (5 spelers kan niet: 3+2 laat een bord onder de ondergrens vallen.)
    for (let n = 6; n <= 24; n += 1) {
      expect(berekenBordVerdeling(n)!.every((g) => g <= 4)).toBe(true);
    }
    expect(berekenBordVerdeling(5)).toEqual([5]);
    // Pas vanaf 25 komt de eerste 5 erbij, precies één per extra speler.
    for (let n = 25; n <= 30; n += 1) {
      expect(berekenBordVerdeling(n)!.filter((g) => g === 5)).toHaveLength(
        n - 24
      );
    }
  });

  it("gebruikt het minimale aantal borden voor groepen van maximaal 4", () => {
    for (let n = 6; n <= 24; n += 1) {
      expect(berekenBordVerdeling(n)!.length).toBe(Math.ceil(n / 4));
    }
  });

  it("is deterministisch", () => {
    for (let n = 3; n <= 30; n += 1) {
      expect(berekenBordVerdeling(n)).toEqual(berekenBordVerdeling(n));
    }
  });

  it("valt terug op grotere borden boven 30 spelers", () => {
    for (let n = 31; n <= MAX_SPELERS_PER_AVOND; n += 1) {
      const verdeling = berekenBordVerdeling(n)!;
      expect(verdeling.reduce((a, b) => a + b, 0)).toBe(n);
      expect(verdeling.length).toBeLessThanOrEqual(MAX_BORDEN_PER_AVOND);
      expect(
        verdeling.every(
          (g) => g >= MIN_SPELERS_PER_BORD && g <= MAX_SPELERS_PER_BORD
        )
      ).toBe(true);
    }
  });

  it("exporteert board-limieten", () => {
    expect(MIN_SPELERS_PER_BORD).toBe(3);
    expect(MAX_SPELERS_PER_BORD).toBe(7);
    expect(MAX_BORDEN_PER_AVOND).toBe(6);
    expect(MAX_SPELERS_PER_AVOND).toBe(42);
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
    for (let n = 3; n <= MAX_SPELERS_PER_AVOND; n += 1) {
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

describe("officiële tussenstand 2025/2026", () => {
  it("neemt de 32 officiële rijen exact over", () => {
    const stand = berekenStand([], [], "2025-2026");
    expect(stand).toHaveLength(32);
    expect(stand[0]).toMatchObject({
      naam: "John Wolsheimer",
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
      aanwezigen: ["John Wolsheimer"],
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
