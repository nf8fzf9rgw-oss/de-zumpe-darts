import SeasonSelector from "@/components/SeasonSelector";
import StatisticsCharts from "@/components/StatisticsCharts";
import StatisticsPanel from "@/components/StatisticsPanel";

export default function StatistiekenPage() {
  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white lg:text-3xl">
            Statistieken
          </h2>
          <p className="mt-2 text-sm text-zinc-400 lg:text-base">
            Cluboverzicht, prestaties en trends per seizoen.
          </p>
        </div>
        <SeasonSelector />
      </div>

      <StatisticsPanel />
      <StatisticsCharts />
    </div>
  );
}
