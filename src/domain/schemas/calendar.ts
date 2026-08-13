/**
 * Schema van `calendarEvents` (§6.2.2, §8.3.8, INV-31).
 *
 * Een gediscrimineerde unie op `allDay`, en dat is wat INV-31 met "twee varianten
 * in één unie" bedoelt: de vorm met tijden en de vorm zonder sluiten elkaar uit.
 * Een boolean náást twee datumtijdvelden zou beide vormen tegelijk toelaten en de
 * invariant leeg maken.
 *
 * Hij is niet met `recordSchema` gebouwd, want dat levert een verfijnd schema op
 * en een verfijnd schema past niet in een gediscrimineerde unie. De basisvelden
 * en INV-04 komen daarom uit `BASISVELDEN` en `metChronologie`, zodat er geen
 * tweede plek ontstaat waar die regels staan.
 *
 * INV-30 — het einde ligt niet vóór het begin — staat als verfijning op de unie.
 * Vergelijken op de tekenreeks mag binnen één variant: beide vormen hebben een
 * vaste breedte, dus alfabetische volgorde ís chronologische volgorde.
 */

import { z } from "zod";

import { BASISVELDEN, metChronologie, zIsoDate, zIsoDateTime, zUuid } from "./base";

export const zCalendarEventKind = z.enum([
  "afspraak",
  "oudergesprek",
  "studiedag",
  "margedag",
  "vakantie",
  "verjaardag",
  "herinnering",
  "documentatiemoment",
]);

export const zCalendarEventSource = z.enum(["own", "holidayFile", "imported", "derived"]);

const GEMEENSCHAPPELIJK = {
  ...BASISVELDEN,
  title: z.string().min(1).max(120),
  kind: zCalendarEventKind,
  note: z.string().max(2_000),
  location: z.string().max(120),
  groupIds: z.array(zUuid),
  studentIds: z.array(zUuid),
  documentationId: zUuid.nullable(),
  mailDraftId: zUuid.nullable(),
  source: zCalendarEventSource,
};

/** Het einde ligt niet vóór het begin (INV-30). */
function eindeNietVoorBegin(item: { start: string; end: string }): boolean {
  return item.end >= item.start;
}

export const zCalendarEvent = metChronologie(
  z
    .discriminatedUnion("allDay", [
      z.strictObject({
        ...GEMEENSCHAPPELIJK,
        allDay: z.literal(true),
        start: zIsoDate,
        end: zIsoDate,
      }),
      z.strictObject({
        ...GEMEENSCHAPPELIJK,
        allDay: z.literal(false),
        start: zIsoDateTime,
        end: zIsoDateTime,
      }),
    ])
    .refine(eindeNietVoorBegin, { message: "Het einde ligt vóór het begin", path: ["end"] }),
);
