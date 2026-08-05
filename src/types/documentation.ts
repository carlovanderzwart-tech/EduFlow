import type { Entity } from "./entity";

/** Een losse uitspraak van een kind, die in de opmaak een eigen plek krijgt. */
export interface Quote {
  id: string;
  text: string;
}

/**
 * Een foto hoort bij één documentatie. Het eigenaarschap staat hier, de
 * volgorde staat op de documentatie (doc 03, *Datamodel*).
 */
export interface Photo extends Entity {
  documentId: string;
  blob: Blob;
  width: number;
  height: number;
}

/** Een doorlopend project waar meerdere documentaties bij horen. */
export interface Series extends Entity {
  name: string;
}

/**
 * Concept of afgerond. Wordt niet met de hand gezet: afgerond volgt uit een
 * export (besluit B-05).
 */
export type DocumentStatus = "concept" | "afgerond";

export interface Documentation extends Entity {
  /** Optioneel; wordt als voorvoegsel voor de titel gebruikt. */
  seriesId?: string;
  title: string;
  /**
   * Eén groep (besluit B-13). Verplicht bij invoer, maar optioneel in het type:
   * de migratie kan geen groep verzinnen bij een documentatie die er geen had.
   */
  groupId?: string;
  /** Optioneel nul of meer leerlingen uit die groep (besluit B-13). */
  studentIds: string[];
  /** De dag waarop het gebeurde (`YYYY-MM-DD`). */
  date: string;
  text: string;
  quotes: Quote[];
  /**
   * De volgorde van de foto's, en de enige plek waar die staat (doc 03).
   * Doc 04 maakt hem functioneel bindend: hij bepaalt de opmaak.
   */
  photoIds: string[];
  /** De gekozen opmaaktemplate. Blijft leeg tot de exportlaag bestaat. */
  templateId?: string;
  /** Gezet bij de eerste export. Bepaalt de status (B-05). */
  exportedAt?: string;
  /** Toestemming beeldgebruik, eenmalig per documentatie (B-08). */
  photoConsentConfirmedAt?: string;
}

/** Filters uit doc 04, scherm 2. Meer dan dit komt er niet. */
export interface DocumentFilter {
  search?: string;
  seriesId?: string;
  groupId?: string;
  studentId?: string;
  from?: string;
  to?: string;
}

export function getDocumentStatus(doc: Documentation): DocumentStatus {
  return doc.exportedAt ? "afgerond" : "concept";
}

/**
 * Een documentatie zonder tekst én zonder foto's wordt niet bewaard
 * (doc 02, *Documentatie*).
 */
export function isWorthSaving(doc: Pick<Documentation, "text" | "photoIds">): boolean {
  return doc.text.trim().length > 0 || doc.photoIds.length > 0;
}
