"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { avondIsVol, pasAvondLimietToe } from "@/lib/avond-limiet";
import { MAX_SPELERS_PER_AVOND } from "@/lib/competition";
import { laadLeden } from "@/lib/leden";
import {
  laadAanmeldSessie,
  laadSpeelavond,
  slaAanmeldSessieOp,
  slaSpeelavondOp,
} from "@/lib/storage";
import { toast } from "@/lib/ui-feedback";

function AanmeldenInhoud() {
  const searchParams = useSearchParams();
  const token = searchParams.get("t");
  const [leden, setLeden] = useState<string[]>([]);
  const [aanwezigen, setAanwezigen] = useState<string[]>([]);
  const [gasten, setGasten] = useState<string[]>([]);
  const [geldig, setGeldig] = useState(false);
  const [naam, setNaam] = useState("");

  const ververs = useCallback(() => {
    const sessie = laadAanmeldSessie();
    const avond = laadSpeelavond();
    if (!token || !sessie || sessie.token !== token) {
      setGeldig(false);
      return;
    }
    setGeldig(true);
    setLeden(laadLeden());
    setAanwezigen(avond?.aanwezigen ?? sessie.aanwezigen);
    setGasten(avond?.gasten ?? []);
  }, [token]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- localStorage sync bij mount */
    ververs();
    /* eslint-enable react-hooks/set-state-in-effect */
    const handler = () => ververs();
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [ververs]);

  const toggleAanwezig = (lid: string) => {
    const avond = laadSpeelavond();
    const sessie = laadAanmeldSessie();
    if (!avond || !sessie) return;

    if (avond.aanwezigen.includes(lid)) {
      const nieuw = avond.aanwezigen.filter((n) => n !== lid);
      slaSpeelavondOp({ ...avond, aanwezigen: nieuw });
      slaAanmeldSessieOp({ ...sessie, aanwezigen: nieuw });
      setAanwezigen(nieuw);
      return;
    }

    if (avond.aanwezigen.length >= MAX_SPELERS_PER_AVOND) {
      toast(
        `Avond vol. Maximaal ${MAX_SPELERS_PER_AVOND} leden kunnen darten.`,
        "error"
      );
      return;
    }

    const result = pasAvondLimietToe([...avond.aanwezigen, lid], avond.gasten);
    slaSpeelavondOp({
      ...avond,
      aanwezigen: result.aanwezigen,
      gasten: result.gasten,
    });
    slaAanmeldSessieOp({ ...sessie, aanwezigen: result.aanwezigen });
    setAanwezigen(result.aanwezigen);
    setGasten(result.gasten);
  };

  const meldGastAan = () => {
    const getrimd = naam.trim();
    if (!getrimd) return;
    const avond = laadSpeelavond();
    if (!avond || avond.gasten.includes(getrimd)) return;
    if (avondIsVol(avond.aanwezigen.length, avond.gasten.length)) {
      toast(
        `Avond is vol (${MAX_SPELERS_PER_AVOND}/${MAX_SPELERS_PER_AVOND}). Gasten vallen af als er geen plek is.`,
        "error"
      );
      return;
    }
    const nieuweGasten = [...avond.gasten, getrimd];
    slaSpeelavondOp({ ...avond, gasten: nieuweGasten });
    setGasten(nieuweGasten);
    setNaam("");
  };

  if (!geldig) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-6 text-center">
        <div>
          <p className="text-4xl">🎯</p>
          <h1 className="mt-4 text-xl font-bold text-white">Aanmelden</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Deze aanmeldsessie is niet actief of ongeldig.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 pb-8 text-white">
      <header className="mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-red-500">
          De Zumpe
        </p>
        <h1 className="mt-2 text-2xl font-bold">Aanmelden</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Tik je naam om aan te melden
        </p>
        <p className="mt-2 text-sm font-semibold text-white">
          {aanwezigen.length + gasten.length}/{MAX_SPELERS_PER_AVOND} vanavond
        </p>
      </header>

      <div className="mx-auto max-w-md space-y-2">
        {leden.map((lid) => {
          const isAanwezig = aanwezigen.includes(lid);
          return (
            <button
              key={lid}
              type="button"
              onClick={() => toggleAanwezig(lid)}
              className={`flex min-h-[52px] w-full items-center justify-between rounded-xl px-4 py-4 text-left text-base font-semibold transition active:scale-[0.98] ${
                isAanwezig
                  ? "bg-red-700 text-white shadow-lg"
                  : "bg-zinc-900 text-zinc-200"
              }`}
            >
              <span>{lid}</span>
              <span>{isAanwezig ? "✓" : ""}</span>
            </button>
          );
        })}
      </div>

      <div className="mx-auto mt-6 max-w-md">
        <p className="mb-2 text-sm text-zinc-400">Gastspeler?</p>
        <div className="flex gap-2">
          <input
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            placeholder="Je naam..."
            className="min-h-11 flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-white"
          />
          <button
            type="button"
            onClick={meldGastAan}
            className="min-h-11 rounded-xl bg-red-700 px-4 font-semibold text-white"
          >
            Aan
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AanmeldenPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black text-white">
          Laden...
        </div>
      }
    >
      <AanmeldenInhoud />
    </Suspense>
  );
}
