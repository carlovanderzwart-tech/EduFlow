import type { AuditEntry } from "@/types/audit";

import { withDb } from "../db";

/** Hoeveel regels bewaard blijven. Het logboek mag niet onbegrensd groeien. */
const MAX_ENTRIES = 300;

/**
 * Alleen toevoegen en opruimen; er is geen wijzigen. Het logboek is een verslag
 * (§16.2).
 */
export const auditRepository = {
  async add(entry: AuditEntry): Promise<void> {
    await withDb(async (db) => {
      const tx = db.transaction("auditLog", "readwrite");
      await tx.store.put(entry);

      // Oudste regels opruimen zodra de grens is bereikt.
      const count = await tx.store.count();
      if (count > MAX_ENTRIES) {
        let cursor = await tx.store.index("by-at").openCursor();
        let toDelete = count - MAX_ENTRIES;

        while (cursor && toDelete > 0) {
          await cursor.delete();
          toDelete -= 1;
          cursor = await cursor.continue();
        }
      }

      await tx.done;
    });
  },

  /** Nieuwste eerst. Bedoeld om achteraf te kunnen nakijken wat er gebeurd is. */
  async getRecent(limit = 50): Promise<AuditEntry[]> {
    const entries = await withDb((db) => db.getAllFromIndex("auditLog", "by-at"));
    return (entries as AuditEntry[]).reverse().slice(0, limit);
  },
};
