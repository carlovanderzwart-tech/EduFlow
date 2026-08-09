import { EMPTY_SETTINGS, type Settings } from "@/types/settings";

import { withDb } from "../db";

/**
 * Instellingen zijn één record onder een vaste sleutel, dus zonder `id` en
 * zonder tijdstempels (docs/archief/03, *Gedeelde velden*).
 */
const KEY = "settings";

export const settingsRepository = {
  async get(): Promise<Settings> {
    const stored = await withDb((db) => db.get("settings", KEY));
    // Samenvoegen met de standaard, zodat een later toegevoegd veld geen
    // undefined oplevert bij bestaande installaties.
    return { ...EMPTY_SETTINGS, ...stored };
  },

  put(settings: Settings): Promise<void> {
    return withDb(async (db) => {
      // Bewaart alleen de velden uit het type. Wat de migratie heeft
      // achtergelaten voor terugvalzekerheid blijft daarmee ongemoeid zolang
      // niemand de instellingen wijzigt, en verdwijnt zodra dat gebeurt.
      const existing = ((await db.get("settings", KEY)) ?? {}) as Record<string, unknown>;
      await db.put("settings", { ...existing, ...settings }, KEY);
    });
  },
};
