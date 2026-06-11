"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  BESTUUR_NAV_ITEMS,
  isActiveRoute,
  PLAYER_NAV_ITEMS,
} from "@/lib/navigation";

function NavLink({
  href,
  label,
  icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
        isActive
          ? "bg-red-700 text-white shadow-lg shadow-red-900/40"
          : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
      }`}
    >
      <span className="text-lg">{icon}</span>
      {label}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { isBestuur } = useAuth();

  return (
    <aside className="no-print fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-950 lg:flex">
      <div className="border-b border-zinc-800 p-6">
        <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-600 bg-black text-2xl shadow-lg shadow-red-900/30">
          🎯
          <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-red-600 ring-2 ring-zinc-950" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
          De Zumpe
        </p>
        <h1 className="mt-1 text-lg font-bold leading-tight text-white">
          Dart Vereniging
        </h1>
        {isBestuur && (
          <span className="mt-2 inline-block rounded-full bg-red-900/50 px-2 py-0.5 text-[10px] font-bold uppercase text-red-300">
            Bestuur
          </span>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {isBestuur && (
          <>
            <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
              Beheer
            </p>
            {BESTUUR_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isActiveRoute(pathname, item.href)}
              />
            ))}
            <p className="mb-2 mt-4 px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
              Speler
            </p>
          </>
        )}
        {PLAYER_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isActive={isActiveRoute(pathname, item.href)}
          />
        ))}
      </nav>

      <div className="border-t border-zinc-800 p-4">
        <p className="text-center text-xs text-zinc-500">
          Vrijdagavond Competitie
        </p>
      </div>
    </aside>
  );
}
