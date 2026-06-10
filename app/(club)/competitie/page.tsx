import CompetitionSummary from "@/components/CompetitionSummary";
import QuickActions from "@/components/QuickActions";

export default function CompetitiePage() {
  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white lg:text-3xl">Competitie</h2>
          <p className="mt-2 text-sm text-zinc-400 lg:text-base">
            Volledig overzicht van alle borden en wedstrijden voor
            wedstrijdleiding.
          </p>
        </div>
        <div className="hidden lg:block lg:min-w-[280px]">
          <QuickActions layout="vertical" />
        </div>
      </div>

      <div className="lg:hidden">
        <QuickActions />
      </div>

      <CompetitionSummary variant="full" />
    </div>
  );
}
