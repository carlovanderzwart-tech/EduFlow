/**
 * De Dexie-database (§8.2.1, T-40).
 *
 * Dit is de enige plek in het project waar Dexie wordt aangeraakt (DR-13). Alles
 * daarbuiten gaat via `StorageService`.
 *
 * De naam is `eduflow-v1` en de versie is 1 (T-40, T-47). Versie 1.0 begint op een
 * schone database: er komt geen migratieketen vanaf de ontwikkelversie, want die
 * zou precies één keer draaien op nul records en daarna jarenlang onderhouden
 * moeten worden (U-05, DR-02).
 */

import Dexie, { type Table } from "dexie";

import type { ChangeLogEntry } from "@/domain/types";

import { TABELLEN, type RecordVan, type TabelNaam } from "./tabellen";

export const DATABASENAAM = "eduflow-v1";

/** Zoals §8.6 hem bedoelt: de versie die Dexie beheert, naast de `schemaVersion` per record. */
export const DB_VERSIE = 1;

/** De ringbuffer van §8.3.13 houdt vijfduizend regels vast. */
export const CHANGELOG_MAX = 5_000;

/** Na een geslaagde back-up wordt hij tot vijfhonderd regels ingekort (§8.3.13). */
export const CHANGELOG_NA_BACKUP = 500;

type Tabellen = { [Naam in TabelNaam]: Table<RecordVan<Naam>, string> };

export class EduFlowDb extends Dexie {
  /**
   * Het wijzigingsjournaal (§8.3.13).
   *
   * De enige store met een sleutel **buiten** het record. Een `ChangeLogEntry`
   * erft niet van `BaseRecord` en heeft geen `id`; Dexie's `++` geeft hem een
   * oplopend nummer dat niet in het record terechtkomt, zodat het strikte schema
   * hem bij het lezen niet afkeurt.
   */
  declare changeLog: Table<ChangeLogEntry, number>;

  constructor(naam: string = DATABASENAAM) {
    super(naam);

    const stores: Record<string, string> = { changeLog: "++, at, recordId" };
    for (const [naam, tabel] of Object.entries(TABELLEN)) {
      stores[naam] = `id, ${tabel.indexen}`;
    }

    this.version(DB_VERSIE).stores(stores);
  }
}

/** Een database is een gewoon object hier: een test maakt er zijn eigen. */
export type EduFlowDatabase = EduFlowDb & Tabellen;

export function maakDatabase(naam?: string): EduFlowDatabase {
  return new EduFlowDb(naam) as EduFlowDatabase;
}
