/**
 * Verantwoordingslogboek en wijzigingsjournaal (§8.3.13).
 *
 * Twee registraties met twee verschillende doelen (§16.1).
 *
 * Een `AuditEvent` legt vast wat je een jaar later moet kunnen aantonen: wat het
 * apparaat verliet, wat geblokkeerd werd, wat gegevens wiste. Hij wordt alleen
 * toegevoegd, nooit gewijzigd en nooit verwijderd (INV-52) — een aanpasbaar
 * logboek bewijst niets. `detail` is feitelijk en zonder namen: "Export:
 * deelbare afbeelding, 3 pagina's, initialen aan", niet "Export van 'Kjeld bouwt
 * een brug'" (§16.2, DR-44).
 *
 * Een `ChangeLogEntry` is de invoer van `SyncService` in fase 2 (B-24). Hij
 * bevat **geen veldwaarden**, alleen welk record wanneer wijzigde. In versie 1.0
 * wordt de lijst alleen geschreven en niet gelezen; dat hij er nu al is, is de
 * hele reden dat een latere eerste synchronisatie niet de hele database hoeft te
 * vergelijken.
 */

import type { BaseRecord, IsoDateTime, Uuid } from "./base";

export interface AuditEvent extends BaseRecord {
  kind: string;
  at: IsoDateTime;
  deviceName: string;
  /** Feitelijk, zonder namen (§16.2, DR-44). */
  detail: string;
  actorNote: string;
}

export type ChangeOperation = "create" | "update" | "delete";

/**
 * De enige tabel die **niet** van `BaseRecord` erft (§8.3).
 *
 * Een journaalregel heeft geen eigen levensloop: hij wordt geschreven en
 * vervalt als oudste regel zodra de ringbuffer van 5.000 vol is. Een `rev` op
 * een journaalregel zou een teller op een teller zijn.
 */
export interface ChangeLogEntry {
  table: string;
  /** De wortelsleutel van het gewijzigde aggregaat (§9.6). */
  recordId: Uuid;
  rev: number;
  op: ChangeOperation;
  at: IsoDateTime;
  origin: Uuid;
}
