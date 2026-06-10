"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActiveRoute, NAV_ITEMS } from "@/lib/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="no-print fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-950 lg:flex">
      <div className="border-b border-zinc-800 p-6">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-600 bg-black text-2xl shadow-lg shadow-red-900/30">
          🎯
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
          De Zumpe
        </p>
        <h1 className="mt-1 text-lg font-bold leading-tight text-white">
          Dart Vereniging
        </h1>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {NAV_ITEMS.map((item) => {
          const isActive = isActiveRoute(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                isActive
                  ? "bg-red-700 text-white shadow-lg shadow-red-900/40"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-4">
        <p className="text-center text-xs text-zinc-500">
          Vrijdagavond Competitie
        </p>
      </div>
    </aside>
  );
}
