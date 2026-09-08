import QuickActions from "@/components/QuickActions";
import LaatsteUitslagen from "@/components/LaatsteUitslagen";
import LiveBordOverzicht from "@/components/LiveBordOverzicht";
import WedstrijdSchema from "@/components/WedstrijdSchema";
import DartboardAccent from "@/components/ui/DartboardAccent";

export default function CompetitiePage() {
  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-3">
          <DartboardAccent size="md" />
          <div>
            <h2 className="text-xl font-bold text-white lg:text-3xl">
              Wedstrijden
            </h2>
            <p className="mt-1 text-sm text-zinc-400 lg:text-base">
              LIVE-overzicht per bord, plus het volledige schema.
            </p>
          </div>
        </div>
        <div className="hidden lg:block">
          <QuickActions layout="vertical" />
        </div>
      </div>

      <div className="lg:hidden">
        <QuickActions />
      </div>

      <LiveBordOverzicht />
      <LaatsteUitslagen />
      <WedstrijdSchema />
    </div>
  );
}
