import type { Settings } from "@/types/settings";

import { settingsRepository } from "./repositories/settingsRepository";

/**
 * Instellingen. Sinds het leerlingenregister bestaat, beheert deze service geen
 * namen meer — dat doet `StudentService`.
 */
export const SettingsService = {
  get(): Promise<Settings> {
    return settingsRepository.get();
  },

  async update(patch: Partial<Settings>): Promise<Settings> {
    const current = await settingsRepository.get();
    const next = { ...current, ...patch };
    await settingsRepository.put(next);
    return next;
  },
};
