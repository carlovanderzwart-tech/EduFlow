/**
 * Schema's van `weekPatterns` en `weekPatternOverrides` (§8.3.15, §8.3.16, B-98).
 *
 * INV-55 staat hier: een weekonderdeel eindigt ná zijn begin, op dezelfde dag.
 * Vergelijken op de tekenreeks mag, want `UU:MM` heeft een vaste breedte.
 *
 * INV-54 — de geldigheidsperiodes binnen één schooljaar overlappen niet — staat
 * hier **niet**. Die vraagt om andere records en hoort in `AgendaService`.
 *
 * En de regel dat een aangepaste dag naar een bestaand weekonderdeel verwijst,
 * staat er ook niet: die kán niet altijd waar zijn. Wijzigt de basisweek vanaf een
 * datum vóór een bestaande aanpassing, dan bungelt de verwijzing. Dat wordt
 * behandeld zoals INV-13 een ontbrekende foto behandelt — geen effect, en de
 * opruimronde ruimt hem op met één logregel.
 */

import { z } from "zod";

import { recordSchema, zIsoDate, zLocalTime, zUuid } from "./base";

/** Het einde ligt ná het begin, op dezelfde dag (INV-55). */
function eindeNaBegin(onderdeel: { startTime: string; endTime: string }): boolean {
  return onderdeel.endTime > onderdeel.startTime;
}

export const zWeekPatternLine = z
  .strictObject({
    id: zUuid,
    // ISO-8601 weekdag: 1 is maandag, 7 is zondag.
    weekday: z.number().int().min(1).max(7),
    startTime: zLocalTime,
    endTime: zLocalTime,
    title: z.string().min(1).max(120),
    groupId: zUuid.nullable(),
  })
  .refine(eindeNaBegin, { message: "De eindtijd ligt niet ná de begintijd", path: ["endTime"] });

export const zWeekPattern = recordSchema({
  schoolYearId: zUuid,
  validFrom: zIsoDate,
  validTo: zIsoDate.nullable(),
  lines: z.array(zWeekPatternLine).max(40),
}).refine((week) => !week.validTo || week.validTo >= week.validFrom, {
  message: "De einddatum ligt vóór de begindatum",
  path: ["validTo"],
});

export const zWeekPatternOverrideKind = z.enum([
  "dag-vervalt",
  "onderdeel-vervalt",
  "onderdeel-anders",
]);

const DAG = { date: zIsoDate };

export const zWeekPatternOverride = z.discriminatedUnion("kind", [
  recordSchema({ ...DAG, kind: z.literal("dag-vervalt") }),
  recordSchema({ ...DAG, kind: z.literal("onderdeel-vervalt"), lineId: zUuid }),
  recordSchema({
    ...DAG,
    kind: z.literal("onderdeel-anders"),
    lineId: zUuid,
    // Leeg betekent: ongewijzigd ten opzichte van het weekonderdeel.
    title: z.string().min(1).max(120).nullable(),
    startTime: zLocalTime.nullable(),
    endTime: zLocalTime.nullable(),
    groupId: zUuid.nullable(),
  }),
]);
