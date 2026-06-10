import GuestsPanel from "@/components/GuestsPanel";
import MembersPanel from "@/components/MembersPanel";
import PlayerProfilePanel from "@/components/PlayerProfilePanel";

export default function LedenPage() {
  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white lg:text-3xl">
          Leden & Gasten
        </h2>
        <p className="mt-2 text-sm text-zinc-400 lg:text-base">
          Beheer leden, gastspelers en spelerprofielen voor de vrijdagavond.
        </p>
      </div>

      <PlayerProfilePanel />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:gap-8">
        <MembersPanel variant="desktop" />
        <GuestsPanel />
      </div>
    </div>
  );
}
