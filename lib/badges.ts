export function berekenBadges(input: {
  aantal180s: number;
  hoogsteFinish: number;
  overwinningen: number;
  winstreeks: number;
  positie: number;
  avondtitels: number;
  aanwezigheid: number;
}): string[] {
  const badges: string[] = [];

  if (input.positie === 1) badges.push("🥇 Koploper");
  if (input.avondtitels >= 1) badges.push("⭐ Speler van de avond");
  if (input.avondtitels >= 3) badges.push("⭐ Avondkoning");

  if (input.aantal180s >= 1) badges.push("🎯 Eerste 180");
  if (input.aantal180s >= 10) badges.push("🎯 10× 180");
  if (input.aantal180s >= 25) badges.push("🎯 25× 180");
  if (input.aantal180s >= 50) badges.push("🎯 50× 180");

  if (input.overwinningen >= 10) badges.push("🏆 10 overwinningen");
  if (input.overwinningen >= 25) badges.push("🏆 25 overwinningen");
  if (input.overwinningen >= 50) badges.push("🏆 50 overwinningen");

  if (input.winstreeks >= 5) badges.push("🔥 5 winstpartijen achter elkaar");
  if (input.winstreeks >= 10) badges.push("🔥 10 winstpartijen achter elkaar");

  if (input.hoogsteFinish >= 100) badges.push("💯 Eerste 100+ finish");
  if (input.hoogsteFinish >= 140) badges.push("💯 Finish boven 140");
  if (input.hoogsteFinish >= 160) badges.push("💯 Finish boven 160");

  if (input.aanwezigheid >= 10) badges.push("📅 Vaste waarde");

  return badges;
}
