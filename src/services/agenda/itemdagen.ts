/**
 * Op welke dagen een agenda-item valt (§6.2.3, §8.1.4).
 *
 * Apart van `AgendaService` omdat `RecurrenceService` het ook nodig heeft, en een
 * kring van twee modules die elkaar importeren is het soort ding dat pas opvalt als
 * een bundelaar hem verkeerd uitrolt. Dit bestand raakt de opslag niet.
 */

import { dagenVan, overlapt, type IsoDate } from "@/lib/dates";
import { vandaag } from "@/lib/weergave";
import type { CalendarEvent } from "@/domain/types";

/**
 * De kalenderdagen die een item beslaat.
 *
 * Een hele-dag-item draagt ze zelf; een item met tijden wordt naar de lokale dag
 * gebracht. Dat laatste hoort in de weergavelaag (§8.1.4), en `vandaag` uit
 * `lib/weergave.ts` is die ene plek waar de omrekening staat — hier wordt hij
 * gebruikt, niet nog eens geschreven.
 */
export function dagenVanItem(item: CalendarEvent): IsoDate[] {
  if (item.allDay) return dagenVan(item.start, item.end);

  const begin = vandaag(new Date(item.start));
  const einde = vandaag(new Date(item.end));
  return dagenVan(begin, einde < begin ? begin : einde);
}

/** Raakt dit item de periode van `van` tot en met `tot`? */
export function raaktPeriode(item: CalendarEvent, van: IsoDate, tot: IsoDate): boolean {
  const dagen = dagenVanItem(item);
  const eerste = dagen[0];
  const laatste = dagen[dagen.length - 1];
  return Boolean(eerste && laatste && overlapt(eerste, laatste, van, tot));
}

/**
 * De items per kalenderdag, voor week, maand en jaar.
 *
 * Een item dat over meer dagen loopt staat op elke dag die het raakt: een vakantie
 * hoort in de maandweergave op elk van haar negen cellen te kleuren, niet alleen op
 * de eerste.
 */
export function perDag(
  items: readonly CalendarEvent[],
  van: IsoDate,
  tot: IsoDate,
): Map<IsoDate, CalendarEvent[]> {
  const uit = new Map<IsoDate, CalendarEvent[]>(dagenVan(van, tot).map((dag) => [dag, []]));

  for (const item of items) {
    for (const dag of dagenVanItem(item)) {
      uit.get(dag)?.push(item);
    }
  }

  for (const rij of uit.values()) rij.sort((a, b) => a.start.localeCompare(b.start));
  return uit;
}
