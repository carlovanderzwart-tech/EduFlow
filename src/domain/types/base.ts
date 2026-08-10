/**
 * Het basistype van elk opgeslagen record (§8.1.5).
 *
 * Elke tabel behalve `changeLog` slaat records op die `BaseRecord` uitbreiden.
 * Dat is geen suggestie maar een voorwaarde: zonder deze zes velden is een latere
 * synchronisatie een verbouwing in plaats van een toevoeging (B-24, T-11).
 *
 * `Uuid`, `IsoDateTime` en `IsoDate` staan in §8.1.5 naast `BaseRecord`, maar ze
 * wonen sinds implementatiestap 2 in `lib/`. Ze worden hier doorgegeven en niet
 * opnieuw verklaard: twee verklaringen van hetzelfde type zijn twee waarheden
 * (U-02).
 */

import type { IsoDate, IsoDateTime, LocalTime } from "@/lib/dates";
import type { Uuid } from "@/lib/uuid";

export type { IsoDate, IsoDateTime, LocalTime, Uuid };

export interface BaseRecord {
  id: Uuid;
  /** Moment van ontstaan, in UTC. Verandert nooit meer. */
  createdAt: IsoDateTime;
  /** Moment van de laatste inhoudelijke wijziging, in UTC. */
  updatedAt: IsoDateTime;
  /** Niet `null` betekent: verwijderd (grafsteen, §8.1.6). */
  deletedAt: IsoDateTime | null;
  /** Teller die bij elke schrijfactie met één omhoog gaat. Begint op 1 (INV-03). */
  rev: number;
  /** Apparaat-id van het apparaat dat deze versie schreef. Niet de gebruiker (B-21). */
  origin: Uuid;
  /** Schemaversie waarin dit record is opgeschreven (INV-06). */
  schemaVersion: number;
}

/**
 * De acht kleuren uit §5.5.
 *
 * `groups.colour` en `series.colour` heten in §8.3.2 en §8.3.4 allebei "een van
 * acht" zonder de acht op te sommen. §5.5 somt precies één verzameling van acht
 * op, als ontwerptekens `series-1` tot en met `series-8`. Meer dan acht bestaat
 * niet: vanaf de negende reeks begint de toekenning opnieuw bij `series-1`.
 */
export type Colour =
  | "series-1"
  | "series-2"
  | "series-3"
  | "series-4"
  | "series-5"
  | "series-6"
  | "series-7"
  | "series-8";
