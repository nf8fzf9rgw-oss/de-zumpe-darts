interface PanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export default function Panel({
  title,
  children,
  className = "",
  actions,
}: PanelProps) {
  return (
    <section
      className={`rounded-lg border border-zinc-800 bg-zinc-900 p-4 shadow-xl lg:p-6 ${className}`}
    >
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          {title && (
            <h3 className="text-lg font-bold text-white lg:text-xl">{title}</h3>
          )}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
