import type { ReactNode } from "react";

import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

/**
 * De vaste schermopbouw van EduFlow, mobiel eerst:
 * - Telefoon: header, content, navigatiebalk onderaan.
 * - Laptop: header, vaste zijbalk links, content.
 * Zie `docs/03 - Technical Architecture.md`, hoofdstuk *UI*.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
