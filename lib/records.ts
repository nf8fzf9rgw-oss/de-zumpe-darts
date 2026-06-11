import { berekenStand } from "@/lib/standings";
import type { Bord, ClubRecords, Speelavond, Wedstrijd } from "@/types/competition";

function berekenWinstreeksen(
  historie: Speelavond[],
  huidigeBorden: Bord[]
): Map<string, number> {
  const streaks = new Map<string, number>();
  const huidig = new Map<string, number>();

  const avonden = [...historie].sort(
    (a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime()
  );

  avonden.forEach((avond) => {
    const wedstrijden = avond.borden.flatMap((b) => b.wedstrijden);
    wedstrijden
      .filter((w) => w.gespeeld && w.winnaar)
      .forEach((w) => {
        const winnaar = w.winnaar!;
        const verliezer = winnaar === w.speler1 ? w.speler2 : w.speler1;
        huidig.set(winnaar, (huidig.get(winnaar) ?? 0) + 1);
        huidig.set(verliezer, 0);
        streaks.set(
          winnaar,
          Math.max(streaks.get(winnaar) ?? 0, huidig.get(winnaar)!)
        );
      });
  });

  huidigeBorden.forEach((bord) => {
    bord.wedstrijden
      .filter((w) => w.gespeeld && w.winnaar)
      .forEach((w) => {
        const winnaar = w.winnaar!;
        const verliezer = winnaar === w.speler1 ? w.speler2 : w.speler1;
        huidig.set(winnaar, (huidig.get(winnaar) ?? 0) + 1);
        huidig.set(verliezer, 0);
        streaks.set(
          winnaar,
          Math.max(streaks.get(winnaar) ?? 0, huidig.get(winnaar)!)
        );
      });
  });

  return streaks;
}

export function berekenClubRecords(
  historie: Speelavond[],
  huidigeBorden: Bord[] = []
): ClubRecords {
  const stand = berekenStand(historie, huidigeBorden);

  let meeste180s = { naam: "-", waarde: 0, label: "0x 180" };
  let hoogsteFinish = { naam: "-", waarde: 0, label: "HF 0" };

  stand.forEach((s) => {
    if (s.aantal180s > meeste180s.waarde) {
      meeste180s = {
        naam: s.naam,
        waarde: s.aantal180s,
        label: `${s.aantal180s}x 180`,
      };
    }
    if (s.hoogsteFinish > hoogsteFinish.waarde) {
      hoogsteFinish = {
        naam: s.naam,
        waarde: s.hoogsteFinish,
        label: `HF ${s.hoogsteFinish}`,
      };
    }
  });

  const meesteWins = stand[0];
  const hoogstePct = [...stand]
    .filter((s) => s.gewonnen + s.verloren >= 3)
    .sort((a, b) => b.percentage - a.percentage)[0];

  const streaks = berekenWinstreeksen(historie, huidigeBorden);
  let langsteStreak = { naam: "-", waarde: 0, label: "0 wedstrijden" };
  streaks.forEach((streak, naam) => {
    if (streak > langsteStreak.waarde) {
      langsteStreak = {
        naam,
        waarde: streak,
        label: `${streak} wedstrijden`,
      };
    }
  });

  return {
    meeste180s,
    hoogsteFinish,
    meesteOverwinningen: {
      naam: meesteWins?.naam ?? "-",
      waarde: meesteWins?.gewonnen ?? 0,
      label: `${meesteWins?.gewonnen ?? 0} overwinningen`,
    },
    hoogsteWinstpercentage: {
      naam: hoogstePct?.naam ?? stand[0]?.naam ?? "-",
      waarde: hoogstePct?.percentage ?? stand[0]?.percentage ?? 0,
      label: `${hoogstePct?.percentage ?? 0}%`,
    },
    langsteWinstreeks: langsteStreak,
  };
}
