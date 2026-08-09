import type { Series } from "@/types/documentation";
import type { Settings } from "@/types/settings";
import { createId } from "@/utils/id";
import { normalizeForSearch } from "@/utils/text";

import { seriesRepository } from "./repositories/seriesRepository";
import { settingsRepository } from "./repositories/settingsRepository";

/**
 * Instellingen en reeksen (docs/archief/03, *Services*). Sinds het leerlingenregister
 * bestaat, beheert deze service geen namen meer — dat doet `StudentService`.
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

  // ---- Reeksen ------------------------------------------------------------

  async getAllSeries(): Promise<Series[]> {
    const series = await seriesRepository.getAll();
    return series.sort((a, b) => a.name.localeCompare(b.name, "nl"));
  },

  /** Maakt een reeks aan, of geeft de bestaande terug bij dezelfde naam. */
  async createSeries(name: string): Promise<Series | undefined> {
    const trimmed = name.trim();
    if (!trimmed) return undefined;

    const existing = await seriesRepository.getAll();
    // Hoofdletterongevoelig vergelijken, anders leveren "Kunstwerk Dok" en
    // "kunstwerk dok" twee reeksen op.
    const match = existing.find(
      (series) => normalizeForSearch(series.name) === normalizeForSearch(trimmed),
    );
    if (match) return match;

    const at = new Date().toISOString();
    const series: Series = { id: createId(), name: trimmed, createdAt: at, updatedAt: at };

    await seriesRepository.put(series);
    return series;
  },
};
