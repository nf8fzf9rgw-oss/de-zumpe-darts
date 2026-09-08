import { describe, expect, it } from "vitest";
import {
  initiëleSpelerSelectie,
  laadOpgeslagenSpelerNaam,
  slaSpelerNaamOp,
} from "@/lib/player-utils";
import { CLUB_LEDEN_DEFAULT } from "@/lib/leden";

const ROCCO = "Rocco Meerbeek";
const EDDY = "Eddy de Jode";

describe("initiëleSpelerSelectie", () => {
  it("selecteert geen speler voor een nieuwe bezoeker", () => {
    expect(initiëleSpelerSelectie()).toBe("");
    expect(initiëleSpelerSelectie(null)).toBe("");
    expect(initiëleSpelerSelectie("")).toBe("");
  });

  it("selecteert Rocco niet automatisch als hij als speler bestaat", () => {
    expect(CLUB_LEDEN_DEFAULT).toContain(ROCCO);
    expect(initiëleSpelerSelectie(undefined)).toBe("");
    expect(initiëleSpelerSelectie("")).toBe("");
  });

  it("selecteert Rocco wel bij een expliciete URL-keuze", () => {
    expect(initiëleSpelerSelectie(ROCCO)).toBe(ROCCO);
    expect(initiëleSpelerSelectie(` ${ROCCO} `)).toBe(ROCCO);
  });

  it("selecteert een andere speler bij een expliciete URL-keuze", () => {
    expect(initiëleSpelerSelectie(EDDY)).toBe(EDDY);
  });

  it("valt bij herladen niet terug op een opgeslagen standaardspeler", () => {
    expect(initiëleSpelerSelectie(null)).toBe("");
    expect(initiëleSpelerSelectie("")).toBe("");
    expect(laadOpgeslagenSpelerNaam()).toBe("");
    slaSpelerNaamOp(ROCCO);
    expect(laadOpgeslagenSpelerNaam()).toBe("");
    expect(initiëleSpelerSelectie("", laadOpgeslagenSpelerNaam())).toBe("");
  });
});
