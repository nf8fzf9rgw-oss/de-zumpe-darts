import StatBlock from "@/components/ui/StatBlock";
import { formatPunten } from "@/lib/format";
import type { SpelerProfielData } from "@/types/competition";

interface SpelerStatsGridProps {
  profiel: SpelerProfielData;
}

export default function SpelerStatsGrid({ profiel }: SpelerStatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      <StatBlock
        label="Positie"
        waarde={profiel.positie > 0 ? `#${profiel.positie}` : "—"}
        accent
        size="sm"
      />
      <StatBlock
        label="Punten"
        waarde={formatPunten(profiel.punten)}
        accent
        size="sm"
      />
      <StatBlock
        label="Wedstrijden"
        waarde={profiel.gespeeldeWedstrijden}
        size="sm"
      />
      <StatBlock
        label="Winst / verlies"
        waarde={`${profiel.overwinningen}/${profiel.verliezen}`}
        size="sm"
      />
      <StatBlock
        label="Legs"
        waarde={`${profiel.legsVoor}–${profiel.legsTegen}`}
        size="sm"
      />
      <StatBlock
        label="180's"
        waarde={profiel.aantal180s}
        accent={profiel.aantal180s > 0}
        size="sm"
      />
      <StatBlock
        label="Hoogste finish"
        waarde={profiel.hoogsteFinish > 0 ? profiel.hoogsteFinish : "—"}
        accent={profiel.hoogsteFinish >= 100}
        size="sm"
      />
      <StatBlock
        label="Aanwezigheid"
        waarde={profiel.aanwezigheid}
        size="sm"
      />
    </div>
  );
}
