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
  heeftTeVeelBorden,
  hernoemSpelerInBorden,
  MAX_BORDEN_PER_AVOND,
  MAX_SPELERS_PER_AVOND,
  normaliseerBord,
  normaliseerSpeelavond,
  updateWedstrijdInBord,
  verplaatsSpeler,
  type WedstrijdUpdate,
} from "@/lib/competition";
import { logAuditActie } from "@/lib/audit-log";
import { broadcastReload, initRealtimeSync } from "@/lib/realtime";
import { hernoemSpelerInData } from "@/lib/storage";
import { useUndoStack } from "@/context/useUndoStack";
import { usePrintState } from "@/context/usePrintState";
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
import { confirmDialog, toast } from "@/lib/ui-feedback";
import {
  consumeBordenMigratieWaarschuwing,
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
  canUndo: boolean;
  undoLaatsteActie: () => void;
  verplaatsSpeler: (speler: string, vanBord: string, naarBord: string) => void;
  notities: string;
  setNotities: (notities: string) => void;
  genereerCompetitieOpnieuw: (seed?: number) => void;
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
    notities: genormaliseerd.notities ?? "",
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
    notities?: string;
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
    notities: state.notities,
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
  const [notities, setNotitiesState] = useState("");
  const [aanmeldBaseUrl, setAanmeldBaseUrl] = useState("");
  const { push: pushUndo, undo: popUndo, canUndo } = useUndoStack();
  const {
    printPreviewOpen,
    printAvond,
    setPrintAvond,
    openPrintPreview,
    sluitPrintPreview,
    printSchema,
    exportPdf,
  } = usePrintState();

  const reloadFromStorage = useCallback(() => {
    const avond = laadSpeelavond();
    if (avond) {
      const state = syncState(avond);
      setAanwezigen(state.aanwezigen);
      setGasten(state.gasten);
      setBorden(state.borden);
      setLaatsteOpslag(state.laatsteOpslag);
      setAanmeldToken(state.aanmeldToken);
      setNotitiesState(state.notities);
      if (state.seizoen) setActiefSeizoenState(state.seizoen);
    }
    setHistorie(laadHistorie());
  }, []);

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
      setNotitiesState(state.notities);
    }
    setHistorie(laadHistorie());
    setAanmeldBaseUrl(window.location.origin);
    setIsGeladen(true);
    if (consumeBordenMigratieWaarschuwing()) {
      toast(
        `Oude competitie gevonden — genereer opnieuw (max ${MAX_BORDEN_PER_AVOND} borden)`,
        "info"
      );
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    return initRealtimeSync(reloadFromStorage);
  }, [reloadFromStorage]);

  useEffect(() => {
    const syncVanStorage = reloadFromStorage;
    window.addEventListener("focus", syncVanStorage);
    return () => window.removeEventListener("focus", syncVanStorage);
  }, [reloadFromStorage]);

  const persist = useCallback(
    (updates: Partial<Speelavond>) => {
      const huidig = bouwAvond({
        datum: laatsteOpslag,
        seizoen: actiefSeizoen,
        aanwezigen,
        gasten,
        borden,
        aanmeldToken,
        notities,
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
    [aanwezigen, actiefSeizoen, aanmeldToken, borden, gasten, laatsteOpslag, notities]
  );

  useEffect(() => {
    if (!isGeladen || !heeftTeVeelBorden(borden)) return;
    setBorden([]);
    persist({ borden: [] });
    toast(
      `Competitie gewist — maximaal ${MAX_BORDEN_PER_AVOND} borden. Genereer opnieuw.`,
      "info"
    );
  }, [isGeladen, borden, persist]);

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
      setGasten((g) => g.map((n) => (n === oudeNaam ? nieuweNaam.trim() : n)));
      setBorden((b) => {
        const bijgewerkt = hernoemSpelerInBorden(b, oudeNaam, nieuweNaam.trim());
        persist({ borden: bijgewerkt });
        return bijgewerkt;
      });
      hernoemSpelerInData(oudeNaam, nieuweNaam.trim());
      logAuditActie("Lid hernoemd", `${oudeNaam} → ${nieuweNaam.trim()}`);
      broadcastReload();
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

  const genereerCompetitieOpnieuw = useCallback(
    (seed?: number) => {
      const spelers = [...aanwezigen, ...gasten];
      if (spelers.length < 3) {
        toast("Minimaal 3 spelers nodig voor een competitie.", "error");
        return;
      }
      if (spelers.length > MAX_SPELERS_PER_AVOND) {
        toast(`Maximaal ${MAX_SPELERS_PER_AVOND} spelers per speelavond.`, "error");
        return;
      }
      const seizoenHistorie = filterOpSeizoen(laadHistorie(), actiefSeizoen);
      const nieuweBorden = genereerCompetitie(spelers, seizoenHistorie, seed);
      if (!nieuweBorden) {
        toast("Kon geen geldige bordverdeling maken voor dit aantal spelers.", "error");
        return;
      }
      if (borden.length > 0) {
        pushUndo({ type: "borden", borden });
      }
      setBorden(nieuweBorden);
      persist({ borden: nieuweBorden });
      logAuditActie("Competitie gegenereerd", `${spelers.length} spelers, ${nieuweBorden.length} borden`);
      toast("Competitie gegenereerd!", "success");
    },
    [aanwezigen, actiefSeizoen, borden, gasten, persist, pushUndo]
  );

  const genereerCompetitieAvond = useCallback(async () => {
    if (borden.length > 0) {
      const bevestigd = await confirmDialog({
        title: "Competitie opnieuw genereren?",
        message:
          "Bestaande borden en uitslagen worden overschreven. Je kunt dit ongedaan maken.",
        confirmLabel: "Opnieuw genereren",
        destructive: true,
      });
      if (!bevestigd) return;
    }
    genereerCompetitieOpnieuw();
  }, [borden.length, genereerCompetitieOpnieuw]);

  const updateWedstrijd = useCallback(
    (bordNaam: string, wedstrijdId: string, updates: WedstrijdUpdate) => {
      setBorden((huidig) => {
        const bord = huidig.find((b) => b.naam === bordNaam);
        if (bord) {
          pushUndo({
            type: "wedstrijd",
            bordNaam,
            wedstrijdId,
            snapshot: normaliseerBord(bord),
          });
        }
        const nieuw = huidig.map((b) =>
          b.naam === bordNaam
            ? updateWedstrijdInBord(b, wedstrijdId, updates)
            : b
        );
        persist({ borden: nieuw });
        broadcastReload();
        return nieuw;
      });
    },
    [persist, pushUndo]
  );

  const undoLaatsteActie = useCallback(() => {
    const actie = popUndo();
    if (!actie) return;
    if (actie.type === "borden") {
      setBorden(actie.borden);
      persist({ borden: actie.borden });
      toast("Competitie hersteld.", "info");
    } else {
      setBorden((huidig) => {
        const nieuw = huidig.map((b) =>
          b.naam === actie.bordNaam ? actie.snapshot : b
        );
        persist({ borden: nieuw });
        return nieuw;
      });
      toast("Uitslag hersteld.", "info");
    }
    broadcastReload();
  }, [persist, popUndo]);

  const handleVerplaatsSpeler = useCallback(
    (speler: string, vanBord: string, naarBord: string) => {
      setBorden((huidig) => {
        const nieuw = verplaatsSpeler(huidig, speler, vanBord, naarBord);
        if (!nieuw) {
          toast("Speler verplaatsen mislukt (bord vol of te klein).", "error");
          return huidig;
        }
        pushUndo({ type: "borden", borden: huidig });
        persist({ borden: nieuw });
        logAuditActie("Speler verplaatst", `${speler}: ${vanBord} → ${naarBord}`);
        toast(`${speler} verplaatst naar ${naarBord}.`, "success");
        return nieuw;
      });
    },
    [persist, pushUndo]
  );

  const setNotities = useCallback(
    (tekst: string) => {
      setNotitiesState(tekst);
      persist({ notities: tekst });
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
    toast("Speelavond opgeslagen!", "success");
    logAuditActie("Speelavond opgeslagen", formatDatum(datum));
    broadcastReload();
  }, [aanwezigen, actiefSeizoen, aanmeldToken, borden, gasten, laatsteOpslag]);

  const nieuweAvond = useCallback(async () => {
    const bevestigd = await confirmDialog({
      title: "Nieuwe speelavond",
      message: "Weet je zeker dat je een nieuwe speelavond wilt starten?",
      confirmLabel: "Nieuwe avond starten",
      destructive: true,
    });
    if (!bevestigd) return;
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

  const laadAvondUitHistorie = useCallback((datum: string) => {
    const raw = laadHistorie().find((a) => a.datum === datum);
    if (!raw) return;
    const genormaliseerd = normaliseerSpeelavond(raw);
    const state = syncState(genormaliseerd);
    setAanwezigen(state.aanwezigen);
    setGasten(state.gasten);
    setBorden(state.borden);
    setLaatsteOpslag(state.laatsteOpslag);
    setAanmeldToken(state.aanmeldToken);
    slaSpeelavondOp(genormaliseerd);
    if (heeftTeVeelBorden(raw.borden)) {
      toast(
        `Oude avond had te veel borden — genereer opnieuw (max ${MAX_BORDEN_PER_AVOND})`,
        "info"
      );
    }
  }, []);

  const verwijderAvondUitHistorie = useCallback(async (datum: string) => {
    const bevestigd = await confirmDialog({
      title: "Speelavond verwijderen",
      message: "Weet je zeker dat je deze speelavond wilt verwijderen?",
      confirmLabel: "Verwijderen",
      destructive: true,
    });
    if (!bevestigd) return;
    verwijderUitHistorie(datum);
    setHistorie(laadHistorie());
    toast("Speelavond verwijderd.", "success");
  }, []);

  const printAvondUitHistorie = useCallback((datum: string) => {
    const avond = laadHistorie().find((a) => a.datum === datum);
    if (!avond) return;
    setPrintAvond(normaliseerSpeelavond(avond));
    sluitPrintPreview();
    requestAnimationFrame(() => window.print());
  }, [setPrintAvond, sluitPrintPreview]);

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
        notities,
      }),
    [aanwezigen, actiefSeizoen, aanmeldToken, borden, gasten, laatsteOpslag, notities]
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
      canUndo,
      undoLaatsteActie,
      verplaatsSpeler: handleVerplaatsSpeler,
      notities,
      setNotities,
      genereerCompetitieOpnieuw,
    }),
    [
      leden,
      aanwezigen,
      actiefSeizoen,
      aanmeldToken,
      aanmeldUrl,
      avondVoorPrint,
      borden,
      canUndo,
      clubRecords,
      dashboardStats,
      gastNaam,
      gasten,
      genereerCompetitieOpnieuw,
      grafieken,
      handleVerplaatsSpeler,
      historie,
      isGeladen,
      laatsteOpslag,
      notities,
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
      setNotities,
      sluitPrintPreview,
      startAanmelden,
      stopAanmelden,
      toggleLid,
      undoLaatsteActie,
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
