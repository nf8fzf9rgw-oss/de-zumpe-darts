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
  verwijderSpelerUitBorden,
  type WedstrijdUpdate,
} from "@/lib/competition";
import {
  CLUB_LEDEN_DEFAULT,
  hernoemLid,
  laadLeden,
  verwijderLid,
  voegLidToe,
} from "@/lib/leden";
import { namenZijnGelijk } from "@/lib/namen";
import { berekenSpelerVanDeAvond } from "@/lib/player-of-evening";
import { wisOpgeslagenSpelerKoppeling } from "@/lib/player-utils";
import { berekenClubRecords } from "@/lib/records";
import { avondIsVol, pasAvondLimietToe } from "@/lib/avond-limiet";
import {
  filterOpSeizoen,
  laadActiefSeizoen,
  laadSeizoenen,
  seizoenLabel,
  slaActiefSeizoenOp,
  STANDAARD_SEIZOEN_ID,
  verwijderSeizoen as verwijderSeizoenUitOpslag,
  voegSeizoenToe as voegSeizoenToeAanOpslag,
} from "@/lib/seasons";
import { createLocalSpeelavondRepository } from "@/lib/services/speelavond.service";
import {
  genereerWinnaarsVerliezersRonde,
  pouleBordenVoltooid,
} from "@/lib/knockout";
import { berekenStand } from "@/lib/standings";
import {
  berekenGrafieken,
  berekenStatistieken,
  haalKomendeVrijdag,
} from "@/lib/statistics";
import { confirmDialog, toast } from "@/lib/ui-feedback";
import {
  heeftSpeelavondGegevens,
  isOpenbarePeriodeActief,
  moetNieuweOpenbareSessieStarten,
  nieuwOpenbaarVenster,
  zorgVoorOpenbaarVenster,
} from "@/lib/avond-status";
import {
  consumeBordenMigratieWaarschuwing,
  formatDatum,
  formatDatumAlleen,
  genereerAanmeldToken,
  hernoemSpelerInData,
  laadHistorie,
  laadSpeelavond,
  maakHuidigeDatum,
  maakLegeSpeelavond,
  migreerOfficieleSpelersnamen,
  slaAanmeldSessieOp,
  slaSpeelavondOp,
  verwijderAanmeldSessie,
  verwijderSpeelavond,
  verwijderUitHistorie,
  voegToeAanHistorie,
} from "@/lib/storage";
import { logAuditActie } from "@/lib/audit-log";
import { broadcastReload, initRealtimeSync } from "@/lib/realtime";
import { useUndoStack } from "@/context/useUndoStack";
import { usePrintState } from "@/context/usePrintState";
import type {
  Bord,
  ClubRecords,
  DashboardStatistieken,
  Seizoen,
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
  seizoenen: Seizoen[];
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
  voegSeizoenToe: (startJaar: number) => void;
  verwijderSeizoen: (seizoenId: string) => void;
  volgendSeizoenStartJaar: number;
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
  genereerKnockoutRonde: () => void;
  gestartOp: string;
  openbareEindtijd: string;
  isOpenbaarActief: boolean;
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
  const limiet = pasAvondLimietToe(
    genormaliseerd.aanwezigen,
    genormaliseerd.gasten
  );
  return {
    aanwezigen: limiet.aanwezigen,
    gasten: limiet.gasten,
    borden: genormaliseerd.borden,
    laatsteOpslag: genormaliseerd.datum,
    seizoen: genormaliseerd.seizoen,
    aanmeldToken: genormaliseerd.aanmeldToken,
    notities: genormaliseerd.notities ?? "",
    gestartOp: genormaliseerd.gestartOp ?? "",
    openbareEindtijd: genormaliseerd.openbareEindtijd ?? "",
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
    gestartOp?: string;
    openbareEindtijd?: string;
  }
): Speelavond {
  const spelerVanDeAvond = berekenSpelerVanDeAvond(state.borden);
  return zorgVoorOpenbaarVenster(
    normaliseerSpeelavond({
      datum: state.datum,
      seizoen: state.seizoen,
      aanwezigen: state.aanwezigen,
      gasten: state.gasten,
      borden: state.borden,
      spelerVanDeAvond,
      aanmeldToken: state.aanmeldToken,
      notities: state.notities,
      gestartOp: state.gestartOp || undefined,
      openbareEindtijd: state.openbareEindtijd || undefined,
    })
  );
}

export function SpeelavondProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [leden, setLeden] = useState<string[]>([...CLUB_LEDEN_DEFAULT]);
  const [aanwezigen, setAanwezigen] = useState<string[]>([]);
  const [gasten, setGasten] = useState<string[]>([]);
  const [gastNaam, setGastNaam] = useState("");
  const [borden, setBorden] = useState<Bord[]>([]);
  const [laatsteOpslag, setLaatsteOpslag] = useState("");
  const [actiefSeizoen, setActiefSeizoenState] = useState(STANDAARD_SEIZOEN_ID);
  const [seizoenen, setSeizoenen] = useState<Seizoen[]>(() => laadSeizoenen());
  const [aanmeldToken, setAanmeldToken] = useState<string | null>(null);
  const [isGeladen, setIsGeladen] = useState(false);
  const [historie, setHistorie] = useState<Speelavond[]>([]);
  const [notities, setNotitiesState] = useState("");
  const [gestartOp, setGestartOp] = useState("");
  const [openbareEindtijd, setOpenbareEindtijd] = useState("");
  const [nu, setNu] = useState(() => new Date());
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
      setGestartOp(state.gestartOp);
      setOpenbareEindtijd(state.openbareEindtijd);
      if (state.seizoen) setActiefSeizoenState(state.seizoen);
    }
    setLeden(laadLeden());
    setSeizoenen(laadSeizoenen());
    setHistorie(laadHistorie());
  }, []);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- localStorage hydratie na client mount */
    try {
      const opgeslagen = laadSpeelavond();
      const seizoen = laadActiefSeizoen();
      try {
        setLeden(migreerOfficieleSpelersnamen());
      } catch {
        setLeden(laadLeden());
      }
      setSeizoenen(laadSeizoenen());
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
        setGestartOp(state.gestartOp);
        setOpenbareEindtijd(state.openbareEindtijd);
      }
      setHistorie(laadHistorie());
      setAanmeldBaseUrl(window.location.origin);
      wisOpgeslagenSpelerKoppeling();
      if (consumeBordenMigratieWaarschuwing()) {
        toast(
          `Oude competitie gevonden — genereer opnieuw (max ${MAX_BORDEN_PER_AVOND} borden)`,
          "info"
        );
      }
    } finally {
      setIsGeladen(true);
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

  useEffect(() => {
    const id = window.setInterval(() => setNu(new Date()), 15_000);
    return () => window.clearInterval(id);
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
        notities,
        gestartOp,
        openbareEindtijd,
        ...updates,
      });
      slaSpeelavondOp(huidig);
      if (huidig.gestartOp) setGestartOp(huidig.gestartOp);
      if (huidig.openbareEindtijd) setOpenbareEindtijd(huidig.openbareEindtijd);
      if (huidig.datum) setLaatsteOpslag(huidig.datum);
      if (huidig.borden.length > 0 && huidig.datum) {
        voegToeAanHistorie(huidig);
        setHistorie(laadHistorie());
      }
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
    [
      aanwezigen,
      actiefSeizoen,
      aanmeldToken,
      borden,
      gasten,
      gestartOp,
      laatsteOpslag,
      notities,
      openbareEindtijd,
    ]
  );

  useEffect(() => {
    if (!isGeladen || !heeftTeVeelBorden(borden)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- migratie oude 8-borden data
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

  const voegSeizoenToe = useCallback(
    (startJaar: number) => {
      const bijgewerkt = voegSeizoenToeAanOpslag(startJaar);
      const nieuw = bijgewerkt.find((s) => s.startJaar === startJaar);
      if (!nieuw) {
        toast("Ongeldig startjaar voor een seizoen.", "error");
        return;
      }
      setSeizoenen(bijgewerkt);
      setActiefSeizoen(nieuw.id);
      logAuditActie("Seizoen toegevoegd", nieuw.label);
      toast(`${nieuw.label} toegevoegd.`, "success");
      broadcastReload();
    },
    [setActiefSeizoen]
  );

  const verwijderSeizoen = useCallback(
    (seizoenId: string) => {
      const bijgewerkt = verwijderSeizoenUitOpslag(seizoenId);
      setSeizoenen(bijgewerkt);
      if (!bijgewerkt.some((s) => s.id === seizoenId)) {
        setActiefSeizoen(STANDAARD_SEIZOEN_ID);
        logAuditActie("Seizoen verwijderd", seizoenLabel(seizoenId));
        toast(`${seizoenLabel(seizoenId)} verwijderd.`, "success");
        broadcastReload();
      }
    },
    [setActiefSeizoen]
  );

  const toggleLid = useCallback(
    (naam: string) => {
      setAanwezigen((huidig) => {
        if (huidig.includes(naam)) {
          const nieuw = huidig.filter((s) => s !== naam);
          persist({ aanwezigen: nieuw });
          return nieuw;
        }

        if (huidig.length >= MAX_SPELERS_PER_AVOND) {
          const over = Math.max(0, leden.length - MAX_SPELERS_PER_AVOND);
          toast(
            `Maximaal ${MAX_SPELERS_PER_AVOND} leden vanavond. ${over} ${
              over === 1 ? "lid doet" : "leden doen"
            } niet mee.`,
            "error"
          );
          return huidig;
        }

        const result = pasAvondLimietToe([...huidig, naam], gasten);
        persist({
          aanwezigen: result.aanwezigen,
          gasten: result.gasten,
        });
        if (result.verwijderdeGasten.length > 0) {
          setGasten(result.gasten);
          toast(
            `Avond vol. Gast${result.verwijderdeGasten.length === 1 ? "" : "en"} ${result.verwijderdeGasten.join(", ")} ${
              result.verwijderdeGasten.length === 1 ? "valt" : "vallen"
            } af. Leden blijven.`,
            "info"
          );
        }
        return result.aanwezigen;
      });
    },
    [gasten, leden.length, persist]
  );

  const selecteerAlleLeden = useCallback(() => {
    const result = pasAvondLimietToe(leden, gasten);
    setAanwezigen(result.aanwezigen);
    setGasten(result.gasten);
    persist({
      aanwezigen: result.aanwezigen,
      gasten: result.gasten,
    });
    if (result.geweigerdeLeden.length > 0) {
      toast(
        `Maximaal ${MAX_SPELERS_PER_AVOND} leden vanavond. ${result.geweigerdeLeden.length} ${
          result.geweigerdeLeden.length === 1 ? "lid doet" : "leden doen"
        } niet mee.`,
        "info"
      );
    }
    if (result.verwijderdeGasten.length > 0) {
      toast(
        `Avond vol. Gasten vallen af zodat de leden kunnen spelen.`,
        "info"
      );
    }
  }, [gasten, leden, persist]);

  const deselecteerAlleLeden = useCallback(() => {
    setAanwezigen([]);
    persist({ aanwezigen: [] });
  }, [persist]);

  const voegGastToe = useCallback(() => {
    const naam = gastNaam.trim();
    if (!naam) return;
    if (gasten.includes(naam)) {
      toast("Deze gast staat er al op.", "error");
      return;
    }
    if (avondIsVol(aanwezigen.length, gasten.length)) {
      toast(
        `Avond is vol (${MAX_SPELERS_PER_AVOND}/${MAX_SPELERS_PER_AVOND}). Gasten kunnen alleen meedoen als er plek is.`,
        "error"
      );
      return;
    }
    setGasten((huidig) => {
      const nieuw = [...huidig, naam];
      persist({ gasten: nieuw });
      return nieuw;
    });
    setGastNaam("");
  }, [aanwezigen.length, gastNaam, gasten, persist]);

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
    toast("✓ Speler toegevoegd", "success");
  }, [leden]);

  const handleHernoemLid = useCallback(
    (oudeNaam: string, nieuweNaam: string) => {
      const naam = nieuweNaam.trim();
      setLeden(hernoemLid(oudeNaam, naam, leden));
      const nieuweAanwezigen = aanwezigen.map((n) =>
        namenZijnGelijk(n, oudeNaam) ? naam : n
      );
      const nieuweGasten = gasten.map((n) =>
        namenZijnGelijk(n, oudeNaam) ? naam : n
      );
      const nieuweBorden = hernoemSpelerInBorden(borden, oudeNaam, naam);
      setAanwezigen(nieuweAanwezigen);
      setGasten(nieuweGasten);
      setBorden(nieuweBorden);
      persist({
        aanwezigen: nieuweAanwezigen,
        gasten: nieuweGasten,
        borden: nieuweBorden,
      });
      hernoemSpelerInData(oudeNaam, naam);
      logAuditActie("Lid hernoemd", `${oudeNaam} → ${naam}`);
      broadcastReload();
    },
    [aanwezigen, borden, gasten, leden, persist]
  );

  const handleVerwijderLid = useCallback(
    (naam: string) => {
      setLeden(verwijderLid(naam, leden));
      const nieuweAanwezigen = aanwezigen.filter((n) => !namenZijnGelijk(n, naam));
      const nieuweGasten = gasten.filter((n) => !namenZijnGelijk(n, naam));
      const nieuweBorden = verwijderSpelerUitBorden(borden, naam);
      setAanwezigen(nieuweAanwezigen);
      setGasten(nieuweGasten);
      setBorden(nieuweBorden);
      persist({
        aanwezigen: nieuweAanwezigen,
        gasten: nieuweGasten,
        borden: nieuweBorden,
      });
      broadcastReload();
    },
    [aanwezigen, borden, gasten, leden, persist]
  );

  const bouwHuidigeAvond = useCallback(
    () =>
      bouwAvond({
        datum: laatsteOpslag || maakHuidigeDatum(),
        seizoen: actiefSeizoen,
        aanwezigen,
        gasten,
        borden,
        aanmeldToken,
        notities,
        gestartOp,
        openbareEindtijd,
      }),
    [
      aanwezigen,
      actiefSeizoen,
      aanmeldToken,
      borden,
      gasten,
      gestartOp,
      laatsteOpslag,
      notities,
      openbareEindtijd,
    ]
  );

  const archiveerHuidigeAvond = useCallback(() => {
    const huidig = bouwHuidigeAvond();
    if (!heeftSpeelavondGegevens(huidig)) return;
    voegToeAanHistorie({
      ...huidig,
      datum: huidig.datum || maakHuidigeDatum(),
    });
    setHistorie(laadHistorie());
  }, [bouwHuidigeAvond]);

  const genereerCompetitieOpnieuw = useCallback(
    (
      seed?: number,
      venster?: { datum: string; gestartOp: string; openbareEindtijd: string }
    ) => {
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
      if (borden.length > 0 && !venster) {
        pushUndo({ type: "borden", borden });
      }
      if (venster) {
        setLaatsteOpslag(venster.datum);
        setGestartOp(venster.gestartOp);
        setOpenbareEindtijd(venster.openbareEindtijd);
      }
      setBorden(nieuweBorden);
      persist({
        borden: nieuweBorden,
        ...(venster ?? {}),
      });
      logAuditActie("Competitie gegenereerd", `${spelers.length} spelers, ${nieuweBorden.length} borden`);
      toast("✓ Competitie gegenereerd", "success");
    },
    [aanwezigen, actiefSeizoen, borden, gasten, persist, pushUndo]
  );

  const genereerCompetitieAvond = useCallback(async () => {
    const venster = {
      gestartOp,
      openbareEindtijd,
      datum: laatsteOpslag,
      borden,
    };
    if (moetNieuweOpenbareSessieStarten(venster)) {
      const bevestigd = await confirmDialog({
        title: "Nieuwe speelavond starten?",
        message:
          "De vorige speelavond blijft volledig bewaard. Er wordt een nieuwe actieve speelavond gemaakt. Niets wordt verwijderd of overschreven.",
        confirmLabel: "Nieuwe avond starten",
      });
      if (!bevestigd) return;
      archiveerHuidigeAvond();
      genereerCompetitieOpnieuw(undefined, nieuwOpenbaarVenster());
      return;
    }
    if (borden.length > 0) {
      const bevestigd = await confirmDialog({
        title: "Competitie opnieuw genereren?",
        message:
          "Bestaande borden en uitslagen van deze actieve speelavond worden overschreven. Je kunt dit ongedaan maken. Eerdere speelavonden blijven bewaard.",
        confirmLabel: "Opnieuw genereren",
        destructive: true,
      });
      if (!bevestigd) return;
    }
    genereerCompetitieOpnieuw();
  }, [
    archiveerHuidigeAvond,
    borden,
    genereerCompetitieOpnieuw,
    gestartOp,
    laatsteOpslag,
    openbareEindtijd,
  ]);

  const genereerKnockoutRonde = useCallback(async () => {
    if (!pouleBordenVoltooid(borden)) {
      toast(
        "Rond eerst alle poulewedstrijden op de borden af.",
        "error"
      );
      return;
    }
    const bevestigd = await confirmDialog({
      title: "Winnaars- en verliezersronde maken?",
      message:
        "Spelers worden op poulepositie verdeeld. Bestaande knockout-borden worden vervangen. Je kunt dit ongedaan maken.",
      confirmLabel: "Rondes maken",
    });
    if (!bevestigd) return;
    const volgende = genereerWinnaarsVerliezersRonde(borden);
    if (!volgende) {
      toast("Kon geen winnaars-/verliezersronde maken.", "error");
      return;
    }
    pushUndo({ type: "borden", borden });
    setBorden(volgende);
    persist({ borden: volgende });
    logAuditActie("Knockout-rondes gegenereerd", `${volgende.length} borden`);
    toast("Winnaars- en verliezersronde klaar.", "success");
    broadcastReload();
  }, [borden, persist, pushUndo]);

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
    const avond = bouwHuidigeAvond();
    setLaatsteOpslag(avond.datum);
    if (avond.gestartOp) setGestartOp(avond.gestartOp);
    if (avond.openbareEindtijd) setOpenbareEindtijd(avond.openbareEindtijd);
    slaSpeelavondOp(avond);
    void repository.addToHistorie(avond);
    setHistorie(laadHistorie());
    toast("✓ Speelavond opgeslagen", "success");
    logAuditActie("Speelavond opgeslagen", formatDatum(avond.datum));
    broadcastReload();
  }, [bouwHuidigeAvond]);

  const nieuweAvond = useCallback(async () => {
    const bevestigd = await confirmDialog({
      title: "Nieuwe speelavond",
      message:
        "De huidige speelavond blijft volledig bewaard. Daarna start een nieuwe actieve speelavond. Er wordt niets verwijderd.",
      confirmLabel: "Nieuwe avond starten",
    });
    if (!bevestigd) return;
    archiveerHuidigeAvond();
    const leeg = maakLegeSpeelavond(actiefSeizoen);
    setAanwezigen(leeg.aanwezigen);
    setGasten(leeg.gasten);
    setGastNaam("");
    setBorden(leeg.borden);
    setLaatsteOpslag(leeg.datum);
    setGestartOp("");
    setOpenbareEindtijd("");
    setAanmeldToken(null);
    setNotitiesState("");
    verwijderSpeelavond();
    verwijderAanmeldSessie();
  }, [actiefSeizoen, archiveerHuidigeAvond]);

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
    setNotitiesState(state.notities);
    setGestartOp(state.gestartOp);
    setOpenbareEindtijd(state.openbareEindtijd);
    slaSpeelavondOp(zorgVoorOpenbaarVenster(genormaliseerd));
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

  const volgendStartJaar = useMemo(
    () => seizoenen.reduce((max, s) => Math.max(max, s.startJaar ?? 0), 0) + 1,
    [seizoenen]
  );

  const dashboardStats = useMemo(
    () => berekenDashboardStats(aanwezigen, gasten, borden, leden.length),
    [aanwezigen, borden, gasten, leden.length]
  );

  const statistieken = useMemo(
    () =>
      berekenStatistieken(
        seizoenHistorie,
        actiefSeizoen,
        borden,
        laatsteOpslag
      ),
    [seizoenHistorie, actiefSeizoen, borden, laatsteOpslag]
  );

  const grafieken = useMemo(
    () => berekenGrafieken(seizoenHistorie),
    [seizoenHistorie]
  );

  const stand = useMemo(
    () =>
      berekenStand(seizoenHistorie, borden, actiefSeizoen, laatsteOpslag),
    [seizoenHistorie, borden, actiefSeizoen, laatsteOpslag]
  );

  const clubRecords = useMemo(
    () =>
      berekenClubRecords(seizoenHistorie, borden, actiefSeizoen, laatsteOpslag),
    [seizoenHistorie, borden, actiefSeizoen, laatsteOpslag]
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
        gestartOp,
        openbareEindtijd,
      }),
    [
      aanwezigen,
      actiefSeizoen,
      aanmeldToken,
      borden,
      gasten,
      gestartOp,
      laatsteOpslag,
      notities,
      openbareEindtijd,
    ]
  );

  const isOpenbaarActief = isOpenbarePeriodeActief(
    { gestartOp, openbareEindtijd, datum: laatsteOpslag, borden },
    nu
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
      seizoenen,
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
      voegSeizoenToe,
      verwijderSeizoen,
      volgendSeizoenStartJaar: volgendStartJaar,
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
      genereerKnockoutRonde,
      gestartOp,
      openbareEindtijd,
      isOpenbaarActief,
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
      genereerKnockoutRonde,
      grafieken,
      handleVerplaatsSpeler,
      historie,
      isGeladen,
      isOpenbaarActief,
      gestartOp,
      openbareEindtijd,
      laatsteOpslag,
      notities,
      printPreviewOpen,
      seizoenen,
      seizoenHistorie,
      spelerVanDeAvond,
      stand,
      volgendStartJaar,
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
      voegSeizoenToe,
      verwijderSeizoen,
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
