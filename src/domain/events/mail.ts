/**
 * Domeingebeurtenissen rond mail (§9.6, DE-30 t/m DE-34).
 *
 * `MailAccountRejected` bestaat omdat een geweigerde koppeling een gebeurtenis
 * met gevolgen is en geen foutmelding: hij draagt het aangetroffen recht mee,
 * gaat naar het logboek, en is het bewijs dat INV-35 werkt (B-20).
 *
 * `MailDraftHandedOff` heet overdragen en niet versturen. Er is geen
 * verzendrecht en er komt geen toestand `verstuurd` (§9.7.2, U-01).
 */

import type { IsoDateTime, MailProvider, Uuid } from "../types";

/** DE-30 — koppeling voltooid en rechten gecontroleerd (§9.7.4). */
export interface MailAccountConnected {
  type: "MailAccountConnected";
  provider: MailProvider;
  emailAddress: string;
  scopesGranted: string[];
}

/** DE-31 — geweigerd omdat er een verzendrecht bij zat (INV-35). */
export interface MailAccountRejected {
  type: "MailAccountRejected";
  provider: MailProvider;
  /** Het aangetroffen recht, bijvoorbeeld het recht dat B-20 uitsluit. */
  scope: string;
}

/** DE-32 — bij loskoppelen, handmatig of door een definitief verlopen token. */
export interface MailAccountDisconnected {
  type: "MailAccountDisconnected";
  provider: MailProvider;
  reason: string;
  deletedMessages: number;
}

/** DE-33 — als er een samenvatting van een ontvangen bericht klaar is. */
export interface MailMessageSummarised {
  type: "MailMessageSummarised";
  mailMessageId: Uuid;
  pseudonymCount: number;
  summaryChars: number;
}

/** DE-34 — bij "Als concept in je mailprogramma" of "Kopieer" (§6.3.9). */
export interface MailDraftHandedOff {
  type: "MailDraftHandedOff";
  mailDraftId: Uuid;
  route: "mailprogramma" | "klembord";
  subject: string;
  at: IsoDateTime;
}

export type MailEvent =
  | MailAccountConnected
  | MailAccountRejected
  | MailAccountDisconnected
  | MailMessageSummarised
  | MailDraftHandedOff;
