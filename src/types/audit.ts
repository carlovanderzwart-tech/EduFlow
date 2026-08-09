/**
 * Logboek van handelingen die veel records tegelijk raken (§16.2).
 *
 * Alleen toevoegen, dus geen `updatedAt`. **Geen persoonsgegevens:** wel
 * aantallen en een identificatie, geen namen, geen inhoud, en geen waarden van
 * vóór en na (DR-44). Die identificatie is er zodat later te reconstrueren valt
 * welk record een handeling raakte.
 *
 * De oorspronkelijke onderbouwing luidde dat dit logboek nodig was *in plaats van*
 * grafstenen. Die redenering vervalt: de Bible eist grafstenen wel degelijk —
 * verwijderen is `deletedAt` zetten en nergens een `delete` (T-11, DR-26, INV-02).
 * Het logboek staat daar los van en volgt §16.2.
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
