"use client";

import ProtectedAction from "@/components/ProtectedAction";
import { useSpeelavond } from "@/context/SpeelavondContext";

interface QuickActionsProps {
  layout?: "vertical" | "horizontal";
}

function QuickActionsButtons({
  layout = "vertical",
}: QuickActionsProps) {
  const {
    genereerCompetitieAvond,
    opslaan,
    nieuweAvond,
    openPrintPreview,
    borden,
    canUndo,
    undoLaatsteActie,
  } = useSpeelavond();

  const knoppen = [
    {
      label: "Genereer Competitie",
      onClick: genereerCompetitieAvond,
      className: "bg-green-700 hover:bg-green-600 text-white",
    },
    ...(canUndo
      ? [
          {
            label: "Ongedaan maken",
            onClick: undoLaatsteActie,
            className: "bg-zinc-700 hover:bg-zinc-600 text-white",
          },
        ]
      : []),
    {
      label: "Opslaan",
      onClick: opslaan,
      className: "bg-orange-700 hover:bg-orange-600 text-white",
    },
    {
      label: "Print preview",
      onClick: openPrintPreview,
      disabled: borden.length === 0,
      className:
        borden.length === 0
          ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
          : "bg-blue-700 hover:bg-blue-600 text-white",
    },
    {
      label: "Nieuwe Speelavond",
      onClick: nieuweAvond,
      className:
        "border border-red-800 bg-red-950 text-red-300 hover:bg-red-900",
    },
  ] as Array<{
    label: string;
    onClick: () => void;
    className: string;
    disabled?: boolean;
  }>;

  if (layout === "horizontal") {
    return (
      <div className="no-print flex flex-wrap gap-2">
        {knoppen.map((knop) => (
          <button
            key={knop.label}
            type="button"
            onClick={knop.onClick}
            disabled={"disabled" in knop && knop.disabled}
            className={`min-h-11 rounded-xl px-3 py-2 text-xs font-bold shadow-lg transition sm:px-4 sm:py-2.5 sm:text-sm ${knop.className}`}
          >
            {knop.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <aside className="no-print space-y-2 lg:space-y-3">
      {knoppen.map((knop) => (
        <button
          key={knop.label}
          type="button"
          onClick={knop.onClick}
          disabled={"disabled" in knop && knop.disabled}
          className={`min-h-11 w-full rounded-xl px-4 py-3 text-left text-sm font-bold shadow-lg transition lg:px-5 lg:py-3.5 lg:text-base ${knop.className}`}
        >
          {knop.label}
        </button>
      ))}
    </aside>
  );
}

export default function QuickActions(props: QuickActionsProps) {
  return (
    <ProtectedAction>
      <QuickActionsButtons {...props} />
    </ProtectedAction>
  );
}
