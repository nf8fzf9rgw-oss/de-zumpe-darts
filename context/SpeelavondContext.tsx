"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { berekenDashboardStats, genereerCompetitie } from "@/lib/competition";
import { CLUB_LEDEN } from "@/lib/leden";
import { createLocalSpeelavondRepository } from "@/lib/services/speelavond.service";
import {
  formatDatum,
  laadHistorie,
  laadSpeelavond,
  maakHuidigeDatum,
  maakLegeSpeelavond,
  slaSpeelavondOp,
  verwijderSpeelavond,
  voegToeAanHistorie,
} from "@/lib/storage";
import { berekenStatistieken } from "@/lib/statistics";
import type {
  Bord,
  DashboardStatistieken,
  Speelavond,
  SpeelavondStatistieken,
} from "@/types/competition";

interface SpeelavondContextValue {
  leden: readonly string[];
  aanwezigen: string[];
  gasten: string[];
  gastNaam: string;
  borden: Bord[];
  laatsteOpslag: string;
  laatsteOpslagLabel: string;
  dashboardStats: DashboardStatistieken;
  statistieken: SpeelavondStatistieken;
  isGeladen: boolean;
  setGastNaam: (naam: string) => void;
  toggleLid: (naam: string) => void;
  selecteerAlleLeden: () => void;
  deselecteerAlleLeden: () => void;
  voegGastToe: () => void;
  verwijderGast: (naam: string) => void;
  genereerCompetitieAvond: () => void;
  opslaan: () => void;
  nieuweAvond: () => void;
  printSchema: () => void;
}

const SpeelavondContext = createContext<SpeelavondContextValue | null>(null);

const repository = createLocalSpeelavondRepository({
  laadSpeelavond,
  slaSpeelavondOp,
  verwijderSpeelavond,
  laadHistorie,
  voegToeAanHistorie,
});

function syncState(avond: Speelavond) {
  return {
    aanwezigen: avond.aanwezigen,
    gasten: avond.gasten,
    borden: avond.borden,
    laatsteOpslag: avond.datum,
  };
}

export function SpeelavondProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [aanwezigen, setAanwezigen] = useState<string[]>([]);
  const [gasten, setGasten] = useState<string[]>([]);
  const [gastNaam, setGastNaam] = useState("");
  const [borden, setBorden] = useState<Bord[]>([]);
  const [laatsteOpslag, setLaatsteOpslag] = useState("");
  const [isGeladen, setIsGeladen] = useState(false);
  const [historie, setHistorie] = useState<Speelavond[]>([]);

  useEffect(() => {
    const opgeslagen = laadSpeelavond();
    if (opgeslagen) {
      const state = syncState(opgeslagen);
      /* eslint-disable react-hooks/set-state-in-effect -- localStorage hydratie na client mount */
      setAanwezigen(state.aanwezigen);
      setGasten(state.gasten);
      setBorden(state.borden);
      setLaatsteOpslag(state.laatsteOpslag);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
    setHistorie(laadHistorie());
    setIsGeladen(true);
  }, []);

  const persist = useCallback(
    (updates: Partial<Speelavond>) => {
      const huidig: Speelavond = {
        datum: laatsteOpslag,
        aanwezigen,
        gasten,
        borden,
        ...updates,
      };
      slaSpeelavondOp(huidig);
      return huidig;
    },
    [aanwezigen, borden, gasten, laatsteOpslag]
  );

  const toggleLid = useCallback(
    (naam: string) => {
      setAanwezigen((huidig) => {
        const nieuw = huidig.includes(naam)
          ? huidig.filter((speler) => speler !== naam)
          : [...huidig, naam];
        persist({ aanwezigen: nieuw });
        return nieuw;
      });
    },
    [persist]
  );

  const selecteerAlleLeden = useCallback(() => {
    const alle = [...CLUB_LEDEN];
    setAanwezigen(alle);
    persist({ aanwezigen: alle });
  }, [persist]);

  const deselecteerAlleLeden = useCallback(() => {
    setAanwezigen([]);
    persist({ aanwezigen: [] });
  }, [persist]);

  const voegGastToe = useCallback(() => {
    const naam = gastNaam.trim();
    if (!naam) return;

    setGasten((huidig) => {
      const nieuw = [...huidig, naam];
      persist({ gasten: nieuw });
      return nieuw;
    });
    setGastNaam("");
  }, [gastNaam, persist]);

  const verwijderGast = useCallback(
    (naam: string) => {
      setGasten((huidig) => {
        const nieuw = huidig.filter((gast) => gast !== naam);
        persist({ gasten: nieuw });
        return nieuw;
      });
    },
    [persist]
  );

  const genereerCompetitieAvond = useCallback(() => {
    const spelers = [...aanwezigen, ...gasten];

    if (spelers.length < 3) {
      alert("Minimaal 3 spelers nodig voor een competitie.");
      return;
    }

    if (spelers.length > 20) {
      alert("Maximaal 20 spelers (4 borden x 5 spelers).");
      return;
    }

    const nieuweBorden = genereerCompetitie(spelers);
    if (!nieuweBorden) {
      alert("Kon geen geldige bordverdeling maken voor dit aantal spelers.");
      return;
    }

    setBorden(nieuweBorden);
    persist({ borden: nieuweBorden });
  }, [aanwezigen, gasten, persist]);

  const opslaan = useCallback(() => {
    const datum = maakHuidigeDatum();
    const avond: Speelavond = {
      datum,
      aanwezigen,
      gasten,
      borden,
    };

    setLaatsteOpslag(datum);
    slaSpeelavondOp(avond);
    void repository.addToHistorie(avond);
    setHistorie(laadHistorie());
    alert("Speelavond opgeslagen!");
  }, [aanwezigen, borden, gasten]);

  const nieuweAvond = useCallback(() => {
    if (
      !confirm("Weet je zeker dat je een nieuwe speelavond wilt starten?")
    ) {
      return;
    }

    if (aanwezigen.length > 0 || gasten.length > 0 || borden.length > 0) {
      const huidig: Speelavond = {
        datum: laatsteOpslag || maakHuidigeDatum(),
        aanwezigen,
        gasten,
        borden,
      };
      if (borden.length > 0) {
        void repository.addToHistorie(huidig);
        setHistorie(laadHistorie());
      }
    }

    const leeg = maakLegeSpeelavond();
    setAanwezigen(leeg.aanwezigen);
    setGasten(leeg.gasten);
    setGastNaam("");
    setBorden(leeg.borden);
    setLaatsteOpslag(leeg.datum);
    verwijderSpeelavond();
  }, [aanwezigen, borden, gasten, laatsteOpslag]);

  const printSchema = useCallback(() => {
    window.print();
  }, []);

  const dashboardStats = useMemo(
    () => berekenDashboardStats(aanwezigen, gasten, borden),
    [aanwezigen, borden, gasten]
  );

  const statistieken = useMemo(
    () => berekenStatistieken(historie),
    [historie]
  );

  const value = useMemo<SpeelavondContextValue>(
    () => ({
      leden: CLUB_LEDEN,
      aanwezigen,
      gasten,
      gastNaam,
      borden,
      laatsteOpslag,
      laatsteOpslagLabel: formatDatum(laatsteOpslag),
      dashboardStats,
      statistieken,
      isGeladen,
      setGastNaam,
      toggleLid,
      selecteerAlleLeden,
      deselecteerAlleLeden,
      voegGastToe,
      verwijderGast,
      genereerCompetitieAvond,
      opslaan,
      nieuweAvond,
      printSchema,
    }),
    [
      aanwezigen,
      borden,
      dashboardStats,
      gastNaam,
      gasten,
      isGeladen,
      laatsteOpslag,
      statistieken,
      deselecteerAlleLeden,
      genereerCompetitieAvond,
      nieuweAvond,
      opslaan,
      printSchema,
      selecteerAlleLeden,
      toggleLid,
      verwijderGast,
      voegGastToe,
    ]
  );

  return (
    <SpeelavondContext.Provider value={value}>
      {children}
    </SpeelavondContext.Provider>
  );
}

export function useSpeelavond(): SpeelavondContextValue {
  const context = useContext(SpeelavondContext);
  if (!context) {
    throw new Error("useSpeelavond moet binnen SpeelavondProvider gebruikt worden.");
  }
  return context;
}
