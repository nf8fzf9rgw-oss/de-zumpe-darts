import { describe, expect, it } from "vitest";
import { genereerRoundRobin, updateWedstrijdInBord } from "@/lib/competition";
import type { Bord, Wedstrijd } from "@/types/competition";
import {
  geldigeTellers,
  herstelTijdslotTellers,
  isGeldigeTeller,
  planPouleWedstrijden,
  telDirectOpnieuwSpelen,
  telSpelenNaarTellen,
  telTellenNaarSpelen,
  tellerConflicteertInTijdslot,
  tellerVerdeling,
} from "@/lib/wedstrijd-planning";

const VIER = ["Bjorn", "John", "Muppet", "Nico"];
const VIJF = ["Bjorn Schoenakker", "John Wolsheumer", "Muppet", "Nico Pas", "Mario v Til"];

function speelt(wedstrijd: Wedstrijd, naam: string): boolean {
  return wedstrijd.speler1 === naam || wedstrijd.speler2 === naam;
}

function alleParen(spelers: string[]): string[] {
  const paren: string[] = [];
  for (let i = 0; i < spelers.length; i += 1) {
    for (let j = i + 1; j < spelers.length; j += 1) {
      paren.push([spelers[i], spelers[j]].sort().join("|"));
    }
  }
  return paren.sort();
}

function geplandeParen(wedstrijden: Wedstrijd[]): string[] {
  return wedstrijden
    .map((wedstrijd) => [wedstrijd.speler1, wedstrijd.speler2].sort().join("|"))
    .sort();
}

describe("poule met 4 spelers", () => {
  const wedstrijden = planPouleWedstrijden(VIER);

  it("maakt 6 unieke wedstrijden waarin iedereen 3 keer speelt", () => {
    expect(wedstrijden).toHaveLength(6);
    expect(geplandeParen(wedstrijden)).toEqual(alleParen(VIER));
    VIER.forEach((speler) => {
      expect(wedstrijden.filter((wedstrijd) => speelt(wedstrijd, speler))).toHaveLength(3);
    });
  });

  it("geeft iedere wedstrijd een geldige teller die niet meespeelt", () => {
    wedstrijden.forEach((wedstrijd) => {
      expect(wedstrijd.teller).toBeTruthy();
      expect(isGeldigeTeller(wedstrijd, wedstrijd.teller)).toBe(true);
    });
    const verdeling = tellerVerdeling(wedstrijden);
    const aantallen = VIER.map((speler) => verdeling.get(speler) ?? 0);
    expect(Math.min(...aantallen)).toBeGreaterThanOrEqual(1);
    expect(Math.max(...aantallen) - Math.min(...aantallen)).toBeLessThanOrEqual(1);
  });
});

describe("poule met 5 spelers", () => {
  const wedstrijden = planPouleWedstrijden(VIJF);

  it("maakt 10 unieke wedstrijden waarin iedereen 4 keer speelt", () => {
    expect(wedstrijden).toHaveLength(10);
    expect(geplandeParen(wedstrijden)).toEqual(alleParen(VIJF));
    VIJF.forEach((speler) => {
      expect(wedstrijden.filter((wedstrijd) => speelt(wedstrijd, speler))).toHaveLength(4);
    });
  });

  it("verdeelt het tellen zo eerlijk mogelijk", () => {
    const verdeling = tellerVerdeling(wedstrijden);
    const aantallen = VIJF.map((speler) => verdeling.get(speler) ?? 0);
    expect(Math.min(...aantallen)).toBeGreaterThanOrEqual(1);
    expect(Math.max(...aantallen) - Math.min(...aantallen)).toBeLessThanOrEqual(1);
    wedstrijden.forEach((wedstrijd) => {
      expect(isGeldigeTeller(wedstrijd, wedstrijd.teller)).toBe(true);
    });
  });
});

describe("rust tussen rollen", () => {
  it("voorkomt zoveel mogelijk dat dezelfde speler direct opnieuw speelt", () => {
    const naive = genereerRoundRobin(VIJF);
    const planned = planPouleWedstrijden(VIJF);
    expect(telDirectOpnieuwSpelen(planned)).toBeLessThan(telDirectOpnieuwSpelen(naive));
  });

  it("voorkomt zoveel mogelijk tellen → direct spelen", () => {
    const planned = planPouleWedstrijden(VIJF);
    const naive = genereerRoundRobin(VIJF).map((wedstrijd) => ({
      ...wedstrijd,
      teller: geldigeTellers(wedstrijd, VIJF)[0] ?? null,
    }));
    expect(telTellenNaarSpelen(planned)).toBeLessThanOrEqual(
      telTellenNaarSpelen(naive)
    );
    expect(telTellenNaarSpelen(planned)).toBeLessThanOrEqual(4);
  });

  it("voorkomt zoveel mogelijk spelen → direct tellen", () => {
    const planned = planPouleWedstrijden(VIJF);
    expect(telSpelenNaarTellen(planned)).toBeLessThan(planned.length);
  });
});

describe("poule met 6 tot 8 spelers", () => {
  it.each([
    ["zes", ["A", "B", "C", "D", "E", "F"]],
    ["zeven", ["A", "B", "C", "D", "E", "F", "G"]],
    ["acht", ["A", "B", "C", "D", "E", "F", "G", "H"]],
  ] as const)("plant een complete poule voor %s spelers", (_label, spelers) => {
    const wedstrijden = planPouleWedstrijden([...spelers]);
    expect(wedstrijden).toHaveLength((spelers.length * (spelers.length - 1)) / 2);
    expect(geplandeParen(wedstrijden)).toEqual(alleParen([...spelers]));
    spelers.forEach((speler) => {
      expect(wedstrijden.filter((wedstrijd) => speelt(wedstrijd, speler))).toHaveLength(
        spelers.length - 1
      );
    });
    wedstrijden.forEach((wedstrijd) => {
      expect(isGeldigeTeller(wedstrijd, wedstrijd.teller)).toBe(true);
    });
    const verdeling = tellerVerdeling(wedstrijden);
    const aantallen = spelers.map((speler) => verdeling.get(speler) ?? 0);
    expect(Math.max(...aantallen) - Math.min(...aantallen)).toBeLessThanOrEqual(2);
  });
});

describe("meerdere borden", () => {
  it("wijst niemand als teller aan die op hetzelfde tijdslot elders speelt", () => {
    const bord1: Bord = {
      naam: "Bord 1",
      spelers: VIER,
      wedstrijden: planPouleWedstrijden(VIER),
      status: "wachtend",
      fase: "poule",
    };
    const bord2: Bord = {
      naam: "Bord 2",
      spelers: ["Mario", "Eddy", "Toon", "Ronnie"],
      wedstrijden: planPouleWedstrijden(["Mario", "Eddy", "Toon", "Ronnie"]),
      status: "wachtend",
      fase: "poule",
    };
    const hersteld = herstelTijdslotTellers([bord1, bord2]);
    expect(tellerConflicteertInTijdslot(hersteld)).toEqual([]);
  });

  it("herstelt een teller die tegelijk op een ander bord speelt", () => {
    const conflict: Bord[] = [
      {
        naam: "Bord 1",
        spelers: ["A", "B", "C"],
        wedstrijden: [
          {
            id: "C__A",
            speler1: "C",
            speler2: "A",
            gespeeld: false,
            score1: 0,
            score2: 0,
            winnaar: null,
            aantal180Speler1: 0,
            aantal180Speler2: 0,
            hoogsteFinishSpeler1: null,
            hoogsteFinishSpeler2: null,
            bye: false,
            teller: "B",
          },
        ],
        status: "wachtend",
        fase: "poule",
      },
      {
        naam: "Bord 2",
        spelers: ["C", "D", "E", "F"],
        wedstrijden: [
          {
            id: "D__E",
            speler1: "D",
            speler2: "E",
            gespeeld: false,
            score1: 0,
            score2: 0,
            winnaar: null,
            aantal180Speler1: 0,
            aantal180Speler2: 0,
            hoogsteFinishSpeler1: null,
            hoogsteFinishSpeler2: null,
            bye: false,
            teller: "C",
          },
        ],
        status: "wachtend",
        fase: "poule",
      },
    ];

    expect(tellerConflicteertInTijdslot(conflict).length).toBeGreaterThan(0);
    const hersteld = herstelTijdslotTellers(conflict);
    expect(hersteld[1].wedstrijden[0].teller).not.toBe("C");
    expect(isGeldigeTeller(hersteld[1].wedstrijden[0], hersteld[1].wedstrijden[0].teller)).toBe(true);
    expect(tellerConflicteertInTijdslot(hersteld)).toEqual([]);
  });
});

describe("handmatige wijzigingen", () => {
  it("laat een speler die zelf speelt niet als teller kiezen", () => {
    const planned = planPouleWedstrijden(VIJF);
    const wedstrijd = planned[0];
    expect(geldigeTellers(wedstrijd, VIJF)).not.toContain(wedstrijd.speler1);
    expect(geldigeTellers(wedstrijd, VIJF)).not.toContain(wedstrijd.speler2);

    const bord: Bord = {
      naam: "Bord 1",
      spelers: VIJF,
      wedstrijden: planned,
      status: "wachtend",
      fase: "poule",
    };
    const bijgewerkt = updateWedstrijdInBord(bord, wedstrijd.id, {
      teller: wedstrijd.speler1,
    });
    expect(bijgewerkt.wedstrijden[0].teller).not.toBe(wedstrijd.speler1);
    expect(isGeldigeTeller(bijgewerkt.wedstrijden[0], bijgewerkt.wedstrijden[0].teller)).toBe(true);
  });

  it("kiest een nieuwe teller wanneer een spelerwissel de oude teller ongeldig maakt", () => {
    const planned = planPouleWedstrijden(VIJF);
    const wedstrijd = planned[0];
    const teller = wedstrijd.teller;
    expect(teller).toBeTruthy();

    const bord: Bord = {
      naam: "Bord 1",
      spelers: VIJF,
      wedstrijden: planned,
      status: "wachtend",
      fase: "poule",
    };
    const bijgewerkt = updateWedstrijdInBord(bord, wedstrijd.id, {
      speler2: teller ?? "",
    });
    const nieuw = bijgewerkt.wedstrijden[0];
    expect(nieuw.speler2).toBe(teller);
    expect(nieuw.teller).not.toBe(teller);
    expect(isGeldigeTeller(nieuw, nieuw.teller)).toBe(true);
  });
});
