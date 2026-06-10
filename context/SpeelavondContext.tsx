"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  berekenDashboardStats,
  genereerCompetitie,
  normaliseerBorden,
  updateWedstrijdInBord,
} from "@/lib/competition";
import {
  hernoemLid,
  laadLeden,
  verwijderLid,
  voegLidToe,
} from "@/lib/leden";
import { createLocalSpeelavondRepository } from "@/lib/services/speelavond.service";
import { berekenStand } from "@/lib/standings";
import {
  berekenGrafieken,
  berekenStatistieken,
  haalHuidigSeizoen,
  haalKomendeVrijdag,
} from "@/lib/statistics";
import {
  formatDatum,
  formatDatumAlleen,
  laadHistorie,
  laadSpeelavond,
  maakHuidigeDatum,
  maakLegeSpeelavond,
  slaSpeelavondOp,
  verwijderSpeelavond,
  verwijderUitHistorie,
  voegToeAanHistorie,
} from "@/lib/storage";
import type {
  Bord,
  DashboardStatistieken,
  Speelavond,
  SpeelavondStatistieken,
  SpelerStand,
  StatistiekGrafieken,
} from "@/types/competition";

interface SpeelavondContextValue {
  leden: string[];
  aanwezigen: string[];
  gasten: string[];
  gastNaam: string;
  borden: Bord[];
  historie: Speelavond[];
  laatsteOpslag: string;
  laatsteOpslagLabel: string;
  speelDatumLabel: string;
  dashboardStats: DashboardStatistieken;
  statistieken: SpeelavondStatistieken;
  grafieken: StatistiekGrafieken;
  stand: SpelerStand[];
  huidigSeizoen: string;
  komendeSpeelavond: string;
  isGeladen: boolean;
  printPreviewOpen: boolean;
  setGastNaam: (naam: string) => void;
  toggleLid: (naam: string) => void;
  selecteerAlleLeden: () => void;
  deselecteerAlleLeden: () => void;
  voegGastToe: () => void;
  verwijderGast: (naam: string) => void;
  voegLidToe: (naam: string) => void;
  hernoemLid: (oudeNaam: string, nieuweNaam: string) => void;
  verwijderLid: (naam: string) => void;
  genereerCompetitieAvond: () => void;
  updateWedstrijd: (
    bordNaam: string,
    wedstrijdId: string,
    updates: { gespeeld?: boolean; score1?: number; score2?: number }
  ) => void;
  opslaan: () => void;
  nieuweAvond: () => void;
  openPrintPreview: () => void;
  sluitPrintPreview: () => void;
  printSchema: () => void;
  exportPdf: () => void;
  laadAvondUitHistorie: (datum: string) => void;
  verwijderAvondUitHistorie: (datum: string) => void;
  printAvondUitHistorie: (datum: string) => void;
  avondVoorPrint: Speelavond;
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
    borden: normaliseerBorden(avond.borden),
    laatsteOpslag: avond.datum,
  };
}

export function SpeelavondProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [leden, setLeden] = useState<string[]>([]);
  const [aanwezigen, setAanwezigen] = useState<string[]>([]);
  const [gasten, setGasten] = useState<string[]>([]);
  const [gastNaam, setGastNaam] = useState("");
  const [borden, setBorden] = useState<Bord[]>([]);
  const [laatsteOpslag, setLaatsteOpslag] = useState("");
  const [isGeladen, setIsGeladen] = useState(false);
  const [historie, setHistorie] = useState<Speelavond[]>([]);
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [printAvond, setPrintAvond] = useState<Speelavond | null>(null);

  useEffect(() => {
    const opgeslagen = laadSpeelavond();
    /* eslint-disable react-hooks/set-state-in-effect -- localStorage hydratie na client mount */
    setLeden(laadLeden());
    if (opgeslagen) {
      const state = syncState(opgeslagen);
      setAanwezigen(state.aanwezigen);
      setGasten(state.gasten);
      setBorden(state.borden);
      setLaatsteOpslag(state.laatsteOpslag);
    }
    setHistorie(
      laadHistorie().map((avond) => ({
        ...avond,
        borden: normaliseerBorden(avond.borden),
      }))
    );
    setIsGeladen(true);
    /* eslint-enable react-hooks/set-state-in-effect */
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
    const alle = [...leden];
    setAanwezigen(alle);
    persist({ aanwezigen: alle });
  }, [leden, persist]);

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

  const handleVoegLidToe = useCallback(
    (naam: string) => {
      const nieuw = voegLidToe(naam, leden);
      setLeden(nieuw);
    },
    [leden]
  );

  const handleHernoemLid = useCallback(
    (oudeNaam: string, nieuweNaam: string) => {
      const nieuw = hernoemLid(oudeNaam, nieuweNaam, leden);
      setLeden(nieuw);
      setAanwezigen((h) => {
        const bijgewerkt = h.map((n) => (n === oudeNaam ? nieuweNaam.trim() : n));
        persist({ aanwezigen: bijgewerkt });
        return bijgewerkt;
      });
    },
    [leden, persist]
  );

  const handleVerwijderLid = useCallback(
    (naam: string) => {
      const nieuw = verwijderLid(naam, leden);
      setLeden(nieuw);
      setAanwezigen((h) => {
        const bijgewerkt = h.filter((n) => n !== naam);
        persist({ aanwezigen: bijgewerkt });
        return bijgewerkt;
      });
    },
    [leden, persist]
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

  const updateWedstrijd = useCallback(
    (
      bordNaam: string,
      wedstrijdId: string,
      updates: { gespeeld?: boolean; score1?: number; score2?: number }
    ) => {
      setBorden((huidig) => {
        const nieuw = huidig.map((bord) =>
          bord.naam === bordNaam
            ? updateWedstrijdInBord(bord, wedstrijdId, updates)
            : bord
        );
        persist({ borden: nieuw });
        return nieuw;
      });
    },
    [persist]
  );

  const opslaan = useCallback(() => {
    const datum = laatsteOpslag || maakHuidigeDatum();
    const avond: Speelavond = {
      datum,
      aanwezigen,
      gasten,
      borden,
    };

    setLaatsteOpslag(datum);
    slaSpeelavondOp(avond);
    void repository.addToHistorie(avond);
    setHistorie(
      laadHistorie().map((a) => ({
        ...a,
        borden: normaliseerBorden(a.borden),
      }))
    );
    alert("Speelavond opgeslagen!");
  }, [aanwezigen, borden, gasten, laatsteOpslag]);

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
        setHistorie(
          laadHistorie().map((a) => ({
            ...a,
            borden: normaliseerBorden(a.borden),
          }))
        );
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

  const huidigeAvondVoorPrint = useMemo(
    (): Speelavond => ({
      datum: laatsteOpslag || maakHuidigeDatum(),
      aanwezigen,
      gasten,
      borden,
    }),
    [aanwezigen, borden, gasten, laatsteOpslag]
  );

  const printSchema = useCallback(() => {
    setPrintPreviewOpen(false);
    requestAnimationFrame(() => {
      window.print();
      setPrintAvond(null);
    });
  }, []);

  const exportPdf = useCallback(() => {
    setPrintPreviewOpen(false);
    requestAnimationFrame(() => {
      window.print();
      setPrintAvond(null);
    });
  }, []);

  const openPrintPreview = useCallback(() => {
    setPrintAvond(null);
    setPrintPreviewOpen(true);
  }, []);

  const sluitPrintPreview = useCallback(() => {
    setPrintPreviewOpen(false);
    setPrintAvond(null);
  }, []);

  const laadAvondUitHistorie = useCallback((datum: string) => {
    const avond = laadHistorie().find((a) => a.datum === datum);
    if (!avond) return;

    const state = syncState(avond);
    setAanwezigen(state.aanwezigen);
    setGasten(state.gasten);
    setBorden(state.borden);
    setLaatsteOpslag(state.laatsteOpslag);
    slaSpeelavondOp(avond);
  }, []);

  const verwijderAvondUitHistorie = useCallback((datum: string) => {
    if (!confirm("Weet je zeker dat je deze speelavond wilt verwijderen?")) {
      return;
    }
    verwijderUitHistorie(datum);
    setHistorie(
      laadHistorie().map((a) => ({
        ...a,
        borden: normaliseerBorden(a.borden),
      }))
    );
  }, []);

  const printAvondUitHistorie = useCallback((datum: string) => {
    const avond = laadHistorie().find((a) => a.datum === datum);
    if (!avond) return;
    setPrintAvond({
      ...avond,
      borden: normaliseerBorden(avond.borden),
    });
    setPrintPreviewOpen(false);
    requestAnimationFrame(() => window.print());
  }, []);

  const dashboardStats = useMemo(
    () => berekenDashboardStats(aanwezigen, gasten, borden),
    [aanwezigen, borden, gasten]
  );

  const statistieken = useMemo(
    () => berekenStatistieken(historie),
    [historie]
  );

  const grafieken = useMemo(
    () => berekenGrafieken(historie),
    [historie]
  );

  const stand = useMemo(
    () => berekenStand(historie, borden),
    [historie, borden]
  );

  const avondVoorPrint = printAvond ?? huidigeAvondVoorPrint;

  const value = useMemo<SpeelavondContextValue>(
    () => ({
      leden,
      aanwezigen,
      gasten,
      gastNaam,
      borden,
      historie,
      laatsteOpslag,
      laatsteOpslagLabel: formatDatum(laatsteOpslag),
      speelDatumLabel: formatDatumAlleen(laatsteOpslag),
      dashboardStats,
      statistieken,
      grafieken,
      stand,
      huidigSeizoen: haalHuidigSeizoen(),
      komendeSpeelavond: haalKomendeVrijdag(),
      isGeladen,
      printPreviewOpen,
      setGastNaam,
      toggleLid,
      selecteerAlleLeden,
      deselecteerAlleLeden,
      voegGastToe,
      verwijderGast,
      voegLidToe: handleVoegLidToe,
      hernoemLid: handleHernoemLid,
      verwijderLid: handleVerwijderLid,
      genereerCompetitieAvond,
      updateWedstrijd,
      opslaan,
      nieuweAvond,
      openPrintPreview,
      sluitPrintPreview,
      printSchema,
      exportPdf,
      laadAvondUitHistorie,
      verwijderAvondUitHistorie,
      printAvondUitHistorie,
      avondVoorPrint,
    }),
    [
      leden,
      aanwezigen,
      borden,
      dashboardStats,
      gastNaam,
      gasten,
      grafieken,
      historie,
      isGeladen,
      laatsteOpslag,
      printPreviewOpen,
      stand,
      statistieken,
      deselecteerAlleLeden,
      exportPdf,
      genereerCompetitieAvond,
      handleHernoemLid,
      handleVerwijderLid,
      handleVoegLidToe,
      laadAvondUitHistorie,
      nieuweAvond,
      openPrintPreview,
      opslaan,
      printAvondUitHistorie,
      printSchema,
      selecteerAlleLeden,
      sluitPrintPreview,
      toggleLid,
      updateWedstrijd,
      verwijderAvondUitHistorie,
      verwijderGast,
      voegGastToe,
      avondVoorPrint,
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
