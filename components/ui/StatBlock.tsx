interface StatBlockProps {
  label: string;
  waarde: string | number;
  accent?: boolean;
  icon?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASS = {
  sm: "text-xl lg:text-2xl",
  md: "text-3xl lg:text-4xl",
  lg: "text-4xl lg:text-5xl",
} as const;

export default function StatBlock({
  label,
  waarde,
  accent = false,
  icon,
  size = "md",
}: StatBlockProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-3 text-center lg:px-4 lg:py-4">
      {icon ? <p className="text-sm lg:text-base">{icon}</p> : null}
      <p
        className={`stat-number mt-1 font-bold ${SIZE_CLASS[size]} ${
          accent ? "text-red-500" : "text-white"
        }`}
      >
        {waarde}
      </p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500 lg:text-xs">
        {label}
      </p>
    </div>
  );
}
