import { CalendarDays, LayoutDashboard, NotebookPen, Settings } from "lucide-react";
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
 *
 * **Vier items en niet vijf.** Mail stond hier met een scherm dat zei dat de module
 * in een volgende sprint zou komen. Die sprint komt niet (B-145), en een tabblad dat
 * een belofte doet die is ingetrokken is erger dan geen tabblad.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/documentation", label: "Documentatie", icon: NotebookPen },
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
