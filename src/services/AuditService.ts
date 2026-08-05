import { auditRepository } from "./repositories/auditRepository";
import type { AuditAction, AuditEntry } from "@/types/audit";
import { createId } from "@/utils/id";

/**
 * Legt handelingen vast die veel records tegelijk raken (besluit B-26).
 *
 * **Nooit persoonsgegevens.** Wel aantallen en de identificatie van het geraakte
 * record; geen namen, geen inhoud, geen waarden van vóór en na. Die
 * identificatie is er omdat B-27 erop leunt: zonder te weten welk record is
 * verwijderd valt er later geen grafsteen uit te reconstrueren.
 *
 * Schrijft alleen; er is bewust geen scherm.
 */
export const AuditService = {
  async record(
    action: AuditAction,
    details: { entityId?: string; counts?: Record<string, number> } = {},
  ): Promise<void> {
    const entry: AuditEntry = {
      id: createId(),
      at: new Date().toISOString(),
      action,
      entityId: details.entityId,
      counts: details.counts,
    };

    try {
      await auditRepository.add(entry);
    } catch (error) {
      // Een mislukt logboek mag de handeling zelf niet tegenhouden. Het is een
      // verslag, geen voorwaarde.
      console.error("[EduFlow] logboekregel niet opgeslagen", error);
    }
  },

  getRecent(limit?: number): Promise<AuditEntry[]> {
    return auditRepository.getRecent(limit);
  },
};
