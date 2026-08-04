"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { isNavItemActive, NAV_ITEMS } from "./nav-items";

/**
 * Telefoon-navigatie: balk onderaan met vijf iconen, geen hamburgermenu.
 * Zie `docs/04 - Product Blueprint.md`, *Navigatie*.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Hoofdnavigatie"
      className="fixed inset-x-0 bottom-0 z-10 flex h-16 items-stretch border-t border-border bg-background md:hidden"
    >
      {NAV_ITEMS.map((item) => {
        const active = isNavItemActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium",
              active ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <item.icon aria-hidden="true" className="size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
