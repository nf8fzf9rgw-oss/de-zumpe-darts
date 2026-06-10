import StatisticsPanel from "@/components/StatisticsPanel";

export default function StatistiekenPage() {
  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white lg:text-3xl">
          Statistieken
        </h2>
        <p className="mt-2 text-sm text-zinc-400 lg:text-base">
          Uitgebreid cluboverzicht. Klaar voor toekomstige database-koppeling.
        </p>
      </div>

      <StatisticsPanel />
    </div>
  );
}
