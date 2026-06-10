export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", shortLabel: "Home", icon: "🏠" },
  { href: "/competitie", label: "Competitie", shortLabel: "Borden", icon: "🎯" },
  { href: "/leden", label: "Leden", shortLabel: "Leden", icon: "👥" },
  { href: "/statistieken", label: "Statistieken", shortLabel: "Stats", icon: "📊" },
  { href: "/instellingen", label: "Instellingen", shortLabel: "Meer", icon: "⚙" },
] as const;

export function isActiveRoute(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
