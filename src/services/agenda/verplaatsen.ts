/**
 * Een item verplaatsen (§6.2.5, B-38, `NFR-35`).
 *
 * **Slepen is nooit de enige manier.** Dat is geen vriendelijkheid maar een eis: B-38
 * en `NFR-35` schrijven een toegankelijke tegenhanger voor, en §6.2.5 noemt de toetsen
 * met zoveel woorden — pijl een kwartier, `Shift` een dag, `Ctrl` een week.
 *
 * Het rekenwerk staat hier en niet in de weergaven, zodat slepen en toetsen door
 * dezelfde functie gaan. Anders schuift de ene een kwartier en de andere twintig
 * minuten, en dat is precies het soort verschil dat niemand meldt maar iedereen merkt.
 */

import { plusDagen, type IsoDate } from "@/lib/dates";
import type { CalendarEvent } from "@/domain/types";

import type { Agendainvoer } from "./AgendaService";

/** De drie stappen uit §6.2.5, in minuten. */
export const STAP_MINUTEN = {
  kwartier: 15,
  dag: 24 * 60,
  week: 7 * 24 * 60,
} as const;

export type Stap = keyof typeof STAP_MINUTEN;

/** De hint die bij het selecteren verschijnt (§6.2.5). */
export const TOETSENHINT =
  "Pijltoetsen verschuiven een kwartier, Shift een dag, Ctrl een week. Enter opent het item.";

/**
 * Welke stap een toetsaanslag betekent.
 *
 * `Ctrl` vóór `Shift`, want wie beide indrukt bedoelt de grootste stap; een week is
 * wat je met twee vingers vraagt.
 */
export function stapVan(gebeurtenis: { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }): Stap {
  if (gebeurtenis.ctrlKey || gebeurtenis.metaKey) return "week";
  if (gebeurtenis.shiftKey) return "dag";
  return "kwartier";
}

/**
 * Hoeveel minuten een item opschuift bij deze stap.
 *
 * Een hele-dag-item schuift **altijd in hele dagen**: een studiedag een kwartier
 * later zetten betekent niets, en een pijltoets die niets doet leest als een kapotte
 * app. De pijl wordt daar dus één dag, en `Shift` en `Ctrl` blijven dag en week.
 */
export function minutenVoor(item: CalendarEvent, stap: Stap): number {
  if (!item.allDay) return STAP_MINUTEN[stap];
  return stap === "kwartier" ? STAP_MINUTEN.dag : STAP_MINUTEN[stap];
}

/**
 * Het item, zoveel minuten verschoven, als invoer voor `AgendaService`.
 *
 * De herhaling gaat mee: verplaats je een verschijning, dan bepaalt de
 * reikwijdtevraag van `FR-AGE-15` wat daarmee gebeurt — niet deze functie.
 */
export function verschoven(item: CalendarEvent, minuten: number): Agendainvoer {
  const gemeenschappelijk = {
    title: item.title,
    kind: item.kind,
    note: item.note,
    location: item.location,
    studentIds: item.studentIds,
    recurrence: item.recurrence,
  };

  if (item.allDay) {
    const dagen = Math.round(minuten / STAP_MINUTEN.dag);
    return {
      ...gemeenschappelijk,
      allDay: true,
      start: plusDagen(item.start, dagen),
      end: plusDagen(item.end, dagen),
    };
  }

  const schuif = (tijdstip: string) =>
    new Date(new Date(tijdstip).getTime() + minuten * 60_000).toISOString();

  return { ...gemeenschappelijk, allDay: false, start: schuif(item.start), end: schuif(item.end) };
}

/**
 * Het item verplaatst naar een andere dag, met behoud van het tijdstip.
 *
 * Dit is wat slepen doet: je pakt een afspraak van dinsdag en laat hem op donderdag
 * vallen, en dan blijft hij om negen uur beginnen. Slepen naar een ander tijdstip
 * binnen dezelfde dag is `verschoven` met een aantal minuten.
 */
export function naarDag(item: CalendarEvent, dag: IsoDate): Agendainvoer {
  const eigenDag = item.allDay ? item.start : item.start.slice(0, 10);
  const dagen = Math.round(
    (new Date(`${dag}T00:00:00.000Z`).getTime() -
      new Date(`${eigenDag}T00:00:00.000Z`).getTime()) /
      86_400_000,
  );

  return verschoven(item, dagen * STAP_MINUTEN.dag);
}
