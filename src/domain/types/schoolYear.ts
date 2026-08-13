/**
 * Schooljaar en vakantieaanpassing (§8.3.8).
 *
 * `holidayPeriods` is een leescache van `schoolvakanties.json` en geen bron
 * (§13.4). Bij een update van het bestand wordt de tabel leeggemaakt en opnieuw
 * gevuld; `holidayOverrides` blijft staan en wordt eroverheen gelegd (B-50).
 */

import type { BaseRecord, IsoDate } from "./base";

/** Een landsdeel, geen persoonsgegeven (T-01, FR-INS-25). */
export type Region = "noord" | "midden" | "zuid";

export interface SchoolYear extends BaseRecord {
  /** Bijvoorbeeld "2026-2027". */
  name: string;
  firstSchoolDay: IsoDate;
  lastSchoolDay: IsoDate;
  region: Region;
  isCurrent: boolean;
}

/**
 * Een eigen aanpassing op een adviesvakantie (B-29, FR-AGE-10).
 *
 * De sleutel is de combinatie van `schoolYearName`, `region` en `holidayKey`,
 * zodat een update van het bronbestand jouw aanpassing niet raakt (B-50,
 * FR-AGE-11). Kerst- en zomervakantie liggen landelijk vast en zijn niet aan te
 * passen; die controle staat in `HolidayService` (INV-32).
 */
/**
 * Eén vakantieperiode uit het meegeleverde bestand (§13.4, §6.2.4).
 *
 * Schooljaar en regio staan uit de omhullende structuur van het bestand op de rij
 * zelf, zodat een rij op zichzelf leesbaar is en te koppelen aan een
 * `HolidayOverride` — die sleutelt juist op die drie.
 */
export interface HolidayPeriod extends BaseRecord {
  schoolYearName: string;
  region: Region;
  holidayKey: string;
  name: string;
  from: IsoDate;
  to: IsoDate;
  /** Kerst en zomer liggen landelijk vast en zijn niet aanpasbaar (B-29, INV-32). */
  fixed: boolean;
  /**
   * De `schemaVersion` van `schoolvakanties.json`.
   *
   * Op elke rij en niet op één centrale plek: de tabel wordt in één keer geleegd
   * en opnieuw gevuld, dus elke rij draagt dezelfde versie en één rij lezen is
   * genoeg om te weten of het bestand nieuwer is (§13.4).
   */
  fileVersion: number;
}

export interface HolidayOverride extends BaseRecord {
  schoolYearName: string;
  region: Region;
  holidayKey: string;
  from: IsoDate;
  to: IsoDate;
}
