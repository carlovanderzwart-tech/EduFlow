/**
 * Wat de vier weergaven delen (§6.2.2, §6.2.3).
 *
 * Alleen vorm: namen, kleurklassen en het opzoeken van een vakantie bij een dag.
 * Het rekenwerk staat in `AgendaService` en `lib/dates` (DR-15); wat hier staat is
 * wat je anders vier keer zou schrijven.
 */

import { type IsoDate } from "@/lib/dates";
import { vandaag } from "@/lib/weergave";
import type { CalendarEventKind } from "@/domain/types";
import type { Vakantie } from "@/services/agenda/HolidayService";

/** Maandag eerst, zoals de week in Nederland begint. */
export const DAGNAMEN = ["ma", "di", "wo", "do", "vr", "za", "zo"] as const;

/** §6.2.3: meer dan drie items in een maandcel wordt "+n meer". */
export const MAX_ITEMS_PER_CEL = 3;

/** §6.2.3: de dagweergave loopt van 07:00 tot 18:00. */
export const DAG_BEGINUUR = 7;
export const DAG_EINDUUR = 18;

/**
 * De kleur per itemsoort (§6.2.2, kolom Kleur).
 *
 * Als klassenaam en niet als kleurwaarde: de klassen verwijzen naar de tekens uit
 * `tokens.css`, en dat is wat DR-55 vraagt. Kleur is nooit de enige drager — elk
 * item toont ook zijn titel, en de dialoog noemt de soort met zoveel woorden.
 */
const SOORTKLASSE: Record<CalendarEventKind, string> = {
  afspraak: "bg-accent/15 text-foreground",
  oudergesprek: "bg-accent/30 text-foreground",
  studiedag: "bg-foreground text-background",
  margedag: "bg-muted-foreground text-background",
  vakantie: "bg-muted text-muted-foreground",
  verjaardag: "bg-accent/10 text-foreground",
  herinnering: "bg-muted text-foreground",
  documentatiemoment: "bg-accent/10 text-foreground",
};

export function soortklasse(kind: CalendarEventKind): string {
  return SOORTKLASSE[kind];
}

/** De vakantie waarin deze dag valt, of `null`. */
export function isVakantiedag(dag: IsoDate, vakanties: readonly Vakantie[]): Vakantie | null {
  return vakanties.find((vakantie) => vakantie.from <= dag && dag <= vakantie.to) ?? null;
}

/** De dag waarop dit item begint; bij een reeks bepaalt die waar hij wordt geknipt. */
export function dagVanItem(item: { allDay: boolean; start: string }): IsoDate {
  return item.allDay ? item.start : vandaag(new Date(item.start));
}
