/**
 * De leerling (§8.3.1).
 *
 * Het gevoeligste bestand van de app en tegelijk de motor van de afscherming.
 *
 * **Er staat hier geen `groupId`, en dat is de kern van dit bestand** (INV-23,
 * U-07, B-16). Een leerling heeft nul of meer lidmaatschappen; die staan in
 * `GroupMembership` en horen bij het `Group`-aggregaat (§9.4.3). Eén veld
 * `groupId` maakt tien functies onmogelijk. Het type laat het niet toe en het
 * schema weigert het.
 */

import type { BaseRecord } from "./base";

export interface Student extends BaseRecord {
  firstName: string;
  /** Kleine letters, diakrieten behouden. Index voor de afschermlijst (§8.5). */
  firstNameLower: string;
  lastNameInitial: string;
  /** Dag en maand staan los van het jaar zodat een datum zonder jaar kan (T-21). */
  birthDay: number | null;
  birthMonth: number | null;
  birthYear: number | null;
  /** Gaat nooit naar AI (§8.3.1). */
  note: string;
  /** Volgnummer; bepaalt `[LEERLING-n]` bij het afschermen (§12.5). */
  pseudonymSeed: number;
}
