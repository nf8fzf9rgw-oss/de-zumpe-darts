export interface NavItem {
  href: string;
  label: string;
  shortLabel: string;
  icon: string;
  mobile?: boolean;
  bestuurOnly?: boolean;
}

/** Mobiele bottom nav — speler-first */
export const MOBILE_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", shortLabel: "Home", icon: "⌂", mobile: true },
  {
    href: "/competitie",
    label: "Wedstrijden",
    shortLabel: "Wedstrijden",
    icon: "🎯",
    mobile: true,
  },
  {
    href: "/stand",
    label: "Stand",
    shortLabel: "Stand",
    icon: "🏆",
    mobile: true,
  },
  {
    href: "/leden",
    label: "Spelers",
    shortLabel: "Spelers",
    icon: "👤",
    mobile: true,
  },
  {
    href: "/instellingen",
    label: "Meer",
    shortLabel: "Meer",
    icon: "☰",
    mobile: true,
  },
];

/** Desktop sidebar — dezelfde hoofdnavigatie als mobiel */
export const PLAYER_NAV_ITEMS: NavItem[] = MOBILE_NAV_ITEMS;

/** Extra desktop items — alleen wedstrijdleiding */
export const BESTUUR_NAV_ITEMS: NavItem[] = [
  {
    href: "/beheer",
    label: "Beheer",
    shortLabel: "Beheer",
    icon: "🛠",
    bestuurOnly: true,
  },
];

/** @deprecated — gebruik MOBILE_NAV_ITEMS */
export const NAV_ITEMS = MOBILE_NAV_ITEMS;

/** @deprecated — gebruik PLAYER_NAV_ITEMS + BESTUUR_NAV_ITEMS */
export const DESKTOP_NAV_EXTRA = PLAYER_NAV_ITEMS.filter(
  (i) => !MOBILE_NAV_ITEMS.some((m) => m.href === i.href)
);

export function sidebarItems(isBestuur: boolean): NavItem[] {
  if (isBestuur) {
    return [...BESTUUR_NAV_ITEMS, ...PLAYER_NAV_ITEMS];
  }
  return PLAYER_NAV_ITEMS;
}

export function isActiveRoute(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function paginaTitel(pathname: string, isBestuur = false): string {
  const items = sidebarItems(isBestuur);
  const item = items.find((i) => isActiveRoute(pathname, i.href));
  return item?.label ?? "De Zumpe";
}
