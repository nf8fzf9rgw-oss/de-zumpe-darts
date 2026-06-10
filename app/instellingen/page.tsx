"use client";

import { useSpeelavond } from "@/context/SpeelavondContext";

export default function InstellingenPage() {
  const { laatsteOpslagLabel, opslaan, nieuweAvond, printSchema } =
    useSpeelavond();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Instellingen</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Beheer opslag en speelavond-acties voor de club.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h3 className="text-lg font-bold text-white">Opslag</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Gegevens worden lokaal opgeslagen in de browser.
          </p>
          <p className="mt-4 text-sm text-zinc-300">
            Laatste opslag:{" "}
            <span className="font-semibold text-white">
              {laatsteOpslagLabel}
            </span>
          </p>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h3 className="text-lg font-bold text-white">Acties</h3>
          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={opslaan}
              className="w-full rounded-xl bg-orange-700 px-4 py-3 font-semibold text-white hover:bg-orange-600"
            >
              Speelavond opslaan
            </button>
            <button
              type="button"
              onClick={printSchema}
              className="w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-600"
            >
              Print speelschema
            </button>
            <button
              type="button"
              onClick={nieuweAvond}
              className="w-full rounded-xl border border-red-800 bg-red-950 px-4 py-3 font-semibold text-red-300 hover:bg-red-900"
            >
              Nieuwe speelavond
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-white">Prisma voorbereiding</h3>
          <p className="mt-2 text-sm text-zinc-400">
            De service-laag in{" "}
            <code className="text-red-400">lib/services/speelavond.service.ts</code>{" "}
            is voorbereid om later eenvoudig te koppelen aan Prisma zonder de UI
            te wijzigen.
          </p>
        </section>
      </div>
    </div>
  );
}
