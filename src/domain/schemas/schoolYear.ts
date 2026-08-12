/**
 * Schema's van `schoolYears` en `holidayOverrides` (§8.3.8).
 *
 * INV-28 — een schooljaar begint vóór het eindigt en overlapt geen ander
 * schooljaar — staat hier niet. De tweede helft gaat over andere records, en
 * §9.5.3 legt de hele invariant bij `AgendaService`.
 *
 * INV-32 en INV-33 — welke vakanties aanpasbaar zijn en of een aanpassing bij
 * een bestaande periode hoort — horen bij `HolidayService`.
 *
 * `holidayPeriods` is een leescache van `schoolvakanties.json` (§13.4). De
 * bestandsversie staat op elke rij, want de tabel wordt in één keer geleegd en
 * opnieuw gevuld; één rij lezen is genoeg om te weten of het bestand nieuwer is.
 */

import { z } from "zod";

import { recordSchema, zIsoDate } from "./base";

export const zRegion = z.enum(["noord", "midden", "zuid"]);

export const zSchoolYear = recordSchema({
  name: z.string().min(1),
  firstSchoolDay: zIsoDate,
  lastSchoolDay: zIsoDate,
  region: zRegion,
  isCurrent: z.boolean(),
});

export const zHolidayPeriod = recordSchema({
  schoolYearName: z.string().min(1),
  region: zRegion,
  holidayKey: z.string().min(1),
  name: z.string().min(1).max(60),
  from: zIsoDate,
  to: zIsoDate,
  fixed: z.boolean(),
  fileVersion: z.number().int().min(1),
}).refine((periode) => periode.to >= periode.from, {
  message: "De einddatum ligt vóór de begindatum",
  path: ["to"],
});

export const zHolidayOverride = recordSchema({
  schoolYearName: z.string().min(1),
  region: zRegion,
  holidayKey: z.string().min(1),
  from: zIsoDate,
  to: zIsoDate,
});
