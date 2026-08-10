/**
 * Schema's van `groups` en `groupMemberships` (§8.3.2, §8.3.3).
 *
 * De verfijning op het datumpaar is INV-24: een einddatum ligt nooit vóór de
 * begindatum. §8.3.3 schrijft die verfijning zelf voor, met het pad naar het
 * veld `to`, zodat het scherm het juiste veld kan aanwijzen. Vergelijken met `>=`
 * mag op de tekenreeks zelf, want `JJJJ-MM-DD` is een vorm met vaste breedte:
 * alfabetische volgorde is daar chronologische volgorde.
 *
 * INV-25 — twee lidmaatschappen van dezelfde leerling in dezelfde groep
 * overlappen elkaar niet — staat hier **niet**. Die controle vraagt om andere
 * records en hoort volgens §8.3.3 en §9.5.3 in `GroupService`, binnen de
 * transactie van het `Group`-aggregaat.
 */

import { z } from "zod";

import { recordSchema, zIsoDate, zUuid } from "./base";
import { zColour } from "./colour";

export const zGroupKind = z.enum([
  "stamgroep",
  "combinatiegroep",
  "projectgroep",
  "zorggroep",
  "instroomgroep",
  "overig",
]);

export const zGroup = recordSchema({
  name: z.string().min(1).max(60),
  kind: zGroupKind,
  schoolYearId: zUuid,
  colour: zColour,
});

export const zMembershipRole = z.enum(["lid", "gast"]);

export const zGroupMembership = recordSchema({
  studentId: zUuid,
  groupId: zUuid,
  from: zIsoDate,
  to: zIsoDate.nullable(),
  role: zMembershipRole,
}).refine((lidmaatschap) => !lidmaatschap.to || lidmaatschap.to >= lidmaatschap.from, {
  message: "Einddatum ligt vóór de begindatum",
  path: ["to"],
});
