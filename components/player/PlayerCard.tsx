import DartboardAccent from "@/components/ui/DartboardAccent";

interface PlayerCardProps {
  naam: string;
  subtekst?: string;
  badge?: string;
  highlight?: boolean;
  onClick?: () => void;
}

export default function PlayerCard({
  naam,
  subtekst,
  badge,
  highlight = false,
  onClick,
}: PlayerCardProps) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
        highlight
          ? "border-red-700 bg-red-950/40 shadow-lg shadow-red-900/20"
          : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
      } ${onClick ? "min-h-12 cursor-pointer active:scale-[0.98]" : ""}`}
    >
      <DartboardAccent size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-white">{naam}</p>
        {subtekst && (
          <p className="truncate text-xs text-zinc-400">{subtekst}</p>
        )}
      </div>
      {badge && (
        <span className="shrink-0 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-300">
          {badge}
        </span>
      )}
    </Wrapper>
  );
}
