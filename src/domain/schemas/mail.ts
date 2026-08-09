/**
 * Schema's van `mailAccounts`, `mailMessages`, `mailDrafts` en `mailTemplates`
 * (§8.3.9, §6.3.8).
 *
 * `subject` op een concept draagt INV-34: minstens één **zichtbaar** teken. Een
 * onderwerp van drie spaties is geen onderwerp, en zonder onderwerp is er niets
 * te tonen in twee lijsten en op het dashboard (B-36).
 *
 * INV-35 — de rechten van een `MailAccount` bevatten nooit een verzendrecht —
 * staat hier niet. §9.5.5 legt die controle bij `MailService`, bij het afronden
 * van de koppeling, want daar wordt het token weggegooid en de koppeling
 * geweigerd. Een schema kan een record afkeuren maar geen token intrekken.
 *
 * INV-36 — een gecachet bericht is niet ouder dan zeven dagen — vraagt om de
 * huidige tijd en hoort daarom bij `MailService` en de opruimronde.
 */

import { z } from "zod";

import { recordSchema, zIsoDateTime, zUuid } from "./base";

export const zMailProvider = z.enum(["microsoft", "google"]);

export const zMailAccount = recordSchema({
  provider: zMailProvider,
  emailAddress: z.string().min(1),
  displayName: z.string(),
  connectedAt: zIsoDateTime,
  scopesGranted: z.array(z.string()),
  lastSyncAt: zIsoDateTime.nullable(),
});

export const zMailMessage = recordSchema({
  externalId: z.string().min(1),
  subject: z.string(),
  fromName: z.string(),
  fromAddress: z.string(),
  receivedAt: zIsoDateTime,
  bodyText: z.string(),
  hasAttachments: z.boolean(),
  // Alleen de namen; de inhoud wordt nooit opgehaald (FR-MAI-11).
  attachmentNames: z.array(z.string()),
  cachedAt: zIsoDateTime,
  expiresAt: zIsoDateTime,
});

export const zRecipientKind = z.enum(["ouder", "collega", "directie", "extern"]);
export const zMailTone = z.enum(["zakelijk", "warm", "kort", "uitgebreid"]);
export const zMailDraftStatus = z.enum(["concept", "overgedragen"]);

export const zMailDraft = recordSchema({
  subject: z
    .string()
    .min(1)
    .max(150)
    .regex(/\S/u, "Een onderwerp heeft minstens één zichtbaar teken"),
  body: z.string().max(20_000),
  recipientKind: zRecipientKind,
  tone: zMailTone,
  studentIds: z.array(zUuid),
  groupIds: z.array(zUuid),
  sourceMessageId: zUuid.nullable(),
  templateId: zUuid.nullable(),
  status: zMailDraftStatus,
});

export const zMailTemplate = recordSchema({
  name: z.string().min(1),
  recipientKind: zRecipientKind,
  instructions: z.string(),
  skeleton: z.string(),
  isBuiltIn: z.boolean(),
  originalHash: z.string(),
});
