import type { Series } from "@/types/documentation";

import { withDb } from "../db";

/** Leest en schrijft reeksen. Geen businesslogica — zie `SettingsService`. */
export const seriesRepository = {
  getAll(): Promise<Series[]> {
    return withDb((db) => db.getAll("series"));
  },

  put(series: Series): Promise<void> {
    return withDb(async (db) => {
      await db.put("series", series);
    });
  },
};
