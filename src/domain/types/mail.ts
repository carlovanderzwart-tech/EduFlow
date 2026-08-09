/**
 * Postbus, gecachet bericht, concept en sjabloon (§8.3.9, §6.3.8).
 *
 * `MailAccount` bevat **geen tokens** (T-15, FR-MAI-06): die staan versleuteld in
 * een `httpOnly`-cookie en nergens in de browseropslag.
 *
 * Er is geen verzendrecht en er komt er geen (INV-35, B-20, U-01). Er bestaat
 * daarom ook geen toestand `verstuurd` op een concept (§9.7.2).
 *
 * `MailDraft` is zijn eigen aggregaat en overleeft het loskoppelen van het
 * account waaruit het voortkwam (INV-37, §9.4.4). Wat jij schrijft is van jou;
 * de postbus is dat niet.
 */

import type { BaseRecord, IsoDateTime, Uuid } from "./base";

/** Microsoft 365 via Graph, of Google Workspace via de Gmail API (§6.3.2, §13.2). */
export type MailProvider = "microsoft" | "google";

export interface MailAccount extends BaseRecord {
  provider: MailProvider;
  emailAddress: string;
  displayName: string;
  connectedAt: IsoDateTime;
  /** Voor het controlescherm uit FR-MAI-03. Bevat nooit een verzendrecht (INV-35). */
  scopesGranted: string[];
  lastSyncAt: IsoDateTime | null;
}

/**
 * Een gecachet bericht. Nooit ouder dan zeven dagen (INV-36).
 *
 * Alleen berichten die je opent worden weggeschreven; koppen blijven in het
 * geheugen (FR-MAI-09). Bijlagen worden nooit opgehaald, alleen hun namen
 * (FR-MAI-11).
 */
export interface MailMessage extends BaseRecord {
  externalId: string;
  subject: string;
  fromName: string;
  fromAddress: string;
  receivedAt: IsoDateTime;
  bodyText: string;
  hasAttachments: boolean;
  attachmentNames: string[];
  cachedAt: IsoDateTime;
  expiresAt: IsoDateTime;
}

export type RecipientKind = "ouder" | "collega" | "directie" | "extern";
export type MailTone = "zakelijk" | "warm" | "kort" | "uitgebreid";
export type MailDraftStatus = "concept" | "overgedragen";

export interface MailDraft extends BaseRecord {
  /** Minstens één zichtbaar teken; zonder onderwerp geen concept (INV-34, B-36). */
  subject: string;
  body: string;
  recipientKind: RecipientKind;
  tone: MailTone;
  studentIds: Uuid[];
  groupIds: Uuid[];
  /** Het bericht waarop dit een antwoord is. */
  sourceMessageId: Uuid | null;
  templateId: Uuid | null;
  status: MailDraftStatus;
}

export interface MailTemplate extends BaseRecord {
  name: string;
  recipientKind: RecipientKind;
  instructions: string;
  skeleton: string;
  isBuiltIn: boolean;
  /** Maakt "Herstel origineel" mogelijk (§8.3.9). */
  originalHash: string;
}
