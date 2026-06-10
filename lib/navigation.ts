export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", shortLabel: "Home", icon: "🏠", mobile: true },
  {
    href: "/competitie",
    label: "Competitie",
    shortLabel: "Borden",
    icon: "🎯",
    mobile: true,
  },
  { href: "/leden", label: "Leden", shortLabel: "Leden", icon: "👥", mobile: true },
  { href: "/stand", label: "Stand", shortLabel: "Stand", icon: "📊", mobile: true },
  {
    href: "/instellingen",
    label: "Instellingen",
    shortLabel: "Meer",
    icon: "⚙",
    mobile: true,
  },
] as const;

export const DESKTOP_NAV_EXTRA = [
  { href: "/speelavonden", label: "Speelavonden", icon: "📅" },
  { href: "/statistieken", label: "Statistieken", icon: "📈" },
] as const;

export const MOBILE_NAV_ITEMS = NAV_ITEMS.filter((item) => item.mobile);

export function isActiveRoute(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function paginaTitel(pathname: string): string {
  const item = NAV_ITEMS.find((i) => isActiveRoute(pathname, i.href));
  if (item) return item.label;
  const extra = DESKTOP_NAV_EXTRA.find((i) => isActiveRoute(pathname, i.href));
  return extra?.label ?? "De Zumpe";
}
