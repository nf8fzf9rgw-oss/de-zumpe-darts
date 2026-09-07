import { canoniekeSpelerNaam, namenZijnGelijk } from "@/lib/namen";
import { isByeSpeler } from "@/lib/knockout";
import type { Bord, Speelavond } from "@/types/competition";

export function berekenWinstreeksen(
  historie: Speelavond[],
  huidigeBorden: Bord[],
  huidigeAvondDatum?: string
): Map<string, number> {
  const streaks = new Map<string, number>();
  const huidig = new Map<string, number>();

  const avonden = [...historie]
    .filter((avond) => !huidigeAvondDatum || avond.datum !== huidigeAvondDatum)
    .sort(
      (a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime()
    );

  const verwerk = (borden: Bord[]) => {
    borden.forEach((bord) => {
      bord.wedstrijden
        .filter((w) => w.gespeeld && w.winnaar && !w.bye)
        .forEach((w) => {
          if (isByeSpeler(w.speler1) || isByeSpeler(w.speler2)) return;
          const winnaar = canoniekeSpelerNaam(w.winnaar!);
          const verliezer = canoniekeSpelerNaam(
            namenZijnGelijk(winnaar, w.speler1) ? w.speler2 : w.speler1
          );
          huidig.set(winnaar, (huidig.get(winnaar) ?? 0) + 1);
          huidig.set(verliezer, 0);
          streaks.set(
            winnaar,
            Math.max(streaks.get(winnaar) ?? 0, huidig.get(winnaar) ?? 0)
          );
        });
    });
  };

  avonden.forEach((avond) => verwerk(avond.borden));
  verwerk(huidigeBorden);

  return streaks;
}

export function langsteWinstreeksVoorSpeler(
  naam: string,
  historie: Speelavond[],
  huidigeBorden: Bord[] = [],
  huidigeAvondDatum?: string
): number {
  const streaks = berekenWinstreeksen(historie, huidigeBorden, huidigeAvondDatum);
  let max = 0;
  streaks.forEach((waarde, speler) => {
    if (namenZijnGelijk(speler, naam) && waarde > max) max = waarde;
  });
  return max;
}
