/**
 * Het agenda-item (§6.2.2, §8.3.8).
 *
 * **Eén begrip in twee vormen** (INV-31). `allDay` bepaalt het type van `start` en
 * `end`: een hele-dag-item draagt kalenderdagen, een item met tijden draagt
 * tijdstippen in UTC. Dat volgt uit §8.1.4 — een kalenderdag wordt nooit als
 * tijdstip opgeslagen, want dan verschuift 1 januari op de helft van de apparaten
 * naar 31 december. Daarmee is de hele-dag-variant vanzelf tijdloos, zoals INV-31
 * eist, en houden beide varianten een begin én een einde, zoals INV-30 eist.
 *
 * De velden heten in beide vormen `start` en `end`, zodat de index `[start+end]`
 * uit §8.3.8 en de zoekvraag uit §8.5 ongewijzigd blijven. Een kalenderdag
 * sorteert daarin vóór een tijdstip op diezelfde dag, en dat is de gewenste
 * volgorde: een studiedag staat boven de afspraken van die dag.
 *
 * **`recurrence` hoort erbij** (§6.2.2, §6.2.5, B-123). Een eerdere versie liet het
 * veld niet toe met een beroep op `B-101`; dat nummer bestaat niet en het besluit is
 * er nooit geweest. B-115 leunt er juist op: de basisweek maakt gewone herhalende
 * agenda-items.
 */

import type { BaseRecord, IsoDate, IsoDateTime, Uuid } from "./base";

/** De drie regels van §6.2.5. Meer niet, en met opzet geen `RRULE`. */
export type RecurrenceFrequency = "wekelijks" | "tweewekelijks" | "maandelijks";

/**
 * Een herhaling (§6.2.5, B-123).
 *
 * **Precies één van `until` en `count` is gevuld.** Allebei leeg levert een reeks
 * zonder einde op, en die is nergens te tellen en nooit klaar met uitrekenen;
 * allebei gevuld geeft twee einden waarvan nergens staat welke wint.
 */
export interface Recurrence {
  frequency: RecurrenceFrequency;
  /** De laatste dag waarop de reeks nog kan vallen. */
  until: IsoDate | null;
  /** Het aantal keren, de eerste meegeteld. */
  count: number | null;
  /**
   * De dagen waarop deze reeks niet valt.
   *
   * §6.2.5: "Een uitzondering op één datum wordt een losgemaakt item; de reeks
   * krijgt op die datum een gat." Het losgemaakte item is een gewoon item; hier
   * staat alleen het gat.
   */
  excludedDates: IsoDate[];
}

/** De acht soorten uit §6.2.2. Meer soorten maken de agenda rommeliger. */
export type CalendarEventKind =
  | "afspraak"
  | "oudergesprek"
  | "studiedag"
  | "margedag"
  | "vakantie"
  | "verjaardag"
  | "herinnering"
  | "documentatiemoment";

export type CalendarEventSource = "own" | "holidayFile" | "imported" | "derived";

interface CalendarEventBase extends BaseRecord {
  title: string;
  kind: CalendarEventKind;
  note: string;
  location: string;
  groupIds: Uuid[];
  studentIds: Uuid[];
  /** Eenrichtingsverwijzing: de documentatie weet niet dat dit item bestaat (§6.2.6). */
  documentationId: Uuid | null;
  mailDraftId: Uuid | null;
  source: CalendarEventSource;
  /** De herhaling, of `null` voor een item dat één keer valt (§6.2.5, B-123). */
  recurrence: Recurrence | null;
}

/** Een studiedag, margedag of vakantie: kalenderdagen, geen tijden (INV-31). */
export interface AllDayCalendarEvent extends CalendarEventBase {
  allDay: true;
  start: IsoDate;
  /** De laatste dag, zodat een vakantie van negen dagen één item is. */
  end: IsoDate;
}

/** Een afspraak, oudergesprek of herinnering: tijdstippen in UTC. */
export interface TimedCalendarEvent extends CalendarEventBase {
  allDay: false;
  start: IsoDateTime;
  end: IsoDateTime;
}

export type CalendarEvent = AllDayCalendarEvent | TimedCalendarEvent;
