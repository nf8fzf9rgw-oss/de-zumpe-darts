"use client";

interface NumpadProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  label?: string;
}

export default function Numpad({
  value,
  onChange,
  max = 9,
  label,
}: NumpadProps) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "⌫"];

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-center text-sm font-semibold text-zinc-400">{label}</p>
      )}
      <div className="flex h-16 items-center justify-center rounded-xl border border-zinc-700 bg-black text-4xl font-bold text-white">
        {value}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              if (key === "⌫") {
                onChange(Math.floor(value / 10));
              } else {
                const digit = parseInt(key, 10);
                const next = value * 10 + digit;
                onChange(next <= max ? next : digit);
              }
            }}
            className="flex min-h-14 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-xl font-bold text-white transition hover:bg-zinc-800 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600"
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}
