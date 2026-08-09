/**
 * Schema's van `photos` en `photoVariants` (§8.3.7).
 *
 * §8.3.7 geeft per veld alleen "geheel getal" en geen bereik. De ondergrenzen
 * hieronder volgen uit de omschrijving van de velden zelf: `bytes` is een som
 * van omvangen, `refCount` is een aantal, en `width` en `height` zijn de
 * afmetingen van de drukvariant. Een negatieve som en een foto van nul pixels
 * bestaan niet.
 *
 * INV-18 — van elke beschikbare foto bestaan precies drie varianten — gaat over
 * drie records samen en hoort volgens §9.5.2 bij `PhotoService`.
 */

import { z } from "zod";

import { recordSchema, zIsoDateTime, zUuid } from "./base";

export const zPhoto = recordSchema({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  bytes: z.number().int().nonnegative(),
  // SHA-256 in kleine letters: 64 hextekens (§8.3.7, FR-INS-31).
  hash: z.string().regex(/^[0-9a-f]{64}$/, "Verwacht een SHA-256 in kleine letters"),
  capturedAt: zIsoDateTime.nullable(),
  orientation: z.number().int(),
  refCount: z.number().int().nonnegative(),
});

/** 480, 1280 en 3300 pixels op de lange zijde (§8.3.7). */
export const zPhotoVariantName = z.enum(["thumb", "screen", "print"]);

export const zPhotoVariant = recordSchema({
  photoId: zUuid,
  variant: zPhotoVariantName,
  blob: z.instanceof(Blob),
  bytes: z.number().int().nonnegative(),
});
