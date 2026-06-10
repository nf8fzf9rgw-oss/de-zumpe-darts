"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActiveRoute, NAV_ITEMS } from "@/lib/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="no-print fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map((item) => {
          const isActive = isActiveRoute(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-2.5 text-center transition ${
                isActive ? "text-red-500" : "text-zinc-500"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="truncate text-[10px] font-semibold">
                {item.shortLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
