/**
 * Wat er over de lijn gaat naar `/api/ai` (§12.3, §12.6, DR-24).
 *
 * Dit is de enige vorm die de server accepteert, en hij is `strict`: een onbekend
 * veld wordt **geweigerd, niet genegeerd**. Dat is geen strengheid om de
 * strengheid — het is de plek waar DR-32 hard wordt. Een veld `image`, een
 * `photoId` of een `attachment` die er ooit "even bij" komt, komt niet door dit
 * schema en dus niet langs deze grens.
 *
 * De opdracht staat hier als **vijf benoemde blokken** en niet als één samengevoegde
 * tekenreeks. §12.3 eist die volgorde en B-11 eist dat het controlescherm ze één
 * op één kan tonen. Waren ze hier al platgeslagen, dan zou D06 ze weer uit elkaar
 * moeten pluizen en zou er een tweede plek ontstaan waar de opdracht vorm krijgt —
 * precies wat INV-43 verbiedt.
 */

import { z } from "zod";

import { zAiTask } from "./ai";

/**
 * Wat de app vraagt: een taak plus een niveau (§12.7).
 *
 * Niet een model. De adapter kiest het model, zodat er in de app niets verandert
 * als een aanbieder er een uitfaseert.
 */
export const zAiLevel = z.enum(["snel", "zorgvuldig"]);

/** De drie uit §12.7. Alleen `openai-eu` heeft in de doorloop een adapter (T-06). */
export const zAiProvider = z.enum(["openai-eu", "vertex-eu", "bedrock-eu"]);

/** Eén stijlvoorbeeld: de ruwe notitie en de gewenste uitkomst (§12.3 blok 3, FR-INS-16). */
export const zVoorbeeld = z.strictObject({
  invoer: z.string().min(1).max(4_000),
  uitkomst: z.string().min(1).max(4_000),
});

/**
 * De vijf blokken van §12.3, in de volgorde waarin ze verstuurd worden.
 *
 * `schrijfstijl` en `context` mogen leeg zijn — bij een verse installatie is er nog
 * geen stijlprofiel, en niet elke taak heeft reekscontext. Leeg is iets anders dan
 * afwezig: het blok bestaat, en het controlescherm toont hem als leeg in plaats van
 * hem weg te laten (B-78).
 */
export const zOpdracht = z.strictObject({
  systeeminstructie: z.string().min(1).max(8_000),
  schrijfstijl: z.string().max(4_000),
  voorbeelden: z.array(zVoorbeeld).max(5),
  context: z.string().max(8_000),
  invoer: z.string().min(1).max(20_000),
});

export const zAiRequest = z.strictObject({
  task: zAiTask,
  level: zAiLevel,
  provider: zAiProvider,
  opdracht: zOpdracht,
});

export type AiLevel = z.infer<typeof zAiLevel>;
export type AiProviderId = z.infer<typeof zAiProvider>;
export type Voorbeeld = z.infer<typeof zVoorbeeld>;
export type Opdracht = z.infer<typeof zOpdracht>;
export type AiRequest = z.infer<typeof zAiRequest>;

/**
 * De grovere beeldcontrole van T-29 en §12.6, bovenop het strikte schema.
 *
 * "Dat is grover dan nodig en dat is de bedoeling: dit is een grens die eerder te
 * vroeg dan te laat moet dichtklappen." Het schema weigert al een veld dat
 * `image` heet; deze controle kijkt naar de **inhoud**, want een base64-blok past
 * net zo goed in een gewoon tekstveld.
 *
 * Hij staat in `domain/` en niet in de route, omdat zowel `AIService` vóór het
 * versturen als de route bij het ontvangen dezelfde grens moet trekken (§12.13
 * noemt drie plekken) en twee implementaties uiteen zouden lopen (U-03).
 */
const DATA_URI = /data:[a-z]+\/[a-z0-9.+-]+;base64,/iu;
const BEELD_MIME = /\b(?:image|img)\/(?:png|jpe?g|gif|webp|heic|heif|bmp|tiff|svg\+xml)\b/iu;
/** §12.6: een base64-blok langer dan 512 tekens. */
const BASE64_BLOK = /[A-Za-z0-9+/]{512,}={0,2}/u;

export function bevatBeeldgegeven(waarde: unknown): boolean {
  const tekst = JSON.stringify(waarde) ?? "";
  return DATA_URI.test(tekst) || BEELD_MIME.test(tekst) || BASE64_BLOK.test(tekst);
}
