import type { Speelavond } from "@/types/competition";

/**
 * Service-laag voorbereid op toekomstige Prisma-integratie.
 * Vervang de implementatie later door Prisma-queries zonder de UI aan te passen.
 */
export interface SpeelavondRepository {
  getHuidige(): Promise<Speelavond | null>;
  saveHuidige(avond: Speelavond): Promise<void>;
  clearHuidige(): Promise<void>;
  getHistorie(): Promise<Speelavond[]>;
  addToHistorie(avond: Speelavond): Promise<void>;
}

export function createLocalSpeelavondRepository(
  storage: {
    laadSpeelavond: () => Speelavond | null;
    slaSpeelavondOp: (avond: Speelavond) => void;
    verwijderSpeelavond: () => void;
    laadHistorie: () => Speelavond[];
    voegToeAanHistorie: (avond: Speelavond) => void;
  }
): SpeelavondRepository {
  return {
    async getHuidige() {
      return storage.laadSpeelavond();
    },
    async saveHuidige(avond) {
      storage.slaSpeelavondOp(avond);
    },
    async clearHuidige() {
      storage.verwijderSpeelavond();
    },
    async getHistorie() {
      return storage.laadHistorie();
    },
    async addToHistorie(avond) {
      storage.voegToeAanHistorie(avond);
    },
  };
}
