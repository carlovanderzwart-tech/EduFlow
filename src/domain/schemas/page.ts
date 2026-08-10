/**
 * Schema's van `pages` en de ingebedde blokken (§8.3.6).
 *
 * Het blokschema is een gediscrimineerde unie op `kind`. Dat is wat INV-10
 * bedoelt met handhaving in het type: een blok is precies één soort, en een
 * fotoblok met een citaatveld erin bestaat niet.
 *
 * `order` heeft hier de ondergrens uit de veldtabel van §8.3.6 (`≥ 0`). Dat
 * `de volgnummers aaneengesloten vanaf 1 lopen` is INV-11, en die invariant gaat
 * over de verzameling pagina's van één documentatie; hij wordt volgens §9.5.2
 * door `PageService` bewaakt bij invoegen en verwijderen, niet door het schema
 * van één losse pagina.
 *
 * INV-12 — twee blokken staan nooit in hetzelfde slot — hoort volgens §9.5.2 bij
 * `LayoutService` en staat hier daarom niet.
 */

import { z } from "zod";

import { recordSchema, zUuid } from "./base";

export const zLayoutId = z.enum([
  "A-fotoraster",
  "B-verhaal",
  "C-groot-beeld",
  "D-alleen-beeld",
  "E-vervolg",
]);

const zBlockBase = z.strictObject({
  id: zUuid,
  slot: z.number().int(),
  order: z.number().int(),
});

/** Verhoudingen van 0 tot 1, niet pixels (B-65). */
export const zCrop = z.strictObject({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  w: z.number().min(0).max(1),
  h: z.number().min(0).max(1),
});

export const zAttributionStyle = z.enum(["roepnaam", "initiaal", "geen"]);

export const zBlock = z.discriminatedUnion("kind", [
  zBlockBase.extend({
    kind: z.literal("text"),
    text: z.string().max(20_000),
  }),
  zBlockBase.extend({
    kind: z.literal("photo"),
    photoId: zUuid,
    crop: zCrop.nullable(),
    altText: z.string().max(300),
  }),
  zBlockBase.extend({
    kind: z.literal("quote"),
    text: z.string().min(1).max(400),
    // Hoogstens één leerling; meer is niet uit te drukken (INV-14, B-37).
    studentId: zUuid.nullable(),
    attributionStyle: zAttributionStyle,
  }),
  zBlockBase.extend({
    kind: z.literal("heading"),
    text: z.string().min(1).max(80),
    level: z.union([z.literal(1), z.literal(2)]),
  }),
]);

export const zPage = recordSchema({
  // Precies één documentatie (INV-09).
  documentationId: zUuid,
  order: z.number().int().min(0),
  layoutId: zLayoutId,
  // Vervolgpagina's staan op `true` (B-74).
  autoCreated: z.boolean(),
  blocks: z.array(zBlock).max(40),
});
