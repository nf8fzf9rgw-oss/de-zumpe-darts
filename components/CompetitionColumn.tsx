"use client";

import CompetitionSummary from "@/components/CompetitionSummary";
import QuickActions from "@/components/QuickActions";
import { useSpeelavond } from "@/context/SpeelavondContext";

export default function CompetitionColumn() {
  const { dashboardStats } = useSpeelavond();

  return (
    <section className="flex h-full flex-col rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl lg:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4 lg:mb-6">
        <div>
          <h3 className="text-lg font-bold text-white lg:text-xl">
            Competitie Borden
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            {dashboardStats.aantalBorden} borden ·{" "}
            {dashboardStats.totaalWedstrijden} wedstrijden
          </p>
        </div>
        <div className="hidden w-full lg:block lg:max-w-[220px]">
          <QuickActions layout="vertical" />
        </div>
      </div>

      <div className="lg:max-h-[calc(100vh-18rem)] lg:overflow-y-auto lg:pr-1">
        <CompetitionSummary variant="dashboard" />
      </div>
    </section>
  );
}
