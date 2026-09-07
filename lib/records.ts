import { berekenStand } from "@/lib/standings";
import { berekenWinstreeksen } from "@/lib/winstreeks";
import type { Bord, ClubRecords, Speelavond } from "@/types/competition";

export { berekenWinstreeksen, langsteWinstreeksVoorSpeler } from "@/lib/winstreeks";

export function berekenClubRecords(
  historie: Speelavond[],
  huidigeBorden: Bord[] = [],
  seizoenId?: string,
  huidigeAvondDatum?: string
): ClubRecords {
  const stand = berekenStand(
    historie,
    huidigeBorden,
    seizoenId,
    huidigeAvondDatum
  );

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

  const meesteWins = [...stand].sort((a, b) => b.gewonnen - a.gewonnen)[0];
  const hoogstePct = [...stand]
    .filter((s) => s.gewonnen + s.verloren >= 3)
    .sort((a, b) => b.percentage - a.percentage)[0];

  const streaks = berekenWinstreeksen(
    historie,
    huidigeBorden,
    huidigeAvondDatum
  );
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

  const winsWaarde = meesteWins?.gewonnen ?? 0;

  return {
    meeste180s,
    hoogsteFinish,
    meesteOverwinningen: {
      naam: winsWaarde > 0 ? meesteWins.naam : "-",
      waarde: winsWaarde,
      label: `${winsWaarde} overwinningen`,
    },
    hoogsteWinstpercentage: {
      naam: hoogstePct?.naam ?? "-",
      waarde: hoogstePct?.percentage ?? 0,
      label: hoogstePct ? `${hoogstePct.percentage}%` : "—",
    },
    langsteWinstreeks: langsteStreak,
  };
}
