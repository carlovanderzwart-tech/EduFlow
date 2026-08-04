"use client";

import { usePathname } from "next/navigation";

import { isNavItemActive, NAV_ITEMS } from "./nav-items";

/**
 * Gedeelde header. Toont de merknaam (op de telefoon staat die nergens
 * anders, want de Sidebar met naamlabel is daar verborgen) en de titel van
 * het huidige scherm.
 */
export function Topbar() {
  const pathname = usePathname();
  const current = NAV_ITEMS.find((item) => isNavItemActive(pathname, item.href));

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 md:px-6">
      <span className="text-sm font-semibold text-foreground md:hidden">EduFlow</span>
      <span aria-hidden="true" className="text-muted-foreground md:hidden">
        ·
      </span>
      <h1 className="text-sm font-medium text-foreground">{current?.label ?? "EduFlow"}</h1>
    </header>
  );
}
