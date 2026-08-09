/**
 * Schooljaar en vakantieaanpassing (§8.3.8).
 *
 * `holidayPeriods` staat hier **niet**. §8.3.8 beschrijft die tabel in proza als
 * "een leescache van het meegeleverde bestand" en geeft er geen veldtabel bij.
 * De velden zijn alleen te reconstrueren uit het JSON-bestand in §6.2.4, en dat
 * is ontwerpen in plaats van afleiden. Zie de openstaande punten bij
 * implementatiestap 3.
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
export interface HolidayOverride extends BaseRecord {
  schoolYearName: string;
  region: Region;
  holidayKey: string;
  from: IsoDate;
  to: IsoDate;
}
