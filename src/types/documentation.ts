import type { Entity } from "./entity";

/** Een losse uitspraak van een kind, die in de opmaak een eigen plek krijgt. */
export interface Quote {
  id: string;
  text: string;
}

/**
 * Een foto hoort bij één documentatie. Het eigenaarschap staat hier, de
 * volgorde staat op de documentatie (docs/archief/03, *Datamodel*).
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
 * Wordt niet met de hand gezet: de status volgt uit een geslaagde export
 * (besluit B-13, T-41).
 *
 * De Bible kent de waarden `concept` en `gedeeld`, en `gedeeld` is onomkeerbaar
 * (B-94). Hier staat nog `afgerond`; dat wordt rechtgezet bij implementatiestap 11,
 * samen met het opgeslagen `status`-veld en `firstExportedAt`.
 */
export type DocumentStatus = "concept" | "afgerond";

export interface Documentation extends Entity {
  /** Optioneel; wordt als voorvoegsel voor de titel gebruikt. */
  seriesId?: string;
  title: string;
  /**
   * Eén groep. Verplicht bij invoer, maar optioneel in het type: de migratie kan
   * geen groep verzinnen bij een documentatie die er geen had.
   *
   * De Bible schrijft `groupIds: Uuid[]` voor — een documentatie hangt aan meerdere
   * groepen en expliciet gaat boven afgeleid (B-17, U-07). Wordt omgezet bij
   * implementatiestap 11.
   */
  groupId?: string;
  /** Optioneel nul of meer leerlingen uit die groep (B-17). */
  studentIds: string[];
  /** De dag waarop het gebeurde (`YYYY-MM-DD`). */
  date: string;
  text: string;
  quotes: Quote[];
  /**
   * De volgorde van de foto's, en de enige plek waar die staat (docs/archief/03).
   * docs/archief/04 maakt hem functioneel bindend: hij bepaalt de opmaak.
   */
  photoIds: string[];
  /** De gekozen opmaaktemplate. Blijft leeg tot de exportlaag bestaat. */
  templateId?: string;
  /** Gezet bij de eerste export. Bepaalt de status (B-13). Heet `firstExportedAt` in de Bible. */
  exportedAt?: string;
  /** Toestemming beeldgebruik, eenmalig per documentatie (B-08). */
  photoConsentConfirmedAt?: string;
}

/** Filters uit docs/archief/04, scherm 2. Meer dan dit komt er niet. */
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
 * (docs/archief/02, *Documentatie*).
 */
export function isWorthSaving(doc: Pick<Documentation, "text" | "photoIds">): boolean {
  return doc.text.trim().length > 0 || doc.photoIds.length > 0;
}
