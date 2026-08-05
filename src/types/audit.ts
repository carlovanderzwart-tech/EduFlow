/**
 * Logboek van handelingen die veel records tegelijk raken (besluit B-26).
 *
 * Alleen toevoegen, dus geen `updatedAt`. **Geen persoonsgegevens:** wel
 * aantallen en een identificatie, geen namen, geen inhoud, en geen waarden van
 * vóór en na. Die identificatie is er omdat B-27 erop leunt — zonder te weten
 * welk record is verwijderd valt er later niets te reconstrueren.
 */
export type AuditAction =
  | "students-imported"
  | "students-exported"
  | "group-archived"
  | "group-unarchived"
  | "students-batch-updated"
  | "documentation-deleted";

export interface AuditEntry {
  id: string;
  /** ISO-tijdstempel. */
  at: string;
  action: AuditAction;
  /** Identificatie van het geraakte record, wanneer het er één is. */
  entityId?: string;
  /** Aantallen, bijvoorbeeld `{ nieuw: 23, bijgewerkt: 4 }`. */
  counts?: Record<string, number>;
}
