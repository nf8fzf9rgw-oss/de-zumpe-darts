import { describe, expect, it } from "vitest";
import { maakWedstrijd } from "@/lib/competition";
import {
  actieveBordNamen,
  avondWeergaveStatus,
  filterBordenVoorSchema,
  groepeerBordenInRondes,
  mijnPoulePad,
  tegenstanderVan,
  wedstrijdHeeftSpeler,
  wedstrijdPrestatieRegels,
  wedstrijdUitslagTekst,
  wedstrijdWeergaveStatus,
} from "@/lib/wedstrijd-overzicht";
import { berekenAvondHighlights } from "@/lib/player-of-evening";
import { pouleBordVoorSpeler, vindBordenVoorSpeler } from "@/lib/player-utils";
import type { Bord, Wedstrijd } from "@/types/competition";

function bord(
  naam: string,
  spelers: string[],
  wedstrijden: Wedstrijd[],
  fase: Bord["fase"] = "poule"
): Bord {
  return {
    naam,
    spelers,
    wedstrijden,
    status: "actief",
    fase,
  };
}

describe("wedstrijdWeergaveStatus", () => {
  it("toont nog te spelen voor een open wedstrijd", () => {
    const status = wedstrijdWeergaveStatus(maakWedstrijd("Rocco", "Ronnie"));
    expect(status.key).toBe("nog_te_spelen");
    expect(status.label).toBe("WACHT");
  });

  it("toont bezig wanneer er al een score is maar nog niet gespeeld", () => {
    const wedstrijd: Wedstrijd = {
      ...maakWedstrijd("Rocco", "Ronnie"),
      score1: 2,
    };
    expect(wedstrijdWeergaveStatus(wedstrijd).key).toBe("bezig");
  });

  it("toont gewonnen of verloren vanuit het perspectief van een speler", () => {
    const wedstrijd: Wedstrijd = {
      ...maakWedstrijd("Rocco", "Ronnie"),
      gespeeld: true,
      score1: 3,
      score2: 1,
      winnaar: "Rocco Meerbeek",
    };
    wedstrijd.speler1 = "Rocco Meerbeek";
    wedstrijd.speler2 = "Ronnie Kijvekamp";

    expect(wedstrijdWeergaveStatus(wedstrijd, "Rocco Meerbeek").key).toBe(
      "gewonnen"
    );
    expect(wedstrijdWeergaveStatus(wedstrijd, "Ronnie Kijvekamp").key).toBe(
      "verloren"
    );
    expect(wedstrijdWeergaveStatus(wedstrijd).key).toBe("gespeeld");
    expect(wedstrijdWeergaveStatus(wedstrijd).label).toBe("GEREED");
  });
});

describe("wedstrijd helpers", () => {
  it("vindt de tegenstander en of een speler meespeelt", () => {
    const wedstrijd = maakWedstrijd("Rocco Meerbeek", "Ronnie Kijvekamp");
    expect(tegenstanderVan(wedstrijd, "Rocco Meerbeek")).toBe(
      "Ronnie Kijvekamp"
    );
    expect(wedstrijdHeeftSpeler(wedstrijd, "rocco meerbeek")).toBe(true);
    expect(wedstrijdHeeftSpeler(wedstrijd, "Sjanjie")).toBe(false);
  });

  it("maakt een uitslagtekst voor gespeelde wedstrijden", () => {
    const wedstrijd: Wedstrijd = {
      ...maakWedstrijd("Jan", "Piet"),
      gespeeld: true,
      score1: 3,
      score2: 1,
      winnaar: "Jan",
    };
    expect(wedstrijdUitslagTekst(wedstrijd)).toBe("Jan 3 – 1 Piet");
    expect(wedstrijdUitslagTekst(maakWedstrijd("Jan", "Piet"))).toBeNull();
  });

  it("bouwt de mijn-poule url met queryparameter", () => {
    expect(mijnPoulePad("Ronnie Kijvekamp")).toBe(
      "/mijn-poule?speler=Ronnie+Kijvekamp"
    );
  });
});

describe("bordoverzicht", () => {
  const pouleWedstrijd = maakWedstrijd("Jan", "Piet");
  const poule = bord("Bord 1", ["Jan", "Piet", "Henk", "Klaas"], [
    pouleWedstrijd,
    maakWedstrijd("Henk", "Klaas"),
  ]);
  const winnaars = bord(
    "Winnaarsronde",
    ["Jan", "Piet"],
    [maakWedstrijd("Jan", "Piet")],
    "winnaarsronde"
  );
  const verliezers = bord(
    "Verliezersronde",
    ["Henk", "Klaas"],
    [maakWedstrijd("Henk", "Klaas")],
    "verliezersronde"
  );

  it("groepeert poule en knockout-rondes", () => {
    const groepen = groepeerBordenInRondes([poule, winnaars, verliezers]);
    expect(groepen.poule.map((b) => b.naam)).toEqual(["Bord 1"]);
    expect(groepen.winnaarsronde).toHaveLength(1);
    expect(groepen.verliezersronde).toHaveLength(1);
  });

  it("toont alleen bestaande borden als filternamen", () => {
    expect(actieveBordNamen([poule, winnaars])).toEqual([
      "Bord 1",
      "Winnaarsronde",
    ]);
  });

  it("filtert op bord en speler zonder de brondata te kopiëren naar een nieuwe database", () => {
    const gefilterd = filterBordenVoorSchema([poule], {
      bordNaam: "Bord 1",
      spelerQuery: "jan",
      alleenMijnWedstrijden: false,
      eigenNaam: "",
    });
    expect(gefilterd).toHaveLength(1);
    expect(gefilterd[0].wedstrijden).toHaveLength(1);
    expect(gefilterd[0].wedstrijden[0].speler1).toBe("Jan");
  });

  it("verbergt borden zonder de gezochte speler", () => {
    const tweede = bord("Bord 2", ["Sjanjie", "Rocco"], [
      maakWedstrijd("Sjanjie", "Rocco"),
    ]);
    const gefilterd = filterBordenVoorSchema([poule, tweede], {
      bordNaam: null,
      spelerQuery: "Rocco",
      alleenMijnWedstrijden: false,
      eigenNaam: "",
    });
    expect(gefilterd.map((b) => b.naam)).toEqual(["Bord 2"]);
  });

  it("vindt alle borden van een speler, met poule als voorkeur", () => {
    const borden = [poule, winnaars];
    expect(vindBordenVoorSpeler(borden, "Jan").map((b) => b.naam)).toEqual([
      "Bord 1",
      "Winnaarsronde",
    ]);
    expect(pouleBordVoorSpeler(borden, "Jan")?.naam).toBe("Bord 1");
  });
});

describe("avond- en prestatieweergave", () => {
  it("toont avondstatus op basis van wedstrijden", () => {
    const openWedstrijd = maakWedstrijd("Jan", "Piet");
    const pouleBord = bord("Bord 1", ["Jan", "Piet"], [openWedstrijd]);
    const dinsdag = new Date("2026-09-08T12:00:00");
    const vrijdag = new Date("2026-09-11T12:00:00");

    expect(avondWeergaveStatus([], dinsdag).key).toBe("geen_speelavond");
    expect(avondWeergaveStatus([], vrijdag).key).toBe("wacht_op_start");
    expect(avondWeergaveStatus([pouleBord]).key).toBe("live");

    const bezig: Bord = {
      ...pouleBord,
      wedstrijden: [{ ...openWedstrijd, score1: 1 }],
    };
    expect(avondWeergaveStatus([bezig]).key).toBe("live");

    const afgerond: Bord = {
      ...pouleBord,
      wedstrijden: [
        {
          ...openWedstrijd,
          gespeeld: true,
          score1: 3,
          score2: 1,
          winnaar: "Jan",
        },
      ],
    };
    expect(avondWeergaveStatus([afgerond]).key).toBe("afgerond");
  });

  it("toont 180's en hoge finishes van een wedstrijd", () => {
    const wedstrijd: Wedstrijd = {
      ...maakWedstrijd("Jan", "Piet"),
      gespeeld: true,
      aantal180Speler1: 2,
      aantal180Speler2: 1,
      hoogsteFinishSpeler1: 121,
      hoogsteFinishSpeler2: 104,
    };
    expect(wedstrijdPrestatieRegels(wedstrijd)).toEqual([
      "🎯 Jan — 2 × 180",
      "🎯 Piet — 1 × 180",
      "💯 Jan — 121",
      "💯 Piet — 104",
    ]);
  });

  it("berekent meeste 180's en hoogste finish van de avond", () => {
    const avondBord = bord("Bord 1", ["Jan", "Piet"], [
      {
        ...maakWedstrijd("Jan", "Piet"),
        gespeeld: true,
        aantal180Speler1: 2,
        aantal180Speler2: 1,
        hoogsteFinishSpeler1: 121,
        hoogsteFinishSpeler2: 170,
      },
    ]);
    const highlights = berekenAvondHighlights([avondBord]);
    expect(highlights.meeste180s).toEqual({ naam: "Jan", aantal: 2 });
    expect(highlights.hoogsteFinish).toEqual({ naam: "Piet", finish: 170 });
  });
});
