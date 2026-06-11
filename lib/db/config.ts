/**
 * Database adapter — activeert Prisma wanneer DATABASE_URL is gezet.
 * Standaard: localStorage via bestaande storage.ts.
 */
export function isDatabaseEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getStorageMode(): "local" | "database" {
  return isDatabaseEnabled() ? "database" : "local";
}
