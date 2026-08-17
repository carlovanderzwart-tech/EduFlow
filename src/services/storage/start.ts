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
import { zSettings } from "@/domain/schemas";

import { maakDatabase, type EduFlowDatabase } from "./db";
import { createStorageService, type Clock, type StorageService } from "./StorageService";

const SYSTEEMKLOK: Clock = { now: () => new Date() };

/** De standaardinstellingen van een verse installatie (§8.3.14). */
function verseInstellingen(deviceId: Uuid) {
  return {
    deviceId,
    defaultGroupId: null,
    defaultStudentIds: [],
    // §6.4.4: eenentwintig schooldagen. §9.8 noemt 42 kalenderdagen in een terzijde;
    // het hoofdstuk over het blok rekent in schooldagen en is specifieker. De naam
    // van de constante staat in `documentation/aandacht.ts`; het getal staat hier,
    // want de opslaglaag hoort niets van het dashboard te weten.
    attentionThresholdDays: 21,
    // B-125: standaard aan, want de geheugensteun is nuttig tot je hem wegzet.
    showAttention: true,
    pupilNoun: "leerling" as const,
    disabledDetectors: [],
    // FR-INS-21: de schakelaar staat standaard aan.
    showOutgoingRequest: true,
  };
}

/**
 * Opent de opslag en levert een service die klaar is voor gebruik.
 *
 * Zorgt onderweg dat er precies één **leesbaar** `settings`-record is (INV-49).
 *
 * Dat woord "leesbaar" is er met bloed bij geschreven. Deze functie las de rij
 * rechtstreeks uit Dexie en keek alleen of hij *bestond*; `SettingsService.lees()`
 * gaat via `list()` en die keurt een rij af die niet meer bij het schema past. Komt
 * er dan een veld bij — zoals `showAttention` bij B-125 — dan ziet het opstarten een
 * record en de service niet één, en werpt de service. Het scherm bleef eeuwig op een
 * skelet staan zonder één woord uitleg.
 *
 * Versie 1.0 kent geen migratieketen (§8.6, DR-02): een nieuw veld betekent een
 * schone start. Maar "schoon" hoort te gebeuren zónder dat de gebruiker zelf zijn
 * opslag moet wissen, en zonder een scherm dat blijft laden.
 */
export async function startOpslag(
  db: EduFlowDatabase = maakDatabase(),
  clock: Clock = SYSTEEMKLOK,
): Promise<StorageService> {
  await db.open();

  const bestaande = await db.settings.toArray();
  const eerste = bestaande.find((record) => record.deletedAt === null);
  const leesbaar = eerste ? zSettings.safeParse(eerste).success : false;

  if (eerste && leesbaar) {
    return createStorageService({ db, clock, origin: eerste.deviceId });
  }

  // Een rij die niet meer te lezen is, gaat eruit. Het apparaat-id blijft: dat is
  // geen instelling maar de identiteit van dit apparaat (§8.1.4).
  const deviceId = eerste?.deviceId ?? newId();
  if (eerste) await db.settings.delete(eerste.id);

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
