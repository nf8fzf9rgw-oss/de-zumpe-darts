import SeasonSelector from "@/components/SeasonSelector";
import StandingsTable from "@/components/StandingsTable";
import WhatsAppShare from "@/components/WhatsAppShare";

export default function StandPage() {
  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white lg:text-3xl">Ranglijst</h2>
          <p className="mt-2 text-sm text-zinc-400 lg:text-base">
            Officiële tussenstand seizoen 2025/2026 plus nieuwe wedstrijden.
            Bestuur ziet de uitgebreide kolommen.
          </p>
        </div>
        <SeasonSelector />
      </div>

      <StandingsTable />
      <WhatsAppShare />
    </div>
  );
}
