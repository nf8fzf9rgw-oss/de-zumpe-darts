import GuestsPanel from "@/components/GuestsPanel";
import MembersPanel from "@/components/MembersPanel";
import PlayerProfilePanel from "@/components/PlayerProfilePanel";
import ProtectedAction from "@/components/ProtectedAction";

export default function LedenPage() {
  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white lg:text-3xl">Spelers</h2>
        <p className="mt-2 text-sm text-zinc-400 lg:text-base">
          Publieke spelerprofielen van de competitie. Geen account nodig.
        </p>
      </div>

      <PlayerProfilePanel />

      <ProtectedAction>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:gap-8">
          <MembersPanel variant="desktop" />
          <GuestsPanel />
        </div>
      </ProtectedAction>
    </div>
  );
}
