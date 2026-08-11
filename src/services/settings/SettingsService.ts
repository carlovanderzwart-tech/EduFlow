/**
 * Instellingen (§10.4, §8.3.14, §8.2.2).
 *
 * Eén service voor twee opslagplaatsen, en dat is precies wat §10.4 hem toewijst:
 * "instellingen lezen en schrijven, verdeling over IndexedDB en `localStorage`".
 * Wie ze gebruikt, weet niet waar ze staan.
 *
 * In IndexedDB staat het ene `settings`-record: de waarden die persoonsgegevens
 * raken of afleiden (T-50). Er is er altijd precies één (INV-49); `startOpslag`
 * maakt hem bij de eerste start aan, zodat elke lezer erop kan rekenen.
 *
 * In `localStorage` staan de zes sleutels van §8.2.2. Zie `voorkeuren.ts`.
 */

import type { Result } from "@/lib/result";
import type { BaseRecord, Settings } from "@/domain/types";

import type { StorageService } from "../storage/StorageService";

import {
  maakVoorkeuren,
  type Voorkeur,
  type Voorkeurenopslag,
  type VoorkeurNaam,
} from "./voorkeuren";

export interface SettingsDeps {
  storage: StorageService;
  voorkeurenOpslag: Voorkeurenopslag;
}

/** Wat een scherm mag wijzigen: alles behalve het apparaat-id. */
export type Instellingenwijziging = Partial<Omit<Settings, keyof BaseRecord | "deviceId">>;

export function createSettingsService(deps: SettingsDeps) {
  const voorkeuren = maakVoorkeuren(deps.voorkeurenOpslag);

  /**
   * Het ene `settings`-record (INV-49).
   *
   * Werpt als hij ontbreekt. Dat is geen toestand waar de gebruiker iets mee kan:
   * `startOpslag` maakt hem aan vóór de eerste lezer, dus een lege tabel betekent
   * dat de opslag buiten de app om is aangeraakt.
   */
  async function lees(): Promise<Result<Settings>> {
    const uitkomst = await deps.storage.list("settings");
    if (!uitkomst.ok) return uitkomst;

    const record = uitkomst.value[0];
    if (!record) throw new Error("Geen settings-record; INV-49 is geschonden");
    return { ok: true, value: record };
  }

  async function wijzig(wijziging: Instellingenwijziging): Promise<Result<Settings>> {
    const huidig = await lees();
    if (!huidig.ok) return huidig;

    return deps.storage.update("settings", huidig.value.id, wijziging);
  }

  return {
    lees,
    wijzig,
    /** De zes apparaatvoorkeuren uit §8.2.2. Synchroon, want `localStorage` is dat. */
    voorkeur: <Naam extends VoorkeurNaam>(naam: Naam) => voorkeuren.lees(naam),
    zetVoorkeur: <Naam extends VoorkeurNaam>(naam: Naam, waarde: Voorkeur<Naam>) =>
      voorkeuren.schrijf(naam, waarde),
  };
}

export type SettingsService = ReturnType<typeof createSettingsService>;
