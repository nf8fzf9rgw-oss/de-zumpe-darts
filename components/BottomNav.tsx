"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActiveRoute, MOBILE_NAV_ITEMS } from "@/lib/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="no-print fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = isActiveRoute(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 py-2 text-center transition active:scale-95 ${
                isActive
                  ? "border-t-2 border-red-500 text-red-500"
                  : "border-t-2 border-transparent text-zinc-500"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="truncate text-[9px] font-semibold sm:text-[10px]">
                {item.shortLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
