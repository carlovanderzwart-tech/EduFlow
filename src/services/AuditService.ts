import { auditRepository } from "./repositories/auditRepository";
import type { AuditAction, AuditEntry } from "@/types/audit";
import { createId } from "@/utils/id";

/**
 * Legt handelingen vast die veel records tegelijk raken (§16.2).
 *
 * **Nooit persoonsgegevens.** Wel aantallen en de identificatie van het geraakte
 * record; geen namen, geen inhoud, geen waarden van vóór en na (DR-44).
 *
 * Schrijft alleen; er is hier nog geen scherm. De Bible vraagt dat wel:
 * Instellingen → Over → Logboek, doorzoekbaar en te exporteren als CSV, en niet
 * te wissen (§16.2). Dat volgt bij implementatiestap 6.
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
