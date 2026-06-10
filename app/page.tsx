import CompetitionColumn from "@/components/CompetitionColumn";
import DashboardCards from "@/components/DashboardCards";
import DashboardStatisticsPanel from "@/components/DashboardStatisticsPanel";
import GuestsPanel from "@/components/GuestsPanel";
import MembersPanel from "@/components/MembersPanel";
import QuickActions from "@/components/QuickActions";
import SpeelavondPanel from "@/components/SpeelavondPanel";

export default function HomePage() {
  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      <section>
        <div className="mb-4 lg:mb-6">
          <h2 className="text-xl font-bold text-white lg:text-3xl">
            Wedstrijdleiding
          </h2>
          <p className="mt-1 text-sm text-zinc-400 lg:text-base">
            Live dashboard voor de vrijdagavond competitie
          </p>
        </div>
        <DashboardCards />
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-12 lg:gap-6 xl:gap-8">
        <div className="md:col-span-1 lg:col-span-3">
          <MembersPanel variant="desktop" />
        </div>

        <div className="flex flex-col gap-4 md:col-span-1 md:gap-6 lg:col-span-4">
          <SpeelavondPanel />
          <GuestsPanel compact />
          <DashboardStatisticsPanel />
        </div>

        <div className="md:col-span-2 lg:col-span-5">
          <CompetitionColumn />
        </div>
      </div>

      <div className="lg:hidden">
        <QuickActions />
      </div>
    </div>
  );
}
