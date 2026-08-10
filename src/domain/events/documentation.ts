/**
 * Domeingebeurtenissen rond documenteren (§9.6, DE-01 t/m DE-07 en DE-21 t/m DE-23).
 *
 * Een service doet zijn eigen werk en meldt wat er gebeurd is; wie daarop wil
 * reageren, meldt zich aan. Zonder die omkering zou `DocumentationService` bij
 * elke export de zoekindex, het stijlprofiel, het logboek en de changeLog moeten
 * kennen, en wist de kernservice van het product ineens van alle
 * randvoorzieningen af (§9.6).
 *
 * De gebeurtenissen worden **niet** opgeslagen (T-37): ze worden synchroon
 * afgehandeld, direct na de transactie waarin het aggregaat is opgeslagen.
 */

import type { IsoDate, IsoDateTime, LayoutId, Uuid } from "../types";

/** DE-01 — bij de eerste inhoud in een leeg schrijfscherm (INV-07). */
export interface DocumentationCreated {
  type: "DocumentationCreated";
  documentationId: Uuid;
  date: IsoDate;
  source: "schrijfmodus" | "gespreksmodus";
}

/** DE-02 — na elke opgeslagen wijziging van tekst, titel, citaat of koppeling. */
export interface DocumentationContentChanged {
  type: "DocumentationContentChanged";
  documentationId: Uuid;
  changedFields: string[];
  rev: number;
}

/** DE-03 — als de datum wijzigt. */
export interface DocumentationDateChanged {
  type: "DocumentationDateChanged";
  documentationId: Uuid;
  previousDate: IsoDate;
  date: IsoDate;
}

/** DE-04 — bij het handmatig toevoegen van een pagina of bij overloop. */
export interface PageAdded {
  type: "PageAdded";
  documentationId: Uuid;
  pageId: Uuid;
  order: number;
  layoutId: LayoutId;
  reason: "handmatig" | "overloop";
}

/** DE-05 — bij het verwijderen van een pagina. */
export interface PageRemoved {
  type: "PageRemoved";
  documentationId: Uuid;
  pageId: Uuid;
  movedBlocks: number;
}

/** DE-06 — als de blokken van een pagina niet in de sloten van de layout passen. */
export interface PageOverflowed {
  type: "PageOverflowed";
  pageId: Uuid;
  layoutId: LayoutId;
  overflowingBlocks: number;
}

/** DE-07 — bij het kiezen van een andere layout voor een pagina. */
export interface PageLayoutChanged {
  type: "PageLayoutChanged";
  pageId: Uuid;
  previousLayoutId: LayoutId;
  layoutId: LayoutId;
}

/** Print-PDF of deelbare afbeelding (§6.1.12, DE-21). */
export type ExportKind = "pdf" | "afbeelding";

/** DE-21 — bij **elke** geslaagde export. */
export interface DocumentationExported {
  type: "DocumentationExported";
  documentationId: Uuid;
  kind: ExportKind;
  pageCount: number;
  initialsUsed: boolean;
}

/**
 * DE-22 — bij de **eerste** geslaagde export: de overgang naar `gedeeld`.
 *
 * Dat DE-21 bij elke export vuurt en DE-22 alleen bij de eerste, is precies het
 * verschil tussen "er is geëxporteerd" en "deze documentatie is gedeeld"
 * (B-13, INV-15, §9.7.1).
 */
export interface DocumentationShared {
  type: "DocumentationShared";
  documentationId: Uuid;
  kind: ExportKind;
  at: IsoDateTime;
}

/** DE-23 — bij de eerste deelbare afbeelding van een documentatie (B-08). */
export interface ImageConsentConfirmed {
  type: "ImageConsentConfirmed";
  documentationId: Uuid;
  at: IsoDateTime;
  photoCount: number;
}

export type DocumentationEvent =
  | DocumentationCreated
  | DocumentationContentChanged
  | DocumentationDateChanged
  | PageAdded
  | PageRemoved
  | PageOverflowed
  | PageLayoutChanged
  | DocumentationExported
  | DocumentationShared
  | ImageConsentConfirmed;
