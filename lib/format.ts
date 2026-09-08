/** Nederlandse weergave van punten (338.5 → "338,5"). */
export function formatPunten(waarde: number): string {
  return waarde.toLocaleString("nl-NL", {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(waarde) ? 0 : 1,
  });
}

export function ranglijstMedaille(positie: number): string {
  if (positie === 1) return "🥇";
  if (positie === 2) return "🥈";
  if (positie === 3) return "🥉";
  return String(positie);
}
