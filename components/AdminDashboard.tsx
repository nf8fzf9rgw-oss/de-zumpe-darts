import CompetitionColumn from "@/components/CompetitionColumn";
import DashboardStatisticsPanel from "@/components/DashboardStatisticsPanel";
import DashboardWidgets from "@/components/DashboardWidgets";
import GuestsPanel from "@/components/GuestsPanel";
import MembersPanel from "@/components/MembersPanel";
import ProtectedAction from "@/components/ProtectedAction";
import QrAanmelden from "@/components/QrAanmelden";
import QuickActions from "@/components/QuickActions";
import SeasonSelector from "@/components/SeasonSelector";
import SpelerVanDeAvondBanner from "@/components/SpelerVanDeAvondBanner";
import SpeelavondPanel from "@/components/SpeelavondPanel";

export default function AdminDashboard() {
  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      <ProtectedAction>
        <div className="sticky top-[3.25rem] z-20 -mx-4 border-b border-zinc-800 bg-black/95 px-4 py-2 backdrop-blur-md lg:hidden">
          <QuickActions layout="horizontal" />
        </div>
      </ProtectedAction>

      <section>
        <div className="mb-4 flex flex-col gap-4 lg:mb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white lg:text-3xl">
              Wedstrijdleiding
            </h2>
            <p className="mt-1 text-sm text-zinc-400 lg:text-base">
              Live dashboard voor de vrijdagavond competitie
            </p>
          </div>
          <ProtectedAction>
            <SeasonSelector />
          </ProtectedAction>
        </div>
        <SpelerVanDeAvondBanner />
      </section>

      <DashboardWidgets />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-12 lg:gap-6 xl:gap-8">
        <ProtectedAction>
          <div className="md:col-span-1 lg:col-span-3">
            <MembersPanel variant="desktop" />
          </div>
        </ProtectedAction>

        <div className="flex flex-col gap-4 md:col-span-1 md:gap-6 lg:col-span-4">
          <SpeelavondPanel />
          <ProtectedAction>
            <QrAanmelden />
            <GuestsPanel compact />
          </ProtectedAction>
          <DashboardStatisticsPanel />
        </div>

        <div className="md:col-span-2 lg:col-span-5">
          <CompetitionColumn />
        </div>
      </div>
    </div>
  );
}
