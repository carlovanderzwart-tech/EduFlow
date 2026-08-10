/**
 * De reeks (§8.3.4).
 *
 * Een reeks is een ordening, geen eigenaar: documentaties verwijzen naar de
 * reeks, niet omgekeerd (§9.4). Het verwijderen van een reeks laat de
 * documentaties bestaan en maakt alleen hun verwijzing leeg (INV-20, B-35).
 *
 * `description` gaat als context mee bij de vervolgzin (B-04). Dat is de reden
 * dat het veld bestaat, en de reden dat er een grens van 500 tekens op staat.
 */

import type { BaseRecord, Colour } from "./base";

export interface Series extends BaseRecord {
  name: string;
  colour: Colour;
  description: string;
}
