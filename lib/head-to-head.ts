import { namenZijnGelijk } from "@/lib/namen";
import { isByeSpeler } from "@/lib/knockout";
import type { Bord, Speelavond } from "@/types/competition";

export interface HeadToHead {
  spelerA: string;
  spelerB: string;
  ontmoetingen: number;
  winstA: number;
  winstB: number;
}

export function berekenHeadToHead(
  spelerA: string,
  spelerB: string,
  historie: Speelavond[],
  huidigeBorden: Bord[] = []
): HeadToHead {
  let winstA = 0;
  let winstB = 0;
  let ontmoetingen = 0;

  const verwerk = (borden: Bord[]) => {
    borden.forEach((bord) => {
      bord.wedstrijden.forEach((w) => {
        if (w.bye || isByeSpeler(w.speler1) || isByeSpeler(w.speler2)) return;
        const paar =
          (namenZijnGelijk(w.speler1, spelerA) &&
            namenZijnGelijk(w.speler2, spelerB)) ||
          (namenZijnGelijk(w.speler1, spelerB) &&
            namenZijnGelijk(w.speler2, spelerA));
        if (!paar || !w.gespeeld || !w.winnaar) return;
        ontmoetingen += 1;
        if (namenZijnGelijk(w.winnaar, spelerA)) winstA += 1;
        else if (namenZijnGelijk(w.winnaar, spelerB)) winstB += 1;
      });
    });
  };

  historie.forEach((avond) => verwerk(avond.borden));
  verwerk(huidigeBorden);

  return { spelerA, spelerB, ontmoetingen, winstA, winstB };
}
