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
  normaliseerSpeelavond,
  updateWedstrijdInBord,
  type WedstrijdUpdate,
} from "@/lib/competition";
import {
  hernoemLid,
  laadLeden,
  verwijderLid,
  voegLidToe,
} from "@/lib/leden";
import { berekenSpelerVanDeAvond } from "@/lib/player-of-evening";
import { berekenClubRecords } from "@/lib/records";
import {
  filterOpSeizoen,
  laadActiefSeizoen,
  seizoenLabel,
  slaActiefSeizoenOp,
} from "@/lib/seasons";
import { createLocalSpeelavondRepository } from "@/lib/services/speelavond.service";
import { berekenStand } from "@/lib/standings";
import {
  berekenGrafieken,
  berekenStatistieken,
  haalKomendeVrijdag,
} from "@/lib/statistics";
import {
  formatDatum,
  formatDatumAlleen,
  genereerAanmeldToken,
  laadHistorie,
  laadSpeelavond,
  maakHuidigeDatum,
  maakLegeSpeelavond,
  slaAanmeldSessieOp,
  slaSpeelavondOp,
  verwijderAanmeldSessie,
  verwijderSpeelavond,
  verwijderUitHistorie,
  voegToeAanHistorie,
} from "@/lib/storage";
import type {
  Bord,
  ClubRecords,
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
  seizoenHistorie: Speelavond[];
  actiefSeizoen: string;
  actiefSeizoenLabel: string;
  laatsteOpslag: string;
  laatsteOpslagLabel: string;
  speelDatumLabel: string;
  dashboardStats: DashboardStatistieken;
  statistieken: SpeelavondStatistieken;
  grafieken: StatistiekGrafieken;
  stand: SpelerStand[];
  clubRecords: ClubRecords;
  spelerVanDeAvond: string | null;
  aanmeldToken: string | null;
  aanmeldUrl: string;
  komendeSpeelavond: string;
  isGeladen: boolean;
  printPreviewOpen: boolean;
  setGastNaam: (naam: string) => void;
  setActiefSeizoen: (seizoenId: string) => void;
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
    updates: WedstrijdUpdate
  ) => void;
  opslaan: () => void;
  nieuweAvond: () => void;
  startAanmelden: () => void;
  stopAanmelden: () => void;
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
  const genormaliseerd = normaliseerSpeelavond(avond);
  return {
    aanwezigen: genormaliseerd.aanwezigen,
    gasten: genormaliseerd.gasten,
    borden: genormaliseerd.borden,
    laatsteOpslag: genormaliseerd.datum,
    seizoen: genormaliseerd.seizoen,
    aanmeldToken: genormaliseerd.aanmeldToken,
  };
}

function bouwAvond(
  state: {
    datum: string;
    seizoen: string;
    aanwezigen: string[];
    gasten: string[];
    borden: Bord[];
    aanmeldToken: string | null;
  }
): Speelavond {
  const spelerVanDeAvond = berekenSpelerVanDeAvond(state.borden);
  return normaliseerSpeelavond({
    datum: state.datum,
    seizoen: state.seizoen,
    aanwezigen: state.aanwezigen,
    gasten: state.gasten,
    borden: state.borden,
    spelerVanDeAvond,
    aanmeldToken: state.aanmeldToken,
  });
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
  const [actiefSeizoen, setActiefSeizoenState] = useState("");
  const [aanmeldToken, setAanmeldToken] = useState<string | null>(null);
  const [isGeladen, setIsGeladen] = useState(false);
  const [historie, setHistorie] = useState<Speelavond[]>([]);
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [printAvond, setPrintAvond] = useState<Speelavond | null>(null);
  const [aanmeldBaseUrl, setAanmeldBaseUrl] = useState("");

  useEffect(() => {
    const opgeslagen = laadSpeelavond();
    const seizoen = laadActiefSeizoen();
    /* eslint-disable react-hooks/set-state-in-effect -- localStorage hydratie na client mount */
    setLeden(laadLeden());
    setActiefSeizoenState(seizoen);
    if (opgeslagen) {
      const state = syncState(opgeslagen);
      setAanwezigen(state.aanwezigen);
      setGasten(state.gasten);
      setBorden(state.borden);
      setLaatsteOpslag(state.laatsteOpslag);
      setAanmeldToken(state.aanmeldToken);
      if (state.seizoen) setActiefSeizoenState(state.seizoen);
    }
    setHistorie(laadHistorie());
    setAanmeldBaseUrl(window.location.origin);
    setIsGeladen(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    const syncVanStorage = () => {
      const avond = laadSpeelavond();
      if (!avond) return;
      setAanwezigen(avond.aanwezigen);
      setGasten(avond.gasten);
    };
    window.addEventListener("storage", syncVanStorage);
    window.addEventListener("focus", syncVanStorage);
    return () => {
      window.removeEventListener("storage", syncVanStorage);
      window.removeEventListener("focus", syncVanStorage);
    };
  }, []);

  const persist = useCallback(
    (updates: Partial<Speelavond>) => {
      const huidig = bouwAvond({
        datum: laatsteOpslag,
        seizoen: actiefSeizoen,
        aanwezigen,
        gasten,
        borden,
        aanmeldToken,
        ...updates,
      });
      slaSpeelavondOp(huidig);
      if (huidig.aanmeldToken) {
        slaAanmeldSessieOp({
          token: huidig.aanmeldToken,
          seizoen: huidig.seizoen,
          aanwezigen: huidig.aanwezigen,
          gestart: new Date().toISOString(),
        });
      }
      return huidig;
    },
    [aanwezigen, actiefSeizoen, aanmeldToken, borden, gasten, laatsteOpslag]
  );

  const setActiefSeizoen = useCallback((seizoenId: string) => {
    setActiefSeizoenState(seizoenId);
    slaActiefSeizoenOp(seizoenId);
  }, []);

  const toggleLid = useCallback(
    (naam: string) => {
      setAanwezigen((huidig) => {
        const nieuw = huidig.includes(naam)
          ? huidig.filter((s) => s !== naam)
          : [...huidig, naam];
        persist({ aanwezigen: nieuw });
        return nieuw;
      });
    },
    [persist]
  );

  const selecteerAlleLeden = useCallback(() => {
    setAanwezigen([...leden]);
    persist({ aanwezigen: [...leden] });
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
        const nieuw = huidig.filter((g) => g !== naam);
        persist({ gasten: nieuw });
        return nieuw;
      });
    },
    [persist]
  );

  const handleVoegLidToe = useCallback((naam: string) => {
    setLeden(voegLidToe(naam, leden));
  }, [leden]);

  const handleHernoemLid = useCallback(
    (oudeNaam: string, nieuweNaam: string) => {
      setLeden(hernoemLid(oudeNaam, nieuweNaam, leden));
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
      setLeden(verwijderLid(naam, leden));
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
    if (spelers.length > 32) {
      alert("Maximaal 32 spelers per speelavond.");
      return;
    }
    const seizoenHistorie = filterOpSeizoen(laadHistorie(), actiefSeizoen);
    const nieuweBorden = genereerCompetitie(spelers, seizoenHistorie);
    if (!nieuweBorden) {
      alert("Kon geen geldige bordverdeling maken voor dit aantal spelers.");
      return;
    }
    setBorden(nieuweBorden);
    persist({ borden: nieuweBorden });
  }, [aanwezigen, actiefSeizoen, gasten, persist]);

  const updateWedstrijd = useCallback(
    (bordNaam: string, wedstrijdId: string, updates: WedstrijdUpdate) => {
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
    const avond = bouwAvond({
      datum,
      seizoen: actiefSeizoen,
      aanwezigen,
      gasten,
      borden,
      aanmeldToken,
    });
    setLaatsteOpslag(datum);
    slaSpeelavondOp(avond);
    void repository.addToHistorie(avond);
    setHistorie(laadHistorie());
    alert("Speelavond opgeslagen!");
  }, [aanwezigen, actiefSeizoen, aanmeldToken, borden, gasten, laatsteOpslag]);

  const nieuweAvond = useCallback(() => {
    if (!confirm("Weet je zeker dat je een nieuwe speelavond wilt starten?")) {
      return;
    }
    if (aanwezigen.length > 0 || gasten.length > 0 || borden.length > 0) {
      const huidig = bouwAvond({
        datum: laatsteOpslag || maakHuidigeDatum(),
        seizoen: actiefSeizoen,
        aanwezigen,
        gasten,
        borden,
        aanmeldToken,
      });
      if (borden.length > 0) {
        void repository.addToHistorie(huidig);
        setHistorie(laadHistorie());
      }
    }
    const leeg = maakLegeSpeelavond(actiefSeizoen);
    setAanwezigen(leeg.aanwezigen);
    setGasten(leeg.gasten);
    setGastNaam("");
    setBorden(leeg.borden);
    setLaatsteOpslag(leeg.datum);
    setAanmeldToken(null);
    verwijderSpeelavond();
    verwijderAanmeldSessie();
  }, [aanwezigen, actiefSeizoen, aanmeldToken, borden, gasten, laatsteOpslag]);

  const startAanmelden = useCallback(() => {
    const token = genereerAanmeldToken();
    setAanmeldToken(token);
    persist({ aanmeldToken: token });
  }, [persist]);

  const stopAanmelden = useCallback(() => {
    setAanmeldToken(null);
    persist({ aanmeldToken: null });
    verwijderAanmeldSessie();
  }, [persist]);

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
    setAanmeldToken(state.aanmeldToken);
    slaSpeelavondOp(avond);
  }, []);

  const verwijderAvondUitHistorie = useCallback((datum: string) => {
    if (!confirm("Weet je zeker dat je deze speelavond wilt verwijderen?")) {
      return;
    }
    verwijderUitHistorie(datum);
    setHistorie(laadHistorie());
  }, []);

  const printAvondUitHistorie = useCallback((datum: string) => {
    const avond = laadHistorie().find((a) => a.datum === datum);
    if (!avond) return;
    setPrintAvond(normaliseerSpeelavond(avond));
    setPrintPreviewOpen(false);
    requestAnimationFrame(() => window.print());
  }, []);

  const seizoenHistorie = useMemo(
    () => filterOpSeizoen(historie, actiefSeizoen),
    [historie, actiefSeizoen]
  );

  const dashboardStats = useMemo(
    () => berekenDashboardStats(aanwezigen, gasten, borden, leden.length),
    [aanwezigen, borden, gasten, leden.length]
  );

  const statistieken = useMemo(
    () => berekenStatistieken(seizoenHistorie),
    [seizoenHistorie]
  );

  const grafieken = useMemo(
    () => berekenGrafieken(seizoenHistorie),
    [seizoenHistorie]
  );

  const stand = useMemo(
    () => berekenStand(seizoenHistorie, borden),
    [seizoenHistorie, borden]
  );

  const clubRecords = useMemo(
    () => berekenClubRecords(seizoenHistorie, borden),
    [seizoenHistorie, borden]
  );

  const spelerVanDeAvond = useMemo(
    () => berekenSpelerVanDeAvond(borden),
    [borden]
  );

  const huidigeAvondVoorPrint = useMemo(
    () =>
      bouwAvond({
        datum: laatsteOpslag || maakHuidigeDatum(),
        seizoen: actiefSeizoen,
        aanwezigen,
        gasten,
        borden,
        aanmeldToken,
      }),
    [aanwezigen, actiefSeizoen, aanmeldToken, borden, gasten, laatsteOpslag]
  );

  const avondVoorPrint = printAvond ?? huidigeAvondVoorPrint;
  const aanmeldUrl = aanmeldToken
    ? `${aanmeldBaseUrl}/aanmelden?t=${aanmeldToken}`
    : "";

  const value = useMemo<SpeelavondContextValue>(
    () => ({
      leden,
      aanwezigen,
      gasten,
      gastNaam,
      borden,
      historie,
      seizoenHistorie,
      actiefSeizoen,
      actiefSeizoenLabel: seizoenLabel(actiefSeizoen),
      laatsteOpslag,
      laatsteOpslagLabel: formatDatum(laatsteOpslag),
      speelDatumLabel: formatDatumAlleen(laatsteOpslag),
      dashboardStats,
      statistieken,
      grafieken,
      stand,
      clubRecords,
      spelerVanDeAvond,
      aanmeldToken,
      aanmeldUrl,
      komendeSpeelavond: haalKomendeVrijdag(),
      isGeladen,
      printPreviewOpen,
      setGastNaam,
      setActiefSeizoen,
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
      startAanmelden,
      stopAanmelden,
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
      actiefSeizoen,
      aanmeldToken,
      aanmeldUrl,
      avondVoorPrint,
      borden,
      clubRecords,
      dashboardStats,
      gastNaam,
      gasten,
      grafieken,
      historie,
      isGeladen,
      laatsteOpslag,
      printPreviewOpen,
      seizoenHistorie,
      spelerVanDeAvond,
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
      setActiefSeizoen,
      sluitPrintPreview,
      startAanmelden,
      stopAanmelden,
      toggleLid,
      updateWedstrijd,
      verwijderAvondUitHistorie,
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
