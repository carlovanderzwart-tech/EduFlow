/**
 * Schema's van `aiInteractions` en `feedback` (§8.3.12).
 *
 * Wat opvalt aan dit schema is wat er níét in staat: geen prompt, geen antwoord,
 * geen zin uit een documentatie. Dat is FR-PRV-08 en het is de reden dat dit
 * logboek bij een privacygesprek op tafel kan (§16.4). Wat er wel staat, zijn
 * tellingen, en `similarity` is daar het bewijs van: de overeenkomst tussen
 * voorstel en eindtekst wordt uitgerekend en bewaard, de teksten zelf niet.
 *
 * Dat `comment` op een `Feedback` geen namen mag bevatten, staat er ook niet in.
 * Die controle heeft de leerlingenlijst nodig en hoort daarmee in de servicelaag.
 */

import { z } from "zod";

import { recordSchema, zUuid } from "./base";

export const zAiTask = z.enum([
  "doc.write",
  "doc.title",
  "doc.followup",
  "doc.spelling",
  "talk.build",
  "mail.summarise",
  "mail.write",
  "mail.tone",
]);

export const zAiOutcome = z.enum(["accepted", "partial", "rejected", "retried", "failed"]);

/** De vier redenen uit B-73. */
export const zAiRejectReason = z.enum(["te_lang", "te_bloemrijk", "klopt_niet", "anders"]);

export const zAiInteraction = recordSchema({
  task: zAiTask,
  provider: z.string().min(1),
  model: z.string().min(1),
  region: z.string().min(1),
  charsIn: z.number().int().nonnegative(),
  charsOut: z.number().int().nonnegative(),
  pseudonymCount: z.number().int().nonnegative(),
  durationMs: z.number().int().nonnegative(),
  outcome: zAiOutcome,
  rejectReason: zAiRejectReason.nullable(),
  similarity: z.number().min(0).max(1),
  documentationId: zUuid.nullable(),
});

export const zFeedbackVerdict = z.enum(["goed", "matig", "fout"]);

export const zFeedback = recordSchema({
  aiInteractionId: zUuid,
  verdict: zFeedbackVerdict,
  comment: z.string().max(500),
});
