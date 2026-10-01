/**
 * Een documentatie weggooien, terugzetten en definitief wissen (B-135, B-138).
 *
 * `FR-DOC-121` t/m `FR-DOC-123` stonden sinds het handboek in §6.1.13 en waren niet
 * gebouwd: er was geen enkele manier om een documentatie kwijt te raken. Dat bleek
 * bij de tweede eigen test.
 *
 * Sinds B-138 staat het werk zelf in `services/prullenbak.ts`, want een groep en een
 * reeks doen precies hetzelfde. Wat hier blijft staan is wat alleen voor een
 * documentatie geldt: **haar pagina's gaan mee**, en een documentatie die niet
 * bestaat levert een nette melding op in plaats van een lege handeling.
 */

import { ongeldig, type Result } from "@/lib/result";
import type { Uuid } from "@/lib/uuid";
import type { Documentation } from "@/domain/types";

import { maakPrullenbak } from "../prullenbak";
import type { Clock, StorageService } from "../storage/StorageService";

/**
 * Pagina's horen bij precies één documentatie (§8.4).
 *
 * `Documentation.pageIds` draagt de volgorde en `Page.documentationId` het eigendom;
 * het eigendom is wat hier telt.
 */
const KINDEREN = [{ tabel: "pages" as const, veld: "documentationId" }];

export function maakDocumentatieprullenbak(storage: StorageService, clock: Clock) {
  const bak = maakPrullenbak(storage, clock, "documentations", KINDEREN);

  /**
   * Naar de prullenbak (`FR-DOC-121`).
   *
   * De bestaanscontrole staat hier en niet in `maakPrullenbak`: bij een documentatie
   * is "die bestaat niet meer" een zin waar de gebruiker iets aan heeft, bij het
   * opruimen van een verlopen record is dat precies de normale toestand.
   */
  async function verwijder(id: Uuid): Promise<Result<Documentation>> {
    const huidig = await storage.read("documentations", id);
    if (!huidig.ok) return huidig;
    if (!huidig.value) return ongeldig("Deze documentatie bestaat niet meer.");

    return bak.verwijder(id);
  }

  /**
   * Terug uit de prullenbak, met pagina's, foto's en koppelingen (`FR-DOC-121`).
   *
   * De foto's en koppelingen komen vanzelf mee: foto's hangen als blok in een
   * pagina en de koppelingen staan als velden op de documentatie zelf. Er is dus
   * niets aparts te herstellen — dat is precies de winst van markeren boven wissen.
   */
  return {
    verwijder,
    herstel: bak.herstel,
    prullenbak: bak.inhoud,
    leegPrullenbak: bak.leeg,
    ruimOp: bak.ruimOp,
  };
}
