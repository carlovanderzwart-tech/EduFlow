/**
 * De basisweek en wat er per dag van afwijkt.
 *
 * > **Dit model staat op de nominatie om te verdwijnen (B-131).** B-115 heeft
 * > besloten dat de basisweek een *invoerscherm* is en geen tweede gegevensmodel:
 * > je vult je vaste week in en de app maakt daar gewone herhalende agenda-items
 * > van. De omzetting hoorde bij D09b en is daar niet gedaan. Zolang deze bestanden
 * > er staan, zijn er twee mechanismen voor één probleem — precies wat U-05 en
 * > DR-03 verbieden. Niets in `services/` of `modules/` raakt dit model nog aan;
 * > alleen de twee Dexie-tabellen bestaan nog, en die gaan er met een
 * > versieverhoging uit.
 *
 * De kop hierboven beriep zich tot B-131 op `§6.2.11`, `§8.3.15`, `§8.3.16`,
 * `B-98`, `B-99` en `B-100`. Geen van die zes bestaat: de drie paragrafen staan
 * niet in het handboek en de drie nummers vallen in het gat tussen `B-97` en
 * `B-103` dat bij de nummercorrectie van 11 augustus is ontstaan. Ze zijn hier weg
 * gehaald in plaats van vervangen, want de tekst eronder beschreef een ontwerp dat
 * B-115 al had teruggedraaid.
 *
 * De leerkracht vult zijn normale week één keer in; de app zet die door naar zijn
 * schooldagen. Wat dat oplevert wordt berekend en nooit opgeslagen: er is geen type
 * voor, want er is geen record.
 *
 * Een wijziging werkt vanaf een datum. Daarom is er niet één basisweek per
 * schooljaar maar één per geldigheidsperiode: elke wijziging sluit de lopende af en
 * opent een nieuwe. Dat is dezelfde vorm als `GroupMembership` met `from` en `to`
 * (INV-24, B-16), en om dezelfde reden.
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
 * Wat er op één concrete dag anders is.
 *
 * `FR-AGE-29` stond hier als bron, maar B-115 heeft die eis herschreven: hij gaat nu
 * over het invoerscherm dat herhalende items maakt, niet over dit record.
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
