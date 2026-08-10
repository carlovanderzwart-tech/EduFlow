/**
 * De basisweek en wat er per dag van afwijkt (§6.2.11, §8.3.15, §8.3.16, B-98).
 *
 * De leerkracht vult zijn normale week één keer in; de app zet die door naar zijn
 * schooldagen. Wat dat oplevert wordt **berekend en nooit opgeslagen** (B-100,
 * INV-56) — er is geen type voor, want er is geen record.
 *
 * Een wijziging aan de basisweek werkt vanaf een datum (B-99). Daarom is er niet
 * één basisweek per schooljaar maar één per geldigheidsperiode: elke wijziging
 * sluit de lopende af en opent een nieuwe. Oude dagen wijzen zo vanzelf naar de
 * versie die toen gold, en het verleden kan niet stukgaan. Dat is dezelfde vorm
 * als `GroupMembership` met `from` en `to` (INV-24, B-16), en om dezelfde reden.
 */

import type { BaseRecord, IsoDate, LocalTime, Uuid } from "./base";

/**
 * Eén regel in de normale week. Ingebed, geen eigen record.
 *
 * Hij heeft geen eigen levensduur, geen verwijzingen van buiten behalve
 * `WeekPatternOverride.lineId`, en geen zin buiten zijn week — dezelfde drie
 * redenen waarom een blok in §8.3.6 ingebed staat.
 */
export interface WeekPatternLine {
  /** Stabiel binnen deze versie van de basisweek; waar een aangepaste dag naar wijst. */
  id: Uuid;
  /** ISO-8601 weekdag: 1 is maandag. */
  weekday: number;
  startTime: LocalTime;
  endTime: LocalTime;
  title: string;
  /** Draagt de knop "Maak documentatie" (FR-AGE-17). */
  groupId: Uuid | null;
}

export interface WeekPattern extends BaseRecord {
  schoolYearId: Uuid;
  validFrom: IsoDate;
  /** Leeg betekent: dit is de geldende versie. */
  validTo: IsoDate | null;
  lines: WeekPatternLine[];
}

/**
 * Wat er op één concrete dag anders is (FR-AGE-29).
 *
 * Drie varianten die elkaar uitsluiten. Een **extra** activiteit op één dag staat
 * hier niet bij: dat is gewoon een agenda-item, en daar bestaat `CalendarEvent`
 * al voor. Een hele week die anders verloopt is vijf keer `dag-vervalt`.
 */
export type WeekPatternOverrideKind = "dag-vervalt" | "onderdeel-vervalt" | "onderdeel-anders";

interface WeekPatternOverrideBase extends BaseRecord {
  /** Het schooljaar volgt uit de datum, net als bij `CalendarEvent` (§9.4). */
  date: IsoDate;
}

/** Deze dag levert de basisweek niets op. */
export interface DayCancelled extends WeekPatternOverrideBase {
  kind: "dag-vervalt";
}

/** Eén weekonderdeel vervalt vandaag. */
export interface LineCancelled extends WeekPatternOverrideBase {
  kind: "onderdeel-vervalt";
  lineId: Uuid;
}

/** Eén weekonderdeel is vandaag anders. Leeg veld betekent: ongewijzigd. */
export interface LineChanged extends WeekPatternOverrideBase {
  kind: "onderdeel-anders";
  lineId: Uuid;
  title: string | null;
  startTime: LocalTime | null;
  endTime: LocalTime | null;
  groupId: Uuid | null;
}

export type WeekPatternOverride = DayCancelled | LineCancelled | LineChanged;
