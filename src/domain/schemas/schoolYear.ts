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
 * `holidayPeriods` ontbreekt: §8.3.8 beschrijft die tabel in proza zonder
 * veldtabel. Zie de openstaande punten bij implementatiestap 3.
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

export const zHolidayOverride = recordSchema({
  schoolYearName: z.string().min(1),
  region: zRegion,
  holidayKey: z.string().min(1),
  from: zIsoDate,
  to: zIsoDate,
});
