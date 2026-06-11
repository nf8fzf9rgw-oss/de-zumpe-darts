"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface ProtectedPageProps {
  children: React.ReactNode;
  titel?: string;
  bericht?: string;
}

/** Blokkeert admin-pagina's voor spelers met een duidelijke melding. */
export default function ProtectedPage({
  children,
  titel = "Alleen voor bestuur",
  bericht = "Deze pagina is alleen toegankelijk voor wedstrijdleiding en bestuur.",
}: ProtectedPageProps) {
  const { isBestuur, isGeladen } = useAuth();

  if (!isGeladen) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-zinc-400">Laden...</p>
      </div>
    );
  }

  if (!isBestuur) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center shadow-xl">
        <p className="text-4xl">🔒</p>
        <h2 className="mt-4 text-xl font-bold text-white">{titel}</h2>
        <p className="mt-2 text-sm text-zinc-400">{bericht}</p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/"
            className="min-h-12 rounded-xl bg-red-700 px-4 py-3 text-sm font-semibold text-white hover:bg-red-600"
          >
            Terug naar home
          </Link>
          <Link
            href="/instellingen"
            className="min-h-12 rounded-xl border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-300 hover:bg-zinc-900"
          >
            Naar Meer / instellingen
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
