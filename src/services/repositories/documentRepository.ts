import type { Documentation } from "@/types/documentation";

import { withDb, withTransaction } from "../db";

/**
 * Leest en schrijft documentaties. Geen businesslogica — zie `DocumentService`.
 */
export const documentRepository = {
  getAll(): Promise<Documentation[]> {
    return withDb((db) => db.getAll("documentations"));
  },

  put(doc: Documentation): Promise<void> {
    return withDb(async (db) => {
      await db.put("documentations", doc);
    });
  },

  /**
   * Verwijdert een documentatie én de bijbehorende foto's in één transactie
   * (besluit T-09). Eén transactie, zodat er geen blobs achterblijven waar
   * niets meer naar verwijst wanneer het halverwege misgaat.
   *
   * Gebruikt `withTransaction` uit de db-module, zodat deze repository de
   * fotorepository niet hoeft aan te roepen en de laag niet rond wordt.
   */
  deleteWithPhotos(id: string): Promise<void> {
    return withTransaction(["documentations", "photos"], async (tx) => {
      const photoIds = await tx.objectStore("photos").index("by-document").getAllKeys(id);

      await Promise.all([
        tx.objectStore("documentations").delete(id),
        ...photoIds.map((photoId: IDBValidKey) => tx.objectStore("photos").delete(photoId)),
      ]);
    });
  },
};
