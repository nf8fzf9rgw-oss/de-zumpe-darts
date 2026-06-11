interface DartboardAccentProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
};

export default function DartboardAccent({
  size = "md",
  className = "",
}: DartboardAccentProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={`${SIZES[size]} shrink-0 ${className}`}
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="22" fill="#0a0a0a" stroke="#b91c1c" strokeWidth="2" />
      <circle cx="24" cy="24" r="16" fill="none" stroke="#27272a" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="10" fill="none" stroke="#b91c1c" strokeWidth="1" opacity="0.6" />
      <circle cx="24" cy="24" r="4" fill="#b91c1c" />
      {[0, 45, 90, 135].map((deg) => (
        <line
          key={deg}
          x1="24"
          y1="24"
          x2={24 + 18 * Math.cos((deg * Math.PI) / 180)}
          y2={24 + 18 * Math.sin((deg * Math.PI) / 180)}
          stroke="#3f3f46"
          strokeWidth="0.75"
        />
      ))}
    </svg>
  );
}
