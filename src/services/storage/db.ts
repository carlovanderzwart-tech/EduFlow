/**
 * De Dexie-database (§8.2.1, T-40).
 *
 * Dit is de enige plek in het project waar Dexie wordt aangeraakt (DR-13). Alles
 * daarbuiten gaat via `StorageService`.
 *
 * De naam is `eduflow-v1` en de versie is 2 (T-40, §8.6). Versie 1 begon op een
 * schone database: er kwam geen migratieketen vanaf de ontwikkelversie, want die
 * zou precies één keer draaien op nul records en daarna jarenlang onderhouden
 * moeten worden (U-05, DR-02).
 *
 * **Versie 2 haalt twee tabellen weg** (B-146). `weekPatterns` en
 * `weekPatternOverrides` waren het eigen gegevensmodel van de basisweek; B-115
 * besliste dat de basisweek een invoerscherm is dat gewone herhalende agenda-items
 * maakt, en B-131 stelde vast dat de tabellen daarna waren blijven staan zonder dat
 * één service of scherm ze aanraakte.
 *
 * De stap staat hieronder uitgeschreven en niet alleen in `TABELLEN`, want een
 * tabel die uit de lijst verdwijnt blijft in een bestaande browser gewoon staan.
 * Dexie ruimt hem pas op als je hem bij een hogere versie op `null` zet.
 */

import Dexie, { type Table } from "dexie";

import type { ChangeLogEntry } from "@/domain/types";

import { TABELLEN, type RecordVan, type TabelNaam } from "./tabellen";

export const DATABASENAAM = "eduflow-v1";

/**
 * Zoals §8.6 hem bedoelt: de versie die Dexie beheert, naast de `schemaVersion`
 * per record.
 *
 * De browser meldt hier `10` en niet `1`. Dat is Dexie: hij vermenigvuldigt zijn
 * eigen versienummer met tien om ruimte te houden voor tussenstappen. `dbVersion`
 * in het manifest van §8.7 is de 1 die hier staat, niet de 10 die je in de
 * ontwikkelaarsgereedschappen ziet.
 */
export const DB_VERSIE = 2;

/**
 * Wat versie 2 opruimt (B-146).
 *
 * Een naam hier is een belofte dat de tabel weg mag: er staat geen enkel record in
 * dat ergens nog gelezen wordt. Zou dat ooit niet kloppen, dan is dit de plek waar
 * eerst een overzetstap komt te staan en pas daarna de `null`.
 */
const VERVALLEN_IN_V2 = ["weekPatterns", "weekPatternOverrides"] as const;

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

    const stores: Record<string, string | null> = { changeLog: "++, at, recordId" };
    for (const [naam, tabel] of Object.entries(TABELLEN)) {
      stores[naam] = `id, ${tabel.indexen}`;
    }

    // `null` is Dexie's manier om een store op te heffen. Een bestaande browser
    // ruimt ze op bij het openen; een nieuwe heeft ze nooit gehad.
    for (const naam of VERVALLEN_IN_V2) stores[naam] = null;

    this.version(DB_VERSIE).stores(stores);
  }
}

/** Een database is een gewoon object hier: een test maakt er zijn eigen. */
export type EduFlowDatabase = EduFlowDb & Tabellen;

export function maakDatabase(naam?: string): EduFlowDatabase {
  return new EduFlowDb(naam) as EduFlowDatabase;
}
