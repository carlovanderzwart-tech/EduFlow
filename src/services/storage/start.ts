/**
 * Waar de opslaglaag in de browser wordt opgebouwd.
 *
 * `createStorageService` neemt zijn afhankelijkheden aan bij het maken (§10.3), en
 * dit is de enige plek die ze levert: de echte database, de echte klok, en het
 * apparaat-id. Een toets bouwt zijn eigen exemplaar met een eigen database en een
 * stilstaande klok, en raakt dit bestand niet aan.
 *
 * **Het apparaat-id is een kip-en-eiprobleem** en dat wordt hier opgelost. Elk
 * record draagt het als `origin` (§8.1.4), ook het `settings`-record waar het zelf
 * in staat. Bij de eerste start ontstaat er dus eerst een sleutel, en die sleutel
 * is meteen de `origin` van het record dat hem bewaart. Bij elke volgende start
 * wordt hij teruggelezen.
 */

import { newId, type Uuid } from "@/lib/uuid";

import { maakDatabase, type EduFlowDatabase } from "./db";
import { createStorageService, type Clock, type StorageService } from "./StorageService";

const SYSTEEMKLOK: Clock = { now: () => new Date() };

/** De standaardinstellingen van een verse installatie (§8.3.14). */
function verseInstellingen(deviceId: Uuid) {
  return {
    deviceId,
    defaultGroupId: null,
    defaultStudentIds: [],
    // §9.8: zes weken, de periode tussen twee vakanties.
    attentionThresholdDays: 42,
    pupilNoun: "leerling" as const,
    disabledDetectors: [],
    // FR-INS-21: de schakelaar staat standaard aan.
    showOutgoingRequest: true,
  };
}

/**
 * Opent de opslag en levert een service die klaar is voor gebruik.
 *
 * Zorgt onderweg dat er precies één `settings`-record is (INV-49): ontbreekt hij,
 * dan wordt hij met standaardwaarden aangemaakt.
 */
export async function startOpslag(
  db: EduFlowDatabase = maakDatabase(),
  clock: Clock = SYSTEEMKLOK,
): Promise<StorageService> {
  await db.open();

  const bestaande = await db.settings.toArray();
  const eerste = bestaande.find((record) => record.deletedAt === null);

  if (eerste) {
    return createStorageService({ db, clock, origin: eerste.deviceId });
  }

  const deviceId = newId();
  const opslag = createStorageService({ db, clock, origin: deviceId });
  const uitkomst = await opslag.create("settings", verseInstellingen(deviceId));
  if (!uitkomst.ok) throw new Error(`Instellingen aanmaken faalde: ${uitkomst.error.message}`);

  return opslag;
}

/**
 * Eén exemplaar per tabblad, gedeeld door de schermen.
 *
 * Bewust een belofte en geen waarde: de opslag opent asynchroon, en een scherm dat
 * er te vroeg bij is hoort te wachten in plaats van een half geopende database te
 * krijgen.
 */
let lopend: Promise<StorageService> | null = null;

export function opslag(): Promise<StorageService> {
  lopend ??= startOpslag();
  return lopend;
}
