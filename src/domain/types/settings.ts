/**
 * De instellingen die persoonsgegevens raken of afleiden (§8.3.14).
 *
 * Precies één record, altijd aanwezig (INV-49). Er is **geen** `User`-record in
 * versie 1.0: §9.4 noemt naam, rol, school en standaardtoon, maar alle vier
 * hebben elders al een plek — de standaardtoon in `localStorage`, de rol is één
 * vaste waarde die §14.2 beschrijft maar niet bouwt, de schoolnaam is een
 * `PrivacyTerm`, en voor de gebruikersnaam is er geen gebruik.
 *
 * Wat hier **niet** staat, staat in `localStorage` (§8.2.2): de regio, de
 * standaardtoon, de providerkeuze, de laatste weergave, de back-updatum en de
 * eenmalige bevestigingen. Die zes staan daar alleen, en dat is U-02 in de
 * praktijk: één gegeven, één plek.
 */

import type { BaseRecord, Uuid } from "./base";

/**
 * De vijf detectoren die je mag uitzetten (§6.3.10, FR-MAI-24).
 *
 * BSN, IBAN, e-mailadres en telefoonnummer staan er met opzet niet bij: die zijn
 * "vast aan en grijs". Dat ze hier ontbreken is de handhaving — het type laat niet
 * toe dat ze ooit in `disabledDetectors` belanden.
 */
export type DisableableDetector =
  | "adres"
  | "aanhef"
  | "ondertekening"
  | "handtekeningblok"
  | "achternaam";

/** "leerling" of "kind", in alle schermteksten tegelijk (FR-INS-27). */
export type PupilNoun = "leerling" | "kind";

export interface Settings extends BaseRecord {
  /**
   * Het apparaat-id dat elk record als `origin` draagt (§8.1.4).
   *
   * Een UUIDv7 die bij de eerste start ontstaat. Hij is niet herleidbaar tot een
   * persoon en gaat niet naar een provider.
   */
  deviceId: Uuid;
  /** De groep die een nieuw schrijfscherm voorinvult (§8.3.5). */
  defaultGroupId: Uuid | null;
  defaultStudentIds: Uuid[];
  /** Boven hoeveel dagen een leerling in het blok Aandacht komt (§9.8: 42). */
  attentionThresholdDays: number;
  pupilNoun: PupilNoun;
  disabledDetectors: DisableableDetector[];
  /** "Toon altijd wat er verstuurd wordt". Standaard aan (FR-INS-21). */
  showOutgoingRequest: boolean;
}
