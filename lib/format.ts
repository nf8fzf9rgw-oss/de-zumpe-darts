/** Nederlandse weergave van punten (338.5 → "338,5"). */
export function formatPunten(waarde: number): string {
  return waarde.toLocaleString("nl-NL", {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(waarde) ? 0 : 1,
  });
}
