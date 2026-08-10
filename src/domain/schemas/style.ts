/**
 * Schema's van `styleProfile` en `styleExamples` (§8.3.11).
 *
 * Elk gemeten kenmerk draagt zijn eigen `manual`-vlag. Dat is FR-INS-14: zodra
 * je een kenmerk overschrijft, stopt de app met meten op dát kenmerk en niet op
 * de andere. Eén vlag voor het hele profiel zou die keuze onmogelijk maken.
 *
 * INV-45 — het profiel bevat geen namen, geen citaten en geen letterlijke zinnen
 * — hoort volgens §9.5.6 bij `StyleService` bij het bijwerken. Een schema kan
 * niet zien of "Roos" een bloem of een kind is; de leerlingenlijst wel, en die
 * kent alleen de service.
 */

import { z } from "zod";

import { recordSchema, zIsoDateTime, zUuid } from "./base";

/** Een gemeten kenmerk met de vlag of de gebruiker het heeft overschreven. */
function kenmerk<Waarde extends z.ZodTypeAny>(waarde: Waarde) {
  return z.strictObject({ value: waarde, manual: z.boolean() });
}

export const zTense = z.enum(["tegenwoordig", "verleden"]);
export const zAddress = z.enum(["wij", "ik", "onpersoonlijk"]);

export const zCorrectionRule = z.strictObject({
  id: zUuid,
  pattern: z.string().min(1),
  reason: z.string(),
  confirmedAt: zIsoDateTime,
});

export const zStyleProfile = recordSchema({
  avgSentenceWords: kenmerk(z.number().nonnegative()),
  avgParagraphSentences: kenmerk(z.number().nonnegative()),
  tense: kenmerk(zTense),
  address: kenmerk(zAddress),
  quoteFrequency: kenmerk(z.number().nonnegative()),
  // 0-1, beschrijven tegenover duiden (§3.3.2).
  descriptionRatio: kenmerk(z.number().min(0).max(1)),
  preferredWords: z.array(z.string()),
  avoidedWords: z.array(z.string()),
  correctionRules: z.array(zCorrectionRule),
  sampleCount: z.number().int().nonnegative(),
  lastComputedAt: zIsoDateTime,
});

export const zStyleExample = recordSchema({
  rawNote: z.string(),
  goodResult: z.string(),
  overshotResult: z.string(),
  overshotReason: z.string(),
  isGolden: z.boolean(),
});
