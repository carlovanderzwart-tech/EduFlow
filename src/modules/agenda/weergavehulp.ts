/**
 * Wat de vier weergaven delen (§6.2.2, §6.2.3).
 *
 * Alleen vorm: namen, kleurklassen en het opzoeken van een vakantie bij een dag.
 * Het rekenwerk staat in `AgendaService` en `lib/dates` (DR-15); wat hier staat is
 * wat je anders vier keer zou schrijven.
 */

import { type IsoDate } from "@/lib/dates";
import { vandaag } from "@/lib/weergave";
import type { CSSProperties } from "react";

import type { CalendarEventKind, Colour } from "@/domain/types";
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

/**
 * De vakantie waarin deze dag valt.
 *
 * Doorgegeven vanuit `HolidayService`: het is een vraag over vakanties en niet over de
 * weergave, en het dashboard stelt hem ook. Twee weergaven die het elk zelf uitrekenen
 * zijn twee plekken waar dezelfde regel staat (§10.2, DR-11).
 */
export { vakantieOp as isVakantiedag } from "@/services/agenda/HolidayService";

/** De dag waarop dit item begint; bij een reeks bepaalt die waar hij wordt geknipt. */
export function dagVanItem(item: { allDay: boolean; start: string }): IsoDate {
  return item.allDay ? item.start : vandaag(new Date(item.start));
}

/**
 * Hoe een item eruitziet: de kleur van de soort, of zijn eigen (`FR-AGE-35`, B-133).
 *
 * Twee waarden en niet één klassenaam, want de acht van §5.5 zijn paletkleuren en
 * geen Tailwind-rollen. Ze staan als tekenverwijzing in `style` — precies zoals de
 * jaarweergave de vakantiekleuren zet, en zoals DR-55 het bedoelt: geen letterlijke
 * kleur in de component, wel een verwijzing naar `tokens.css`.
 *
 * De letterkleur ligt vast op wit. De acht zijn getoetst als vlak op wit (contrast
 * 4,75 tot 7,08), dus wit erop haalt overal de 4,5:1 van §5.3 en zwart haalt dat bij
 * `series-4` net niet. Dat de kleur in beide thema's dezelfde hex is, is hier een
 * voordeel: de letterkleur hoeft dus ook niet mee te draaien.
 */
export function itemstijl(item: { kind: CalendarEventKind; colour: Colour | null }): {
  className: string;
  style: CSSProperties | undefined;
} {
  if (!item.colour) return { className: SOORTKLASSE[item.kind], style: undefined };

  return {
    className: "",
    style: {
      backgroundColor: `var(--palette-${item.colour})`,
      color: "var(--color-text-on-accent)",
    },
  };
}
