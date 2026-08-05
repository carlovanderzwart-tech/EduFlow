import type { Photo } from "@/types/documentation";

import { withDb } from "../db";

/**
 * Leest en schrijft foto's. Blobs, geen base64 (doc 03, *Foto's*).
 *
 * Het eigenaarschap staat hier via `documentId`; de volgorde staat op de
 * documentatie en is daar de enige bron van waarheid.
 */
export const photoRepository = {
  get(id: string): Promise<Photo | undefined> {
    return withDb((db) => db.get("photos", id));
  },

  put(photo: Photo): Promise<void> {
    return withDb(async (db) => {
      await db.put("photos", photo);
    });
  },

  delete(id: string): Promise<void> {
    return withDb(async (db) => {
      await db.delete("photos", id);
    });
  },
};
