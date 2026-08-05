import type { Group } from "@/types/group";

import { withDb } from "../db";

/**
 * Leest en schrijft groepen. Geen businesslogica, geen validatie, geen
 * afgeleide waarden — dat is de taak van `GroupService` erboven.
 *
 * Lekt geen IndexedDB naar buiten: wat eruit komt zijn gewone objecten, en
 * alles is asynchroon. Daardoor is dit de plek die vervangen wordt zodra de
 * opslag ooit een server is (doc 03, *De repositorylaag*).
 */
export const groupRepository = {
  getAll(): Promise<Group[]> {
    return withDb((db) => db.getAll("groups"));
  },

  get(id: string): Promise<Group | undefined> {
    return withDb((db) => db.get("groups", id));
  },

  put(group: Group): Promise<void> {
    return withDb(async (db) => {
      await db.put("groups", group);
    });
  },

  delete(id: string): Promise<void> {
    return withDb(async (db) => {
      await db.delete("groups", id);
    });
  },
};
