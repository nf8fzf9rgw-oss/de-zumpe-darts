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
      className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
        isActive
          ? "bg-red-950/45 text-white"
          : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
      }`}
    >
      {isActive && (
        <span
          className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-red-500"
          aria-hidden
        />
      )}
      <span className="text-base">{icon}</span>
      {label}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { isBestuur } = useAuth();

  return (
    <aside className="no-print fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-950 lg:flex">
      <div className="border-b border-zinc-800 px-5 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
            🎯 De Zumpe
          </p>
          <h1 className="mt-1 text-lg font-bold leading-tight text-white">
            Vrijdagavondcompetitie
          </h1>
        {isBestuur && (
          <span className="mt-2 inline-block rounded-full border border-red-800/70 bg-red-950/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-300">
            Wedstrijdleiding
          </span>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {isBestuur && (
          <>
            <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
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
            <p className="mb-1 mt-4 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
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
        <p className="text-center text-[11px] uppercase tracking-wider text-zinc-500">
          Dart Vereniging De Zumpe
        </p>
      </div>
    </aside>
  );
}
