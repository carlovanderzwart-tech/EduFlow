import { CalendarDays, LayoutDashboard, Mail, NotebookPen, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Eén bron van waarheid voor de navigatie, gebruikt door zowel de Sidebar
 * (laptop) als de BottomNav (telefoon). De navigatie is overal gelijk en
 * verandert nooit van plek — zie `docs/04 - Product Blueprint.md`, *Navigatie*.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/documentation", label: "Documentatie", icon: NotebookPen },
  { href: "/mail", label: "Mail", icon: Mail },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/settings", label: "Instellingen", icon: Settings },
];

/** Root ("/") is alleen actief op een exacte match, overige items ook op subroutes. */
export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
