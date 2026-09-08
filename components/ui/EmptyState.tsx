interface EmptyStateProps {
  icon: string;
  titel: string;
  tekst: string;
}

export default function EmptyState({ icon, titel, tekst }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 px-6 py-12 text-center">
      <p className="text-4xl" aria-hidden>
        {icon}
      </p>
      <p className="mt-3 text-base font-semibold text-white lg:text-lg">{titel}</p>
      <p className="mt-1 text-sm text-zinc-400">{tekst}</p>
    </div>
  );
}
