import SpeelavondenList from "@/components/SpeelavondenList";

export default function SpeelavondenPage() {
  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white lg:text-3xl">Speelavonden</h2>
        <p className="mt-2 text-sm text-zinc-400 lg:text-base">
          Historie van alle vrijdagavonden. Bekijk, heropen, print of verwijder
          opgeslagen avonden.
        </p>
      </div>

      <SpeelavondenList />
    </div>
  );
}
