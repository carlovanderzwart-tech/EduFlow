/**
 * Groep en lidmaatschap (§8.3.2, §8.3.3).
 *
 * De wortel van het aggregaat is `Group`; `GroupMembership` valt binnen die grens
 * (§9.4.3). Dat is een keuze met gevolgen, want je zou het lidmaatschap net zo
 * goed bij de leerling kunnen leggen. Het ligt bij de groep omdat de regels die
 * bewaakt moeten worden over de groep gaan: overlappende periodes binnen dezelfde
 * groep (INV-25), het afsluiten van alle lidmaatschappen bij een jaarovergang, en
 * het aantal leerlingen op een peildatum.
 *
 * Er is geen `studentIds` op een groep en geen `groupId` op een leerling. Beide
 * richtingen lopen uitsluitend via `GroupMembership` (U-07, B-16, INV-23).
 */

import type { BaseRecord, Colour, IsoDate, Uuid } from "./base";

export type GroupKind =
  | "stamgroep"
  | "combinatiegroep"
  | "projectgroep"
  | "zorggroep"
  | "instroomgroep"
  | "overig";

export interface Group extends BaseRecord {
  name: string;
  kind: GroupKind;
  /** Een groep hoort bij precies één schooljaar (INV-27). */
  schoolYearId: Uuid;
  colour: Colour;
}

export type MembershipRole = "lid" | "gast";

export interface GroupMembership extends BaseRecord {
  studentId: Uuid;
  groupId: Uuid;
  from: IsoDate;
  /** Leeg betekent lopend. Ligt nooit vóór `from` (INV-24). */
  to: IsoDate | null;
  role: MembershipRole;
}
