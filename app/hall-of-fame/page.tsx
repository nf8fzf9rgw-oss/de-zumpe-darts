import HallOfFamePanel from "@/components/HallOfFamePanel";
import SeasonSelector from "@/components/SeasonSelector";

export default function HallOfFamePage() {
  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white lg:text-3xl">Hall of Fame</h2>
          <p className="mt-2 text-sm text-zinc-400 lg:text-base">
            Clubrecords en historische prestaties per seizoen.
          </p>
        </div>
        <SeasonSelector />
      </div>
      <HallOfFamePanel />
    </div>
  );
}
