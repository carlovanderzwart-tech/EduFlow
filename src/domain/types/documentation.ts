/**
 * De documentatie (§8.3.5, §6.1.1).
 *
 * Eén afgeronde beschrijving van één moment of één activiteit. Dit is de wortel
 * van het grootste aggregaat: `Page`, `Block` en alle varianten vallen binnen de
 * grens (§9.4.1). Naar buiten wordt uitsluitend met sleutels verwezen — nooit met
 * een object (§9.4, regel B).
 *
 * **`status` is een opgeslagen veld, geen functie** (T-41, INV-15, §8.3.5,
 * §6.1.1). Alleen `DocumentationService` schrijft eraan en hij leidt de waarde af
 * uit `firstExportedAt`. §9.8 noemt de status nog "geen veld, een functie"; dat is
 * een restant van vóór T-41 en niet de geldende bepaling.
 *
 * **Twee velden uit §6.1.1 ontbreken hier.** `conversationAnswers` en
 * `aiUndoSnapshot` staan in de veldtabel van §6.1.1 met de typen
 * `ConversationAnswer[]` en `AiUndoSnapshot | null`, maar die twee typen worden
 * nergens in het handboek uitgeschreven. Ze zijn niet af te leiden zonder
 * veldnamen te verzinnen, en dat verbiedt DR-01. Zie de openstaande punten bij
 * implementatiestap 3.
 */

import type { BaseRecord, IsoDate, IsoDateTime, Uuid } from "./base";

/** Concept of gedeeld. Meer statussen zijn er niet (B-13). */
export type DocumentationStatus = "concept" | "gedeeld";

export interface Documentation extends BaseRecord {
  title: string;
  /** De inhoudelijke datum, niet het moment van schrijven. */
  date: IsoDate;
  /** Hoogstens één reeks (INV-19). */
  seriesId: Uuid | null;
  studentIds: Uuid[];
  /** De expliciete koppeling. De afgeleide groepsverzameling wordt nooit opgeslagen (U-02, B-17). */
  groupIds: Uuid[];
  /** De volgorde is betekenisdragend; `Page.documentationId` draagt het eigendom (§8.4). */
  pageIds: Uuid[];
  /** Nooit in een export, nooit naar AI (§8.3.5). */
  privateNote: string;
  status: DocumentationStatus;
  /** Gezet bij de eerste geslaagde export (B-13). Draagt `status` (INV-15). */
  firstExportedAt: IsoDateTime | null;
  /** Archiveren is een merker, geen status: de status blijft staan (§6.1.1). */
  archivedAt: IsoDateTime | null;
  /** Toestemming beeldgebruik, één keer per documentatie (B-08). */
  imageConsentAt: IsoDateTime | null;
}
