import StandingsTable from "@/components/StandingsTable";

export default function StandPage() {
  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white lg:text-3xl">Stand</h2>
        <p className="mt-2 text-sm text-zinc-400 lg:text-base">
          Automatische ranglijst op basis van gespeelde wedstrijden en
          uitslagen. 3 punten per overwinning.
        </p>
      </div>

      <StandingsTable />
    </div>
  );
}
